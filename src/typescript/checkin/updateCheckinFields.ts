import { Temporal } from "temporal-polyfill";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import Tasker from "../modules/tasker";
import { formatDateTime } from "../modules/utils";
import { CheckinFields } from "../types/types";

const today = Temporal.Now.plainDateISO();

const checkinFields: CheckinFields = {
    spreadsheetName: `[Tasker] ${today.year} Daily Tracker`,
    date: today.toString(),
    month: formatDateTime(today, "MMM"),
    cellReference: `${CHECKIN_COLUMN_MAPPING[today.day.toString()]}1`,
};

Tasker.setGlobal("CHECKIN_FIELDS", JSON.stringify(checkinFields));
Tasker.setGlobal("CHECKIN_FIELDS_SET", "1");
