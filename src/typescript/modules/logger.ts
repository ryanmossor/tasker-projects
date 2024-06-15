import { Temporal } from "temporal-polyfill";
import { LogMessage, LogParams } from "../types/types";
import { notificationActions, notificationIcons, sendNotification } from "./sendNotification";
import * as tasker from "./tasker";

const LOG_LEVEL = {
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4,
} as const;

function isNullOrWhitespace(str: string): boolean {
    return str == null || str.trim() === "";
}

/** Tasker Logger */
export default class Logger {
    private static notifThreshold: string = isNullOrWhitespace(tasker.global("LOG_NOTIF_THRESHOLD"))
        ? "WARNING"
        : tasker.global("LOG_NOTIF_THRESHOLD");

    /**
     * Writes JSON-formatted log messages to a file.
     * @param {LogParams} options
     * @param {LogLevel} options.level - Log level
     * @param {string | Error} options.message - Log message
     * @param {any} [options.logFile] - Log file path. Default: `/sdcard/Tasker/log/{YYYY-MM}.txt`
     * @param {any} [options.properties] - Additional properties (e.g., arrays, JSON objects)
     * @param {string} [options.funcName] - Name of function logger was called from
     */
    private static log({ level, message, logFile, properties, funcName }: LogParams) {
        if (!(message instanceof Error) && isNullOrWhitespace(message)) {
            return;
        }

        const logLevel = isNullOrWhitespace(tasker.global("LOG_LEVEL")) ? "INFO" : tasker.global("LOG_LEVEL");
        if (LOG_LEVEL[level] > LOG_LEVEL[logLevel]) {
            return;
        }

        const logMessage: LogMessage = {
            level,
            timestamp: Temporal.Now.plainDateTimeISO().toLocaleString(),
            task: tasker.local("caller").replace("task=", ""),
            action: tasker.local("tasker_current_action_number"),
            message: `${message}`,
        };

        // don't like this but it prevents dependency cycle by not having to import HttpError type
        if (message instanceof Error && message.name === "HttpError" && "properties" in message) {
            logMessage.properties = message.properties;
        } else if (properties != null && JSON.stringify(properties) !== "{}") {
            logMessage.properties = properties;
        }

        if (!isNullOrWhitespace(funcName)) {
            logMessage.funcName = funcName;
        }

        const outputFile = logFile ?? `/sdcard/Tasker/log/${Temporal.Now.plainDateISO().toPlainYearMonth()}.txt`;
        tasker.writeFile(outputFile, `${JSON.stringify(logMessage, null, 4)}\n`, true);

        if (LOG_LEVEL[level] <= LOG_LEVEL[this.notifThreshold]) {
            const notifTitle = `Log Message: ${logMessage.task}`;
            sendNotification({
                title: notifTitle,
                text: `${logMessage.message}`,
                icon: notificationIcons.xEyes,
                priority: 5,
                category: "Log Warnings/Errors",
                action1: {
                    label: "View Log",
                    action: {
                        name: notificationActions.viewFile,
                        par1: outputFile,
                        par2: notifTitle,
                    },
                },
            });
        }
    }

    public static error({ message, logFile, properties, funcName }: Omit<LogParams, "level">) {
        this.log({ level: "ERROR", message, logFile, properties, funcName });
    }

    public static warning({ message, logFile, properties, funcName }: Omit<LogParams, "level">) {
        this.log({ level: "WARNING", message, logFile, properties, funcName });
    }

    public static info({ message, logFile, properties, funcName }: Omit<LogParams, "level">) {
        this.log({ level: "INFO", message, logFile, properties, funcName });
    }

    public static debug({ message, logFile, properties, funcName }: Omit<LogParams, "level">) {
        this.log({ level: "DEBUG", message, logFile, properties, funcName });
    }

    public static trace({ message, logFile, properties, funcName }: Omit<LogParams, "level">) {
        this.log({ level: "TRACE", message, logFile, properties, funcName });
    }
}
