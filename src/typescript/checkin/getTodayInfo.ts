import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { SpreadsheetInfo } from "../dev/types";
import { assert } from "../modules/assert";
import { CHECKIN_COLUMN_MAPPING } from "../modules/constants";
import Logger from "../modules/logger";
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
    try {
        const now = Temporal.Now.plainDateISO();
        const columnKey = now.daysInMonth + 1 > 31
            ? 31
            : now.daysInMonth + 1;

        const checkinSheetInfo: SpreadsheetInfo = JSON.parse(tryGetGlobal("CHECKIN_SHEET"));
        assert(checkinSheetInfo.year === now.year, "Check-in sheet ID not up to date");

        const todayInfo = {
            daysInMonth: now.daysInMonth,
            monthOfYear: now.month.toString(),
            monthAbbr: formatDateTime(now, "MMM"),
            month: formatDateTime(now, "MMMM"),
            uppercaseMonth: formatDateTime(now, "MMMM").toUpperCase(),
            spreadsheetId: checkinSheetInfo.spreadsheetId,
            cellReference: `${CHECKIN_COLUMN_MAPPING[columnKey]}999`,
            subtractDays: 31 - now.daysInMonth,
        };

        return todayInfo;
    } catch (error) {
        Logger.error({ message: error, funcName: getTodayInfo.name });
        tasker.exit();
    }
}

if (isEnvTasker()) {
    const todayInfo = getTodayInfo();
    tasker.setLocal("today_json", JSON.stringify(todayInfo));
}
