import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { CheckinFields } from "../dev/types";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import { formatDateTime, tryGetGlobal } from "../modules/utils";

const prevDate = (JSON.parse(tryGetGlobal("CHECKIN_FIELDS")) as CheckinFields).date;
const today = Temporal.PlainDate.from(prevDate).add({ days: 1 });

const checkinFields: CheckinFields = {
    date: today.toString(),
    month: formatDateTime(today, "MMM"),
    cellReference: `${CHECKIN_COLUMN_MAPPING[today.day.toString()]}1`,
    spreadsheetId: tryGetGlobal("CHECKIN_SHEET_ID"),
};

tasker.setGlobal("CHECKIN_FIELDS", JSON.stringify(checkinFields));
tasker.setGlobal("CHECKIN_FIELDS_SET", "1");
