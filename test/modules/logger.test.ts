import { Temporal } from "temporal-polyfill";
import Logger from "../../src/typescript/modules/logger";
import { notificationActions, notificationIcons } from "../../src/typescript/modules/sendNotification";
import * as tasker from "../../src/typescript/modules/tasker";

const baseLogMessage = {
    task: "Test",
    action: "1",
    message: "test message",
};

let taskerWriteFile;
let taskerPerformTask;

describe("logger", () => {
    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2023, 7, 22, 20, 25, 10, 0)); // Aug 22, 2023 (month is 0-indexed)
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        taskerPerformTask = vi.spyOn(tasker, "performTask").mockImplementation(() => true);
        taskerWriteFile = vi.spyOn(tasker, "writeFile").mockImplementation(() => {});

        vi.spyOn(tasker, "local").mockImplementation((str) => {
            if (str === "caller")
                return `task=${baseLogMessage.task}`;
            if (str === "tasker_current_action_number")
                return baseLogMessage.action;

            return "";
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should not log at level above current", () => {
        // arrange
        vi.spyOn(tasker, "global").mockImplementation(() => "ERROR");

        // act
        Logger.info({ message: baseLogMessage.message });

        // assert
        expect(taskerWriteFile).toHaveBeenCalledTimes(0);
    });

    it("should log at level equal to current", () => {
        // arrange
        vi.spyOn(tasker, "global").mockImplementation(() => "INFO");

        // act
        Logger.info({ message: baseLogMessage.message });

        // assert
        expect(taskerWriteFile).toHaveBeenCalledTimes(1);
        expect(taskerWriteFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), true);
    });

    it("should log at level below current", () => {
        // arrange
        vi.spyOn(tasker, "global").mockImplementation(() => "DEBUG");

        // act
        Logger.info({ message: baseLogMessage.message });

        // assert
        expect(taskerWriteFile).toHaveBeenCalledTimes(1);
        expect(taskerWriteFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), true);
    });

    ["ERROR", "WARNING"].forEach((level) => {
        it("should notify when log level above or equal to notification threshold", () => {
            // arrange
            vi.spyOn(tasker, "global").mockImplementation((varName: string) => {
                if (varName === "LOG_LEVEL")
                    return level;
                if (varName === "LOG_NOTIF_THRESHOLD")
                    return "WARNING";
            });

            const expectedNotifPayload = {
                title: `Log Message: ${baseLogMessage.task}`,
                text: `${baseLogMessage.message}`,
                priority: 5,
                category: "Log Warnings/Errors",
                icon: notificationIcons.xEyes,
                soundFile: "/sdcard/Notifications/silent.mp3",
                action1: {
                    label: "View Log",
                    action: {
                        name: notificationActions.viewFile,
                        par1: "/sdcard/Tasker/log/2023-08.txt",
                        par2: `Log Message: ${baseLogMessage.task}`,
                    },
                },
            };

            // act
            Logger[level.toLowerCase()]({ message: baseLogMessage.message });

            // assert
            expect(taskerWriteFile).toHaveBeenCalledTimes(1);
            expect(taskerPerformTask).toHaveBeenCalledTimes(1);
            expect(taskerPerformTask).toHaveBeenCalledWith("Send Notification", 101, expect.any(String));

            const [,, actualNotifPayload] = taskerPerformTask.mock.calls[0];
            expect(JSON.parse(actualNotifPayload)).toEqual(expectedNotifPayload);
        });
    });

    ["INFO", "DEBUG"].forEach((level) => {
        it("should not notify when log level below notification threshold", () => {
            // arrange
            vi.spyOn(tasker, "global").mockImplementation((varName: string) => {
                if (varName === "LOG_LEVEL")
                    return level;
                if (varName === "LOG_NOTIF_THRESHOLD")
                    return "WARNING";
            });

            // act
            Logger[level.toLowerCase()]({ message: baseLogMessage.message });

            // assert
            expect(taskerWriteFile).toHaveBeenCalledTimes(1);
            expect(taskerPerformTask).toHaveBeenCalledTimes(0);
        });
    });

    it("should log to default output file if none provided", () => {
        // arrange
        vi.spyOn(tasker, "global").mockImplementation(() => "INFO");

        // act
        Logger.info({ message: baseLogMessage.message });

        // assert
        expect(taskerWriteFile).toHaveBeenCalledWith("/sdcard/Tasker/log/2023-08.txt", expect.any(String), true);
    });

    it("should log to custom output file if provided", () => {
        // arrange
        vi.spyOn(tasker, "global").mockImplementation(() => "INFO");
        const logFile = "test.txt";

        // act
        Logger.info({ message: baseLogMessage.message, logFile });

        // assert
        expect(taskerWriteFile).toHaveBeenCalledWith(logFile, expect.any(String), true);
    });

    it("should write default log entry containing timestamp, action, task, and message", () => {
        // arrange
        const level = "INFO";
        vi.spyOn(tasker, "global").mockImplementation(() => level);

        const expectedLogMessage = {
            ...baseLogMessage,
            level,
            timestamp: Temporal.Now.plainDateTimeISO().toLocaleString(),
        };

        // act
        Logger.info({ message: baseLogMessage.message });

        // assert
        const [, actualLogMessage] = taskerWriteFile.mock.calls[0];
        expect(JSON.parse(actualLogMessage)).toEqual(expectedLogMessage);
        expect(taskerWriteFile).toHaveBeenCalledTimes(1);
        expect(taskerWriteFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), true);
    });

    it("should include function name in log message if provided", () => {
        // arrange
        const level = "INFO";
        vi.spyOn(tasker, "global").mockImplementation(() => level);
        const funcName = "testFunction";

        const expectedLogMessage = {
            ...baseLogMessage,
            level,
            funcName,
            timestamp: Temporal.Now.plainDateTimeISO().toLocaleString(),
        };

        // act
        Logger.info({ message: baseLogMessage.message, funcName });

        // assert
        const [, actualLogMessage] = taskerWriteFile.mock.calls[0];
        expect(JSON.parse(actualLogMessage)).toEqual(expectedLogMessage);
        expect(taskerWriteFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), true);
    });
});
