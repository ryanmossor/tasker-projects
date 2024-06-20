import { Temporal } from "temporal-polyfill";
import { CheckinQueueItem, Habit } from "../dev/types";
import { uniq } from "./utils";

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
 * Updates the `daysSince`, `lastDate`, and `pastWeek` properties of a habit object.
 * @param habit
 * @param date - Formatted as `YYYY-MM-DD`
 * @returns Habit object with `daysSince`, `lastDate`, and `pastWeek` properties updated
 */
export function updateLastHabitDate(habit: Habit, date: string): Habit {
    habit.daysSince = 0;
    habit.lastDate = date;
    habit.pastWeek.push(date);

    return habit;
}

/**
 * Calls `updateLastHabitDate()` for tracked `Habit` objects.
 * @returns Habits array with updated dates for tracked items
 */
export function updateTrackedItemDates(queueItem: CheckinQueueItem, habitsArr: Habit[]): Habit[] {
    const updatedHabitsArr: Habit[] = structuredClone(habitsArr);

    const checkedItemsLowercase: string[] = Object.keys(queueItem.formResponse)
        .map((key) => key.toLowerCase());

    for (const item of checkedItemsLowercase) {
        let habit = updatedHabitsArr.find((h) => h.name === item || h.types?.includes(item));
        if (habit != null) {
            habit = updateLastHabitDate(habit, queueItem.checkinFields.date);
        }
    }

    return updatedHabitsArr;
}
