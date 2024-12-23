import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { CheckinFields, CheckinJson, CheckinQueueItem, Habit } from "../dev/types";
import { assert } from "../modules/assert";
import { updateLastHabitDate } from "../modules/habitFunctions";
import Logger from "../modules/logger";
import { isEnvTasker, readJsonData, tryGetGlobal, tryGetLocal, unixToDateTime } from "../modules/utils";

/**
 * Updates `lastDate` and `pastWeek` properties of `sleepHabit` object if sleep target(s) met
 * @param sleepHabit - {@link Habit} object where `name` is `"sleep"`
 * @param queueItem - Today's {@link CheckinQueueItem}
 * @param targetBedtime - Formatted as `HH:mm`
 * @param targetWakeTime - Formatted as `HH:mm`
 * @param startOrEnd - Valid values: `'Start'`, `'End'`
 * @param required - Number of target sleep times required for success. `1` for start OR end, `2` for start AND end
 * @returns `sleepHabit` object with `lastDate` and `pastWeek` properties updated, if sleep target met
 */
export function updateSleepHabit({ sleepHabit, queueItem, targetBedtime, targetWakeTime, startOrEnd, required }: {
    sleepHabit: Habit,
    queueItem: CheckinQueueItem,
    targetBedtime: string,
    targetWakeTime: string,
    startOrEnd: "Start" | "End",
    required: number,
}): Habit {
    const checkinDate = queueItem.checkinFields.date;
    if ((required === 2 && startOrEnd === "Start") || sleepHabit.pastWeek.includes(checkinDate)) {
        return sleepHabit;
    }

    // unixToDateTime returns 1/1/1970 if sleepStart/End is null, guaranteeing target times will always be met.
    // Fallback is in distant future to prevent this.
    const fallbackDateTime = Temporal.PlainDateTime.from("9999-12-31 23:59:59");

    const actualBedtime = queueItem.sleepStart == null
        ? fallbackDateTime
        : unixToDateTime(queueItem.sleepStart, queueItem.timeZoneId);
    const targetBedtimeDt = Temporal.PlainDateTime.from(`${checkinDate} ${targetBedtime}:00`);

    Logger.debug({
        message: `Comparing actual and target bedtimes for ${checkinDate}`,
        properties: { actual: actualBedtime.toString(), target: targetBedtimeDt.toString() },
    });

    let successCount = 0;
    if (Temporal.PlainDateTime.compare(actualBedtime, targetBedtimeDt) === -1) {
        successCount += 1;
    }

    if (startOrEnd === "End") {
        const actualWakeTime = queueItem.sleepEnd == null
            ? fallbackDateTime
            : unixToDateTime(queueItem.sleepEnd, queueItem.timeZoneId);
        const checkinNextMorning = Temporal.PlainDate.from(checkinDate).add({ days: 1 });
        const targetWakeTimeDt = Temporal.PlainDateTime.from(`${checkinNextMorning} ${targetWakeTime}:00`);

        Logger.debug({
            message: `Comparing actual and target wake times for ${checkinDate}`,
            properties: { actual: actualWakeTime.toString(), target: targetWakeTimeDt.toString() },
        });

        if (Temporal.PlainDateTime.compare(actualWakeTime, targetWakeTimeDt) === -1) {
            successCount += 1;
        }
    }

    if (successCount >= required) {
        return updateLastHabitDate(sleepHabit, checkinDate);
    }

    return sleepHabit;
}

/**
 * Sets unix and formatted (`hh:mm:00 A`) times for start or end of sleep, based on value passed to `startOrEnd` parameter.
 * @param queueItem - {@link CheckinQueueItem} to be modified
 * @param startOrEnd - Valid values: `'Start'`, `'End'`
 * @param now - Current time as {@link Temporal.ZonedDateTime}
 * @returns `queueItem` with sleep start or end time updated
 */
export function setSleepTime({ queueItem, startOrEnd, now }: {
    queueItem: CheckinQueueItem,
    startOrEnd: "Start" | "End",
    now: Temporal.ZonedDateTime,
}): CheckinQueueItem {
    try {
        assert(startOrEnd === "Start" || startOrEnd === "End", "par1 must be Start or End");
        assert(queueItem != null, "Queue item must not be null");
        assert(queueItem[`sleep${startOrEnd}`] == null, `sleep${startOrEnd} time already exists for date`);

        const unix = now.epochSeconds;

        Logger.info({
            message: `Set sleep${startOrEnd} time to ${unix}`,
            logFile: `/sdcard/Tasker/log/sleep/${now.toPlainYearMonth()}.txt`,
        });

        if (startOrEnd === "Start") {
            queueItem.sleepStart = unix;
        } else {
            queueItem.sleepEnd = unix;
        }

        return queueItem;
    } catch (error) {
        Logger.error({ message: error, funcName: setSleepTime.name });
        tasker.exit();
        return null;
    }
}

if (isEnvTasker()) {
    try {
        const { date: checkinDate }: CheckinFields = JSON.parse(tryGetGlobal("CHECKIN_FIELDS"));
        const startOrEnd = tryGetLocal("par1") as "Start" | "End";

        const queueJson = readJsonData<CheckinQueueItem[]>({ filename: "checkinQueue.json" });
        let queueItem = queueJson.data.find((x) => x.checkinFields.date === checkinDate);

        queueItem = setSleepTime({ queueItem, startOrEnd, now: Temporal.Now.zonedDateTimeISO() });
        queueJson.save();

        const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
        let sleepHabit: Habit = checkinJson.data.habits.find((h) => h.name === "sleep");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sleepHabit = updateSleepHabit({
            sleepHabit,
            queueItem,
            targetBedtime: tryGetGlobal("TARGET_BEDTIME"),
            targetWakeTime: tryGetGlobal("TARGET_WAKE_TIME"),
            startOrEnd,
            required: Number(tryGetGlobal("SLEEP_TARGETS_REQUIRED") ?? 2),
        });

        checkinJson.save();
    } catch (error) {
        Logger.error({ message: error });
    } finally {
        tasker.exit();
    }
}
