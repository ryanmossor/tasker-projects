import { Habit } from "../../src/typescript/dev/types";
import { _maybeAdjustTarget } from "../../src/typescript/modules/rewardFunctions";

describe("rewardFunctions", () => {
    describe("_maybeAdjustTarget", () => {
        const baseHabit: Habit = {
            name: "cardio",
            lastDate: "2024-06-10",
            daysSince: 1,
            pastWeek: ["2024-06-10"],
            weeklyTarget: 3,
        };

        it("should not adjust target if 0 or 1 sick/injured days in past week", () => {
            const sickInjuredDays = 0;
            const result = _maybeAdjustTarget(baseHabit, sickInjuredDays);

            expect(result).toEqual(baseHabit.weeklyTarget);
        });

        test.each([
            [2, baseHabit.weeklyTarget - 1],
            [3, baseHabit.weeklyTarget - 1],
            [4, baseHabit.weeklyTarget - 2],
            [5, baseHabit.weeklyTarget - 2],
        ])("should adjust target for exercise habits based on sick/injured days", (sickInjuredDays, expected) => {
            // arrange & act
            const result = _maybeAdjustTarget(baseHabit, sickInjuredDays);

            // assert
            expect(result).toEqual(expected);
        });

        it("should return 1 if number of sick/injured days would otherwise cause adjusted target to be 0", () => {
            // arrange & act
            const sickInjuredDays = 6;
            const result = _maybeAdjustTarget(baseHabit, sickInjuredDays);

            // assert
            expect(result).toEqual(1);
        });
    });
});
