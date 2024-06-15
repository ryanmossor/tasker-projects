import { LogMessage, NotificationPayload } from "../types/types";
import * as tasker from "./tasker";

function isNullOrWhitespace(str: string): boolean {
    return str == null || str.trim() === "" || str === "undefined";
}

function dirname(path: string): string {
    const parts = path.split("/");
    if (parts.length > 1) {
        parts.pop();
    }
    return parts.join("/");
}

function handleError(error: Error): void {
    const logMessage: LogMessage = {
        level: "ERROR",
        timestamp: new Date().toLocaleString(),
        task: tasker.local("caller").replace("task=", ""),
        action: tasker.local("tasker_current_action_number"),
        message: `${error}`,
    };

    const logPath = "/sdcard/Tasker/log/import_log.txt";
    tasker.writeFile(logPath, `${JSON.stringify(logMessage, null, 4)}\n`, true);

    const title = `Log Message: ${logMessage.task}`;
    const notifPayload: NotificationPayload = {
        title,
        text: `${logMessage.message}`,
        icon: "android.resource://net.dinglisch.android.taskerm/drawable/mw_social_sentiment_very_dissatisfied",
        priority: 5,
        category: "Log Warnings/Errors",
        action1: {
            label: "View Log",
            action: { name: "View File", par1: logPath, par2: title },
        },
    };

    if (!tasker.performTask("Send Notification", 101, JSON.stringify(notifPayload))) {
        tasker.flashLong(`${error}`); // flash error if "Send Notification" task doesn't exist
    }
}

// @ts-ignore
function require(moduleName: string) {
    try {
        if ((moduleName in require.cache)) {
            return require.cache[moduleName].exports;
        }

        const path = `${dirname(tasker.global("CommonJS"))}/${moduleName}.js`;
        const src: string = tasker.readFile(path);
        if (isNullOrWhitespace(src)) {
            throw new Error(`Could not load ${moduleName} from ${path}`);
        }

        const module = { exports: {} };
        require.cache[moduleName] = module;

        const wrapper = Function("require, exports, module", src);
        wrapper(require, module.exports, module);

        return require.cache[moduleName].exports;
    } catch (error) {
        handleError(error);
        tasker.exit();
    }
}

require.cache = Object.create(null);
const module = { exports: {} };
// @ts-ignore
const { exports } = module;
