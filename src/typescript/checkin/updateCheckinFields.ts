import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { CheckinFields } from "../dev/types";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import { formatDateTime } from "../modules/utils";

const today = Temporal.Now.plainDateISO();

const checkinFields: CheckinFields = {
    spreadsheetName: `[Tasker] ${today.year} Daily Tracker`,
    date: today.toString(),
    month: formatDateTime(today, "MMM"),
    cellReference: `${CHECKIN_COLUMN_MAPPING[today.day.toString()]}1`,
};

tasker.setGlobal("CHECKIN_FIELDS", JSON.stringify(checkinFields));
tasker.setGlobal("CHECKIN_FIELDS_SET", "1");
