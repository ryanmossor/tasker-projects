import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import { formatDateTime, isEnvTasker, tryGetGlobal } from "../modules/utils";

export type TodayInfo = {
    daysInMonth: number;
    monthOfYear: string;
    monthAbbr: string;
    month: string;
    uppercaseMonth: string;
    spreadsheetId: string;
    cellReference: string;
    subtractDays: number;
};

export function getTodayInfo(): TodayInfo {
    const now = Temporal.Now.plainDateISO();
    const columnKey = now.daysInMonth + 1 > 31
        ? 31
        : now.daysInMonth + 1;

    const todayInfo = {
        daysInMonth: now.daysInMonth,
        monthOfYear: now.month.toString(),
        monthAbbr: formatDateTime(now, "MMM"),
        month: formatDateTime(now, "MMMM"),
        uppercaseMonth: formatDateTime(now, "MMMM").toUpperCase(),
        spreadsheetId: tryGetGlobal("CHECKIN_SHEET_ID"),
        cellReference: `${CHECKIN_COLUMN_MAPPING[columnKey]}999`,
        subtractDays: 31 - now.daysInMonth,
    };

    return todayInfo;
}

if (isEnvTasker()) {
    const todayInfo = getTodayInfo();
    tasker.setLocal("today_json", JSON.stringify(todayInfo));
}
