import { Temporal } from "temporal-polyfill";
import assert from "../modules/assert";
import Logger from "../modules/logger";
import Tasker from "../modules/tasker";
import { formatDateTime, isEnvTasker, readJsonData, tryGetGlobal, tryGetLocal } from "../modules/utils";
import { CheckinFields, CheckinJson, CheckinQueueItem, Habit } from "../types/types";

/**
 * Updates `lastDate` and `pastWeek` properties of `sleepHabit` object if sleep target was met
 * @param sleepHabit - {@link Habit} object where `name` is `"sleep"`
 * @param checkinDate - `YYYY-MM-DD` format
 * @param targetStartTime - Formatted as `HH:mm`
 * @param targetEndTime - Formatted as `HH:mm`
 * @param startOrEnd - Valid values: `'Start'`, `'End'`
 * @param now - Current time as {@link Temporal.ZonedDateTime}
 * @returns `sleepHabit` object with `lastDate` and `pastWeek` properties updated, if sleep target met
 */
export function updateSleepHabit({ sleepHabit, checkinDate, targetStartTime, targetEndTime, startOrEnd, now }: {
    sleepHabit: Habit,
    checkinDate: string,
    targetStartTime: string,
    targetEndTime: string,
    startOrEnd: "Start" | "End",
    now: Temporal.ZonedDateTime,
}): Habit {
    if (sleepHabit.pastWeek.includes(checkinDate)) {
        return sleepHabit;
    }

    let isBeforeTargetStart = false;
    let isBeforeTargetEnd = false;

    if (startOrEnd === "Start") {
        const targetStart = Temporal.PlainDateTime.from(`${checkinDate} ${targetStartTime}:00`);
        isBeforeTargetStart = Temporal.PlainDateTime.compare(now.toPlainDateTime(), targetStart) === -1;
    } else {
        const checkinNextMorning = Temporal.PlainDate.from(checkinDate).add({ days: 1 });
        const targetEnd = Temporal.PlainDateTime.from(`${checkinNextMorning} ${targetEndTime}:00`);
        isBeforeTargetEnd = Temporal.PlainDateTime.compare(now.toPlainDateTime(), targetEnd) === -1;
    }

    if (isBeforeTargetStart || isBeforeTargetEnd) {
        sleepHabit.lastDate = checkinDate;
        sleepHabit.pastWeek.push(checkinDate);
    }

    return sleepHabit;
}

/**
 * Sets unix and formatted (`h:mm:00 A`) times for start or end of sleep, based on value passed to `startOrEnd` parameter.
 * @param queueItem - {@link CheckinQueueItem} to be modified
 * @param checkinDate - `YYYY-MM-DD` format
 * @param startOrEnd - Valid values: `'Start'`, `'End'`
 * @param now - Current time as {@link Temporal.ZonedDateTime}
 * @returns `queueItem` with sleep start or end time updated
 */
export function setSleepTime({ queueItem, checkinDate, startOrEnd, now }: {
    queueItem: CheckinQueueItem,
    checkinDate: string,
    startOrEnd: "Start" | "End",
    now: Temporal.ZonedDateTime,
}): CheckinQueueItem {
    try {
        assert(startOrEnd === "Start" || startOrEnd === "End", "par1 must be Start or End");
        assert(queueItem != null, `No queue item found for ${checkinDate}`);
        assert(queueItem[`sleep${startOrEnd}`] == null, `sleep${startOrEnd} time already exists for ${checkinDate}`);

        const formatted = formatDateTime(now, "h:mm:00 A");
        const unix = now.epochSeconds;

        Logger.info({
            message: `Set sleep${startOrEnd} time to ${formatted} (unix: ${unix})`,
            logFile: `/sdcard/Tasker/log/sleep/${now.toPlainYearMonth()}.txt`,
            funcName: setSleepTime.name,
        });

        if (startOrEnd === "Start") {
            queueItem.formResponse.Bedtime = formatted;
            queueItem.sleepStart = unix;
        } else {
            queueItem.formResponse["Wake-up time"] = formatted;
            queueItem.sleepEnd = unix;
        }

        return queueItem;
    } catch (error) {
        Logger.error({ message: error, funcName: setSleepTime.name });
        Tasker.exit();
        return null;
    }
}

if (isEnvTasker()) {
    try {
        const now = Temporal.Now.zonedDateTimeISO();
        const { date: checkinDate }: CheckinFields = JSON.parse(tryGetGlobal("CHECKIN_FIELDS"));
        const startOrEnd = tryGetLocal("par1") as "Start" | "End";

        const queueJson = readJsonData<CheckinQueueItem[]>({ filename: "checkinQueue.json" });
        let queueItem = queueJson.data.find((x) => x.checkinFields.date === checkinDate);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queueItem = setSleepTime({ checkinDate, queueItem, startOrEnd, now });
        queueJson.save();

        const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
        let sleepHabit: Habit = checkinJson.data.habits.find((h) => h.name === "sleep");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sleepHabit = updateSleepHabit({
            sleepHabit,
            checkinDate,
            targetStartTime: tryGetGlobal("SLEEP_START_TARGET"),
            targetEndTime: tryGetGlobal("SLEEP_END_TARGET"),
            startOrEnd,
            now,
        });
        checkinJson.save();
    } catch (error) {
        Logger.error({ message: error });
    } finally {
        Tasker.exit();
    }
}
