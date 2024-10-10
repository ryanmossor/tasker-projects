import { CheckinFields, Habit } from "../../src/typescript/dev/types";
import * as habitFunctions from "../../src/typescript/modules/habitFunctions";

describe("habitFunctions", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("_calcDaysSince", () => {
        it("should return 0 if today is the same as activityDate", () => {
            // arrange
            const activityDate = "2023-08-08";
            const today = "2023-08-08";

            // act
            const result = habitFunctions._calcDaysSince(activityDate, today);

            // assert
            expect(result).toEqual(0);
        });

        [
            { activityDate: "2023-08-07", today: "2023-08-08", expected: 1 },
            { activityDate: "2023-08-01", today: "2023-08-08", expected: 7 },
            { activityDate: "2023-07-31", today: "2023-08-08", expected: 8 },
            { activityDate: "2023-07-01", today: "2023-08-08", expected: 38 },
        ].forEach(({ activityDate, today, expected }) => {
            it(`should return ${expected} if today is ${today} and activityDate is ${activityDate}`, () => {
                // act
                const result = habitFunctions._calcDaysSince(activityDate, today);

                // assert
                expect(result).toEqual(expected);
            });
        });
    });

    describe("_trimPastWeekArr", () => {
        it("should return empty array if pastWeek arr is empty", () => {
            // arrange
            const pastWeekArr = [];
            const today = "2023-08-08";

            // act
            const result = habitFunctions._trimPastWeekArr(pastWeekArr, today);

            // assert
            expect(result).toEqual([]);
        });

        it("should return matching array if all dates are within past 7 days", () => {
            // arrange
            const pastWeekArr = ["2023-08-05", "2023-08-06", "2023-08-07"];
            const today = "2023-08-08";

            // act
            const result = habitFunctions._trimPastWeekArr(pastWeekArr, today);

            // assert
            expect(result).toEqual(pastWeekArr);
        });

        [
            ["2023-08-01", "2023-08-01"],
            ["2023-08-01", "2023-08-02", "2023-08-03", "2023-08-03"],
        ].forEach((pastWeekArr) => {
            it("should return array with duplicates removed", () => {
                // arrange
                const today = "2023-08-08";

                // act
                const result = habitFunctions._trimPastWeekArr(pastWeekArr, today);

                // assert
                expect(result).toEqual([...new Set(pastWeekArr)]);
            });
        });

        it("should remove dates older than 7 days ago", () => {
            // arrange
            const pastWeekArr = ["2023-07-31", "2023-08-05", "2023-08-06", "2023-08-07"];
            const today = "2023-08-08";

            // act
            const result = habitFunctions._trimPastWeekArr(pastWeekArr, today);

            // assert
            expect(result).toEqual(["2023-08-05", "2023-08-06", "2023-08-07"]);
        });

        it("should remove dates in the future", () => {
            // arrange
            const pastWeekArr = ["2023-08-05", "2023-08-06", "2023-08-07", "2100-01-01"];
            const today = "2023-08-08";

            // act
            const result = habitFunctions._trimPastWeekArr(pastWeekArr, today);

            // assert
            expect(result).toEqual(["2023-08-05", "2023-08-06", "2023-08-07"]);
        });
    });

    describe("habitsDailyReset", () => {
        it("should return empty array if habitsArr is empty", () => {
            // arrange
            const habitsArr = [];

            // act
            const result = habitFunctions.habitsDailyReset(habitsArr);

            // assert
            expect(result).toEqual([]);
        });

        it("should return array with daysSince property updated", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2023-08-26T20:25:10.000Z")); // called by Temporal
            const habitsArr = [
                {
                    name: "habit 1",
                    lastDate: "2023-08-25",
                    pastWeek: ["2023-08-22", "2023-08-25"],
                    daysSince: 3,
                },
            ];

            const expected = [
                {
                    name: "habit 1",
                    lastDate: "2023-08-25",
                    pastWeek: ["2023-08-22", "2023-08-25"],
                    daysSince: 1,
                },
            ];

            // act
            const result = habitFunctions.habitsDailyReset(habitsArr);

            // assert
            expect(result).toEqual(expected);
        });

        it("should return array with pastWeek property trimmed", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2023-08-26T20:25:10.000Z")); // called by Temporal
            const habitsArr = [
                {
                    name: "habit 1",
                    lastDate: "2023-08-25",
                    pastWeek: ["2023-08-01", "2023-08-25"],
                    daysSince: 3,
                },
                {
                    name: "habit 2",
                    lastDate: "2023-07-31",
                    pastWeek: [],
                    daysSince: 3,
                },
            ];

            const expected = [
                {
                    name: "habit 1",
                    lastDate: "2023-08-25",
                    pastWeek: ["2023-08-25"],
                    daysSince: 1,
                },
                {
                    name: "habit 2",
                    lastDate: "2023-07-31",
                    pastWeek: [],
                    daysSince: 26,
                },
            ];

            // act
            const result = habitFunctions.habitsDailyReset(habitsArr);

            // assert
            expect(result).toEqual(expected);
        });
    });

    describe("updateDate", () => {
        it("should update properties for habit", () => {
            // arrange
            const habit = {
                name: "journal",
                lastDate: "2023-08-25",
                pastWeek: ["2023-08-25"],
                daysSince: 3,
            };
            const today = "2023-08-26";

            const expected = {
                name: habit.name,
                lastDate: today,
                pastWeek: ["2023-08-25", today],
                daysSince: 0,
            };

            // act
            const result = habitFunctions.updateLastHabitDate(habit, today);

            // assert
            expect(result).toEqual(expected);
        });
    });

    describe("updateTrackedItemDates", () => {
        const today = "2023-08-26";
        const habitsArr: Habit[] = [
            {
                name: "tracked habit 1",
                daysSince: 99,
                lastDate: "2023-01-01",
                pastWeek: [],
            },
            {
                name: "tracked habit 2",
                daysSince: 99,
                lastDate: "2023-01-01",
                pastWeek: [],
                types: ["type 1", "type 2"],
            },
        ];
        const checkinFields: CheckinFields = {
            spreadsheetId: "sheetId",
            date: today,
            month: "Aug",
            cellReference: "AB1",
        };

        it("should do nothing if no tracked habits are in form response", () => {
            // arrange
            const formResponse = { "untracked habit": "1" };
            const queueItem = { checkinFields, formResponse };

            // act
            const result = habitFunctions.updateTrackedItemDates(queueItem, habitsArr);

            // assert
            expect(result).not.toBeNull();
            expect(result).toEqual(habitsArr); // unchanged
        });

        it("should update date info for tracked item if in form response", () => {
            // arrange
            const formResponse = { "tracked habit 1": "1" };
            const queueItem = { checkinFields, formResponse };

            // act
            const result = habitFunctions.updateTrackedItemDates(queueItem, habitsArr);

            // assert
            expect(result).not.toBeNull();
            expect(result[0].lastDate).toBe(today);
            expect(result[0].pastWeek).toContain(today);
            expect(result[0].daysSince).toEqual(0);
            expect(result[1]).toEqual(habitsArr[1]); // unchanged
        });

        it("should update date for item if it appears in a tracked habit's types property", () => {
            // arrange
            const formResponse = { "type 1": "1" };
            const queueItem = { checkinFields, formResponse };

            // act
            const result = habitFunctions.updateTrackedItemDates(queueItem, habitsArr);

            // assert
            expect(result).not.toBeNull();
            expect(result[0]).toEqual(habitsArr[0]); // unchanged
            expect(result[1].lastDate).toEqual(today);
            expect(result[1].pastWeek).toContain(today);
            expect(result[1].daysSince).toEqual(0);
        });

        it("should update dates for both tracked habits and tracked habit types", () => {
            // arrange
            const formResponse = { "tracked habit 1": "1", "untracked habit": "1", "tracked habit 2": "1" };
            const queueItem = { checkinFields, formResponse };

            const expected: Habit[] = [
                {
                    ...habitsArr[0],
                    lastDate: today,
                    pastWeek: [today],
                    daysSince: 0,
                },
                {
                    ...habitsArr[1],
                    lastDate: today,
                    pastWeek: [today],
                    daysSince: 0,
                },
            ];

            // act
            const result = habitFunctions.updateTrackedItemDates(queueItem, habitsArr);

            // assert
            expect(result).not.toBeNull();
            expect(result).toEqual(expected);
        });
    });
});
