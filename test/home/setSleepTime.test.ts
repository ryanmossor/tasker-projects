import { Temporal } from "temporal-polyfill";
import { setSleepTime } from "../../src/typescript/home/setSleepTime";
import * as utils from "../../src/typescript/modules/utils";
import { CheckinQueueItem } from "../../src/typescript/types/types";

const baseQueueJson: CheckinQueueItem[] = [{
    checkinFields: {
        spreadsheetName: "sheet",
        date: "2024-05-07",
        month: "May",
        cellReference: "cell",
    },
    formResponse: { "habit1": "1" },
}];
const path = "/path/to/file.json";

describe("setSleepTime", () => {
    describe("setSleepTime", () => {
        it("should set sleep start time", () => {
            // arrange
            const queueJson = structuredClone(baseQueueJson);
            vi.fn(utils.readJsonData).mockReturnValue(new utils.JsonData(queueJson, path));
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-07T20:40:17.000")); // called by Temporal

            // act
            const result = setSleepTime({
                startOrEnd: "Start",
                checkinDate: queueJson[0].checkinFields.date,
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result.sleepStart).toBe(1715132417);
            expect(result.formResponse.Bedtime).toBe("8:40:00 PM");
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
                checkinDate: queueJson[0].checkinFields.date,
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result.sleepEnd).toBe(1715162173);
            expect(result.formResponse["Wake-up time"]).toBe("4:56:00 AM");
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
                checkinDate: queueJson[0].checkinFields.date,
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
                checkinDate: queueJson[0].checkinFields.date,
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
                checkinDate: queueJson[0].checkinFields.date,
                now: Temporal.Now.zonedDateTimeISO(),
                queueItem: queueJson[0],
            });

            // assert
            expect(result).toBeNull();
        });
    });
});
