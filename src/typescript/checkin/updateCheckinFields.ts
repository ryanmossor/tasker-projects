import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { CheckinFields, SpreadsheetInfo } from "../dev/types";
import { assert } from "../modules/assert";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import Logger from "../modules/logger";
import { formatDateTime, isEnvTasker, tryGetGlobal } from "../modules/utils";

function updateCheckinFields() {
    try {
        const prevDate = (JSON.parse(tryGetGlobal("CHECKIN_FIELDS")) as CheckinFields).date;
        const today = Temporal.PlainDate.from(prevDate).add({ days: 1 });

        const checkinSheetInfo: SpreadsheetInfo = JSON.parse(tryGetGlobal("CHECKIN_SHEET"));
        assert(checkinSheetInfo.year === today.year, "Check-in sheet ID not up to date");

        const checkinFields: CheckinFields = {
            date: today.toString(),
            month: formatDateTime(today, "MMM"),
            cellReference: `${CHECKIN_COLUMN_MAPPING[today.day.toString()]}1`,
            spreadsheetId: checkinSheetInfo.spreadsheetId,
        };

        tasker.setGlobal("CHECKIN_FIELDS", JSON.stringify(checkinFields));
        tasker.setGlobal("CHECKIN_FIELDS_SET", "1");
    } catch (error) {
        Logger.error({ message: error.message, funcName: updateCheckinFields.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    updateCheckinFields();
}
