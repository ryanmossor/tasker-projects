import * as tasker from "../dev/tasker";
import { CheckinFields, CheckinJson, CheckinQueueItem } from "../dev/types";
import { habitsDailyReset, updateTrackedItemDates } from "../modules/habitFunctions";
import Logger from "../modules/logger";
import { rewardsDailyUpdate } from "../modules/rewardFunctions";
import { readJsonData, tryGetGlobal } from "../modules/utils";

try {
    const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
    const queueJson = readJsonData<CheckinQueueItem[]>({ filename: "checkinQueue.json" });
    const checkinFields: CheckinFields = JSON.parse(tryGetGlobal("CHECKIN_FIELDS"));
    const queueItem = queueJson.data.find((item) => item.checkinFields.date === checkinFields.date);

    if (queueItem != null) {
        checkinJson.data.habits = updateTrackedItemDates(queueItem, checkinJson.data.habits);
    } else {
        Logger.warning({ message: `Queue item not found for ${checkinFields.date}. Cannot update tracked habits.` });
    }

    // Update daysSince and pastWeek properties on tracked habits array
    checkinJson.data.habits = habitsDailyReset(checkinJson.data.habits);
    checkinJson.data.rewards.rewardList = rewardsDailyUpdate(checkinJson.data.rewards.rewardList);
    checkinJson.save();

    const vars = [
        "GYM",
        "NEW_DAY",
        "LOG_WEIGHT",
        "WORKOUT_DONE",
        "CHECKIN_FIELDS_SET",
        "EVENING_CHECKIN_COMPLETE",
        "MORNING_CHECKIN_COMPLETE",
        "DISTRACTION_RESET_COUNT",
        "DISTRACTION_RESET_TIME",
    ];

    for (const globalVar of vars) {
        tasker.setGlobal(globalVar, null);
    }

    tasker.writeFile(`/sdcard/Tasker/distraction-keys/${crypto.randomUUID()}`, btoa(crypto.randomUUID()), false);
} catch (error) {
    Logger.error({ message: `${error}`, funcName: "dailyReset" });
}
