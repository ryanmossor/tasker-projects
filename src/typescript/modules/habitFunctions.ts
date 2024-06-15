import { Temporal } from "temporal-polyfill";
import { CheckinQueueItem, Habit } from "../types/types";
import { uniq } from "./utils";

type HabitMapping = {
    [index: string]: {
        types: string[];
    }
};

/** Calculates days since a habit was last completed. Dates formatted as `YYYY-MM-DD`.  */
export function _calcDaysSince(activityDate: string, today: string): number {
    const daysSince: number = Temporal.PlainDate.from(today).since(Temporal.PlainDate.from(activityDate)).days;
    return daysSince;
}

/** Removes dates from `weekArr` that do not fall within past 7 days. Dates formatted as `YYYY-MM-DD`.  */
export function _trimPastWeekArr(weekArr: string[], today: string): string[] {
    // Remove duplicate dates (e.g., 2 cardio workouts on same day)
    const uniqueDates: string[] = uniq(weekArr);
    const date = Temporal.PlainDate.from(today);
    const oneWeekAgo = date.subtract({ days: 7 });

    const trimmedArr: string[] = uniqueDates.filter((d) => {
        const daysSince = Temporal.PlainDate.from(d).since(oneWeekAgo).days;
        return daysSince >= 0 && daysSince <= 7;
    });

    return trimmedArr;
}

/**
 * Updates `daysSince` property, trims dates older than 7 days from `pastWeek[]`, and alphabetizes keys of `habitsArr`.\
 * Dates formatted as `YYYY-MM-DD`.
 */
export function habitsDailyReset(habitsArr: Habit[]): Habit[] {
    const resetArr: Habit[] = structuredClone(habitsArr);
    const today = Temporal.Now.plainDateISO().toString();

    resetArr.forEach((habit) => {
        habit.daysSince = _calcDaysSince(habit.lastDate, today);
        habit.pastWeek = _trimPastWeekArr(habit.pastWeek, today);
    });

    return resetArr;
}

/**
 * Updates the `lastDate` and `pastWeek` properties of a habit object in `habitsArr` for the given `habitName`.\
 * Creates a new habit object if it doesn't already exist. Dates formatted as `YYYY-MM-DD`.
 */
export function updateDate(habitsArr: Habit[], habitName: string, today: string): Habit[] {
    const updatedHabitsArr: Habit[] = structuredClone(habitsArr);
    let habit = updatedHabitsArr.find((x) => x.name === habitName);

    if (habit == null) {
        habit = { name: habitName, pastWeek: [] } as Habit;
        updatedHabitsArr.push(habit);
    }

    habit.lastDate = today;
    habit.daysSince = 0;
    habit.pastWeek.push(today);

    return updatedHabitsArr;
}

export function _generateTrackedHabitMapping(habitsArr: Habit[]): HabitMapping {
    const habitsMapping: HabitMapping = {};

    habitsArr.forEach((habit: Habit) => {
        if (habit.tracked != null) {
            habitsMapping[habit.name] = { types: habit.types ?? [] };
        }
    });

    return habitsMapping;
}

/** Calls `updateDate()` for tracked items (workouts, sick/injured, reminder items, etc.). Dates formatted as `YYYY-MM-DD`. */
export function updateTrackedItemDates(queueItem: CheckinQueueItem, habitsArr: Habit[]): Habit[] {
    let updatedHabitsArr: Habit[] = structuredClone(habitsArr);
    const habitsMapping: HabitMapping = _generateTrackedHabitMapping(updatedHabitsArr);

    const checkedItemsLowercase: string[] = Object.entries(queueItem.formResponse)
        .filter(([, value]) => value != null)
        .map(([key]) => key.toLowerCase());

    for (const item of checkedItemsLowercase) {
        if (habitsMapping[item]) {
            updatedHabitsArr = updateDate(updatedHabitsArr, item, queueItem.checkinFields.date);
            continue;
        }

        for (const habitName in habitsMapping) {
            if (habitsMapping[habitName].types.includes(item)) {
                updatedHabitsArr = updateDate(updatedHabitsArr, habitName, queueItem.checkinFields.date);
            }
        }
    }

    return updatedHabitsArr;
}
