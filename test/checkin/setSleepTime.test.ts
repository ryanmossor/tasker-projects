import { Temporal } from "temporal-polyfill";
import { parseTime, setSleepTime, updateSleepHabit } from "../../src/typescript/checkin/setSleepTime";
import { CheckinQueueItem, Habit } from "../../src/typescript/dev/types";
import * as utils from "../../src/typescript/modules/utils";

const baseQueueJson: CheckinQueueItem[] = [{
    checkinFields: {
        spreadsheetId: "sheetId",
        date: "2024-05-07",
        month: "May",
        cellReference: "cell",
    },
    formResponse: { "habit1": "1" },
}];
const path = "/path/to/file.json";

describe("setSleepTime", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("parseTime", () => {
        test.each([
            "12:34:56 AM",
            "12:34:56 PM",
        ])("should remove AM/PM from time", (time) => {
            // arrange & act
            const result = parseTime(time);

            // assert
            expect(result).toBe("12:34:56");
        });

        test.each([
            { time: "05:30:00 AM", expectedResult: "05:30:00" },
            { time: "09:30:00 PM", expectedResult: "21:30:00" },
        ])("should convert 'hh:mm:ss A' format to 'HH:mm:ss' format", ({ time, expectedResult }) => {
            // arrange & act
            const result = parseTime(time);

            // assert
            expect(result).toBe(expectedResult);
        });
    });

    describe("setSleepTime", () => {
        it("should set sleep start time", () => {
            // arrange
            const queueJson = structuredClone(baseQueueJson);
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-07T20:40:17.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "Start",
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result.sleepStart).toBe(1715132417);
            expect(result.formResponse.Bedtime).toBe("08:40:00 PM");
        });

        it("should set sleep end time", () => {
            // arrange
            const queueJson = [{
                ...structuredClone(baseQueueJson[0]),
                sleepStart: 1234567890,
            }];
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-08T04:56:13.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "End",
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result.sleepEnd).toBe(1715162173);
            expect(result.formResponse["Wake-up time"]).toBe("04:56:00 AM");
        });

        it("should do nothing if null queueItem provided", () => {
            // arrange
            const queueJson = structuredClone(baseQueueJson);
            queueJson[0].checkinFields.date = "2024-05-10";
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-10T04:56:13.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "End",
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: null,
            });

            // assert
            expect(result).toBeNull();
        });

        it("should do nothing if start time already exists for current date", () => {
            // arrange
            const queueJson = [{
                ...structuredClone(baseQueueJson[0]),
                sleepStart: 1234567890,
            }];
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-07T04:56:13.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "Start",
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result).toBeNull();
        });

        it("should return null if end time already exists for current date", () => {
            // arrange
            const queueJson = [{
                ...structuredClone(baseQueueJson[0]),
                sleepStart: 1234567890,
                sleepEnd: 2345678901,
            }];
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-07T04:56:13.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "End",
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result).toBeNull();
        });
    });

    describe("updateSleepHabit", () => {
        const baseSleepHabit: Habit = Object.freeze({
            name: "sleep",
            lastDate: "2024-05-06",
            daysSince: 2,
            pastWeek: [
                "2024-05-01",
                "2024-05-03",
                "2024-05-04",
                "2024-05-05",
                "2024-05-06",
            ],
            weeklyTarget: 4,
        });

        const targetBedtime = "21:30";
        const targetWakeTime = "05:30";

        it("should return sleep habit with no changes if recording Start with start AND end required", () => {
            // arrange & act
            const result = updateSleepHabit({
                sleepHabit: structuredClone(baseSleepHabit),
                queueItem: baseQueueJson[0],
                targetBedtime,
                targetWakeTime,
                startOrEnd: "Start",
                required: 2,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result).toStrictEqual(baseSleepHabit);
        });

        it("should return sleep habit with no changes if date already appears in sleep habit object", () => {
            // arrange
            const sleepHabit = structuredClone(baseSleepHabit);
            sleepHabit.pastWeek.push(baseQueueJson[0].checkinFields.date);

            // act
            const result = updateSleepHabit({
                sleepHabit,
                queueItem: baseQueueJson[0],
                targetBedtime,
                targetWakeTime,
                startOrEnd: "Start",
                required: 2,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result.pastWeek.length).toBe(baseSleepHabit.pastWeek.length + 1);
        });

        test.each([
            { bedtime: "08:59:00 PM", wakeTime: "06:00:00" },
            { bedtime: "10:59:00 PM", wakeTime: "04:55:00" },
        ])("should not update sleep habit when only target bedtime OR wake time met with both required", ({ bedtime, wakeTime }) => {
            // arrange
            const queueItem = structuredClone(baseQueueJson[0]);
            queueItem.formResponse.Bedtime = bedtime;
            queueItem.formResponse["Wake-up time"] = wakeTime;

            Date.now = vi.fn().mockReturnValue(new Date(`2024-05-08T${wakeTime}.000`)); // called by Temporal

            // act
            const result = updateSleepHabit({
                sleepHabit: structuredClone(baseSleepHabit),
                queueItem,
                targetBedtime,
                targetWakeTime,
                startOrEnd: "End",
                required: 2,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result).toStrictEqual(baseSleepHabit);
        });

        it("should update sleep habit when target bedtime met with only 1 required", () => {
            // arrange
            const mockCurrentTime = "09:29:00";

            const sleepHabit = structuredClone(baseSleepHabit);
            const queueItem = structuredClone(baseQueueJson[0]);
            queueItem.formResponse.Bedtime = `${mockCurrentTime} PM`;

            Date.now = vi.fn().mockReturnValue(new Date(`${queueItem.checkinFields.date}T${mockCurrentTime}.000`)); // called by Temporal

            // act
            const result = updateSleepHabit({
                sleepHabit,
                queueItem,
                targetBedtime,
                targetWakeTime,
                startOrEnd: "Start",
                required: 1,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result.lastDate).toBe(baseQueueJson[0].checkinFields.date);
            expect(result.pastWeek.length).toBe(baseSleepHabit.pastWeek.length + 1);
            expect(result.pastWeek).toContain(baseQueueJson[0].checkinFields.date);
        });

        it("should update sleep habit when target wake time met with only 1 required", () => {
            // arrange
            const mockCurrentTime = "04:55:00";

            const queueItem = structuredClone(baseQueueJson[0]);
            queueItem.formResponse.Bedtime = "11:59:00 PM";
            queueItem.formResponse["Wake-up time"] = `${mockCurrentTime} AM`;

            Date.now = vi.fn().mockReturnValue(new Date(`${queueItem.checkinFields.date}T${mockCurrentTime}.000`)); // called by Temporal

            // act
            const result = updateSleepHabit({
                sleepHabit: structuredClone(baseSleepHabit),
                queueItem,
                targetBedtime,
                targetWakeTime,
                startOrEnd: "End",
                required: 1,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result.lastDate).toBe(baseQueueJson[0].checkinFields.date);
            expect(result.pastWeek.length).toBe(baseSleepHabit.pastWeek.length + 1);
            expect(result.pastWeek).toContain(baseQueueJson[0].checkinFields.date);
        });

        it("should update sleep habit when target bedtime AND wake time are met with both required", () => {
            // arrange
            const sleepHabit = structuredClone(baseSleepHabit);
            const queueItem = structuredClone(baseQueueJson[0]);
            queueItem.formResponse.Bedtime = "08:59:00 PM";
            queueItem.formResponse["Wake-up time"] = "04:55:00 AM";

            // act
            const result = updateSleepHabit({
                sleepHabit,
                queueItem,
                targetBedtime,
                targetWakeTime,
                startOrEnd: "End",
                required: 2,
                now: Temporal.Now.zonedDateTimeISO(),
            });

            // assert
            expect(result.lastDate).toBe(baseQueueJson[0].checkinFields.date);
            expect(result.pastWeek.length).toBe(baseSleepHabit.pastWeek.length + 1);
            expect(result.pastWeek).toContain(baseQueueJson[0].checkinFields.date);
        });
    });
});
