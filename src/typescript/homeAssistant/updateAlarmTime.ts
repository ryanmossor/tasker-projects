import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import { formatDateTime, isEnvTasker, tryGetGlobal } from "../modules/utils";

async function updateAlarmTime(): Promise<void> {
    const alarmTime = Temporal.Now.plainDateTimeISO().add({ minutes: 50 });
    const body = {
        "state": formatDateTime(alarmTime, "YYYY-MM-DD HH:mm:ss"),
        "attributes": {
            "has_date": true,
            "has_time": true,
            "editable": true,
            "year": alarmTime.year,
            "month": alarmTime.month,
            "day": alarmTime.day,
            "hour": alarmTime.hour,
            "minute": alarmTime.minute,
            "second": 0,
            "timestamp": Temporal.Now.instant().add({ minutes: 50 }).epochSeconds,
            "icon": "mdi:alarm",
            "friendly_name": "Ryan's Alarm",
        },
    };

    try {
        await Http.post({
            url: `${tryGetGlobal("HA_URL")}/states/input_datetime.ryan_alarm`,
            body,
            headers: {
                "Authorization": `Bearer ${tryGetGlobal("HA_TOKEN")}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: updateAlarmTime.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    updateAlarmTime();
}
