import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { assert } from "./assert";
import { DATE_TIME_LOCALE } from "./constants";
import Logger from "./logger";

export function capitalize(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

/**
 * Checks whether an object, array, or string is null, empty, or whitespace-only.
 * **NOTE:** does not support evaluating a {@link Set} or a {@link Map}.
 * @param {any} item - Item to evaluate
 * @returns {boolean} `true` if `item` is empty; `false` otherwise
 */
export function isNullOrEmpty(item: any): boolean {
    if (item == null) {
        return true;
    }
    if (typeof item === "string") {
        return item.trim() === "" || item === "undefined"; // readFile returns "undefined" for non-existent files
    }
    if (Array.isArray(item) || typeof item === "object") {
        return !Object.entries(item).length;
    }
    return false;
}

export function pull<T>(arr: T[], ...removeList: T[]): T[] {
    const removeSet = new Set(removeList);
    return arr.filter((el) => !removeSet.has(el));
}

export function sample<T>(arr: T[]): T | undefined {
    const len = arr == null ? 0 : arr.length;
    return len ? arr[Math.floor(Math.random() * len)] : undefined;
}

export function shuffle<T>(arr: T[]): T[] {
    const shuffledArr = arr;
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return shuffledArr;
}

export function uniq<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

function tryGetTaskerVar(varName: string, type: "global" | "local"): string {
    try {
        const result = type === "global" ? tasker.global(varName) : tasker.local(varName);
        assert(!isNullOrEmpty(result) && result !== "{}" && result !== "[]", `${type} variable ${varName} is empty`);

        return result;
    } catch (error) {
        Logger.error({ message: error });
        tasker.exit();
    }
}

/**
 * Attempts to get value of local Tasker variable `varName`. Stops code execution if variable is null/empty,
 * so use only if null/empty should cause a program failure.
*/
export function tryGetLocal(varName: string): string {
    return tryGetTaskerVar(varName, "local");
}

/**
 * Attempts to get value of global Tasker variable `varName`. Stops code execution if variable is null/empty,
 * so use only if null/empty should cause a program failure.
*/
export function tryGetGlobal(varName: string): string {
    return tryGetTaskerVar(varName, "global");
}

/** @returns {boolean} */
export function isEnvTasker(): boolean {
    return tasker.global("SDK") !== "";
}

export class JsonData<T> {
    constructor(public data: T, private path: string) { }

    /**
     * Saves JSON data to file
     * @param {Object} [options]
     * @param {boolean} [options.prettyPrint] - Whether to print JSON file with 4-space indenting. Default: `true`
     */
    public save({ prettyPrint }: { prettyPrint?: boolean; } = { prettyPrint: true }): void {
        if (tasker.global("DRY_RUN") !== "1") {
            tasker.writeFile(this.path, JSON.stringify(this.data, null, prettyPrint ? 4 : 0), false);
        } else {
            tasker.flash("Dry run -- save skipped");
        }
    }
}

/**
 * Parses JSON data from a local file. Looks for `filename` in `/sdcard/Tasker/json` if path not included in `filename`.
 * @param {Object} options
 * @param {string} options.filename - Name of the JSON file to get. `.json` extension will be applied if not provided.
 * @returns {JsonData<T>} Object containing parsed JSON data and `save()` function to persist updates to JSON data.
 */
export function readJsonData<T>({ filename }: { filename: string }): JsonData<T> {
    try {
        let path = filename.includes("/") ? filename : `${tasker.global("JSON_PATH")}/${filename}`;
        if (!filename.endsWith(".json")) {
            path = `${path}.json`;
        }

        const json: string = tasker.readFile(path);
        assert(!isNullOrEmpty(json), `JSON file ${path} should not be empty`);
        const data: T = JSON.parse(json);

        return new JsonData<T>(data, path);
    } catch (error) {
        Logger.error({ message: error, funcName: readJsonData.name });
        tasker.exit();
        throw error;
    }
}

export function formatDateTime(
    input: string | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime,
    formatStr: string,
): string {
    try {
        const date = Temporal.PlainDateTime.from(input);
        const amOrPm = date.hour >= 12 ? "PM" : "AM";

        let result = formatStr;
        if (formatStr.includes("h") && date.hour === 0) {
            result = result
                .replaceAll("hh", String(12))
                .replaceAll("h", String(12));
        } else {
            result = result
                .replaceAll("hh", String((date.hour > 12 ? date.hour - 12 : date.hour)).padStart(2, "0"))
                .replaceAll("h", String((date.hour > 12 ? date.hour - 12 : date.hour)));
        }

        return result
            .replaceAll("HH", String(date.hour).padStart(2, "0"))
            .replaceAll("H", String(date.hour))
            .replaceAll("mm", String(date.minute).padStart(2, "0"))
            .replaceAll("m", String(date.minute))
            .replaceAll("ss", String(date.second).padStart(2, "0"))
            .replaceAll("s", String(date.second))
            .replaceAll("A", amOrPm)
            .replaceAll("a", amOrPm.toLowerCase())
            .replaceAll("YYYY", date.toLocaleString(DATE_TIME_LOCALE, { year: "numeric" }))
            .replaceAll("YY", date.toLocaleString(DATE_TIME_LOCALE, { year: "2-digit" }))
            .replaceAll("DDDD", date.toLocaleString(DATE_TIME_LOCALE, { weekday: "long" }))
            .replaceAll("DDD", date.toLocaleString(DATE_TIME_LOCALE, { weekday: "short" }))
            .replaceAll("DD", date.toLocaleString(DATE_TIME_LOCALE, { day: "2-digit" }))
            .replaceAll("D", date.toLocaleString(DATE_TIME_LOCALE, { day: "numeric" }))
            .replaceAll("MMMM", date.toLocaleString(DATE_TIME_LOCALE, { month: "long" }))
            .replaceAll("MMM", date.toLocaleString(DATE_TIME_LOCALE, { month: "short" }))
            .replaceAll("MM", date.toLocaleString(DATE_TIME_LOCALE, { month: "2-digit" }));
    } catch (error) {
        Logger.error({ message: error, funcName: formatDateTime.name });
        tasker.exit();
        throw error;
    }
}

export function unixToDateTime(unixTs: number, timeZone: string): Temporal.PlainDateTime {
    if (isNullOrEmpty(unixTs)) {
        const error = new Error("Unix timestamp cannot be null");
        Logger.error({ message: error, funcName: unixToDateTime.name });
        tasker.exit();
        throw error;
    }

    const instant = Temporal.Instant.fromEpochSeconds(unixTs);
    return instant.toZonedDateTimeISO(timeZone).toPlainDateTime();
}
