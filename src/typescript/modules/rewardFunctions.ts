import { Temporal } from "temporal-polyfill";
import { Habit, Reward } from "../dev/types";
import { capitalize, sample, shuffle, uniq } from "./utils";

/**
 * If any sick/injured days in the past week, adjusts weekly targets for exercise habits by subtracting
 * `sickInjuredDays / 2` from `weeklyTarget`. If subtracting offset from `weeklyTarget` results in a number <= 0, returns `1`.
 * @param habit - {@link Habit} object
 * @param sickInjuredDays - Number of sick/injured days from {@link Habit.pastWeek `sickInjured.pastWeek.length`}
 * @returns Adjusted {@link Habit.weeklyTarget}, or non-adjusted if no sick/injured days in past week
 */
export function _maybeAdjustTarget(habit: Habit, sickInjuredDays: number): number {
    const exerciseHabits = ["cardio", "resistance", "yoga"];
    const originalTarget = habit.weeklyTarget!;

    if (sickInjuredDays === 0 || !exerciseHabits.includes(habit.name)) {
        return originalTarget;
    }

    const offset = sickInjuredDays / 2;
    const adjustedTarget = Math.ceil(originalTarget - offset);

    return Math.max(1, adjustedTarget);
}

/**
 * Returns an array of reward names, with each reward name appearing a number of times equal to its
 * {@link Reward.weight `weight`} minus {@link Reward.timesAppeared `timesAppeared`}
 * @param rewardList - Array of {@link Reward} objects
 * @returns Array of reward names
 */
function _filterAvailableRewards(rewardList: Reward[]): string[] {
    const availableRewardNames: string[] = [];
    for (const reward of rewardList) {
        availableRewardNames.push(...Array(reward.weight - reward.timesAppeared).fill(reward.name));
    }

    return availableRewardNames;
}

/**
 * Chooses a random reward from `availableRewardNames[]` and updates the `timesAppeared`
 * and `unredeemed` properties of the corresponding reward object in `rewardList[]`
 * @param rewardList - Array of {@link Reward} objects
 * @returns Name of randomly chosen reward
 */
export function chooseReward(rewardList: Reward[]): string | null {
    const availableRewardNames = _filterAvailableRewards(rewardList);
    const shuffledRewards = shuffle(availableRewardNames);
    const chosenRewardName = sample(shuffledRewards)!;
    const chosenRewardObj: Reward = rewardList.find((reward) => reward.name === chosenRewardName)!;
    chosenRewardObj.timesAppeared += 1;
    chosenRewardObj.unredeemed += 1;

    return chosenRewardName === "blank" ? null : chosenRewardName;
}

/**
 * Checks whether weekly target was met for given `habit`
 * @param habit - {@link Habit} object
 * @param sickInjuredDays - Number of sick/injured days from {@link Habit.pastWeek `sickInjured.pastWeek.length`}
 * @returns
 */
function _isWeeklyTargetMet(habit: Habit, sickInjuredDays: number): boolean {
    const weeklyCount = habit.pastWeek.length;
    const originalTarget = habit.weeklyTarget!;
    const adjustedTarget = _maybeAdjustTarget(habit, sickInjuredDays);

    const habitSuccessfullyAvoided = habit.avoid && weeklyCount <= adjustedTarget;
    const habitSuccessfullyCompleted = !habit.avoid && originalTarget > 0 && (weeklyCount >= adjustedTarget);

    if (habitSuccessfullyAvoided || habitSuccessfullyCompleted) {
        return true;
    }

    return false;
}

/**
 * Counts number of habits where length of {@link Habit.pastWeek `pastWeek`} >= {@link Habit.weeklyTarget `weeklyTarget`}
 * @param habitsArr - Array of {@link Habit} objects from {@link CheckinJson.habits `CheckinJson.habits`}
 * @returns Array of successful habit names
 */
export function countSuccessfulHabits(habitsArr: Habit[]): number {
    const sickInjuredDays: number = habitsArr.find((x) => x.name === "sickInjured").pastWeek.length;
    const successfulHabits: string[] = [];

    for (const habit of habitsArr) {
        if (_isWeeklyTargetMet(habit, sickInjuredDays)) {
            successfulHabits.push(habit.name);
        }
    }

    return successfulHabits.length;
}

/**
 * Outputs text in the format `habitName – score/adjustedTarget`, conditionally prepended
 * with emojis to indicate whether target was met, whether it could be met tomorrow, etc.
 * @param habit - {@link Habit} object
 * @param sickInjuredDays - Number of sick/injured days from past week (`sickInjured.pastWeek.length`)
 * @param oneWeekAgo - Formatted as `YYYY-MM-DD`
 * @returns Text in the format `habitName – score/adjustedTarget`
 */
function _createResultsLine(habit: Habit, sickInjuredDays: number, oneWeekAgo: string): string {
    const capitalizedHabitName = capitalize(habit.avoid ? `${habit.name}*` : habit.name);
    const score = habit.pastWeek.length;
    const adjustedTarget = _maybeAdjustTarget(habit, sickInjuredDays);
    const result = `${capitalizedHabitName} – ${score}/${adjustedTarget}`;

    // If target won't be met tomorrow without doing the habit today, prepend result with ❗
    if (!habit.avoid && (score === adjustedTarget) && (habit.pastWeek[0] === oneWeekAgo)) {
        return `❗ ${result}`;
    }

    // If target will be met tomorrow by avoiding habit today, prepend result with 🔽
    if (habit.avoid && (score === adjustedTarget + 1) && (habit.pastWeek[0] === oneWeekAgo)) {
        return `🔽 ${result}`;
    }

    // If target will be met tomorrow by doing the habit today, prepend result with 🔼
    if (!habit.avoid && (adjustedTarget > 1) && (score === adjustedTarget - 1) && (habit.pastWeek[0] !== oneWeekAgo)) {
        return `🔼 ${result}`;
    }

    // Prepend with ✅ if target met
    if ((!habit.avoid && (score >= adjustedTarget)) || (habit.avoid && (score <= adjustedTarget))) {
        return `✅ ${result}`;
    }

    return result;
}

/**
 * Creates a string containing number of successful habits compared to weekly and total targets. Used in scorecard notification.\
 * *Example:* `Yoga – 4/5`
 * @param habitsArr - The array of habit objects from {@link CheckinJson.habits}
 * @param successCount - `successfulHabits.length` -- number of successful habits
 * @param totalTarget - `habitsTarget` from {@link CheckinJson.rewards}
 * @returns Scores for successful habits and targets
 */
export function generateHabitScorecard(habitsArr: Habit[], successCount: number, totalTarget: number): string {
    const sickInjuredDays = habitsArr.find((x) => x.name === "sickInjured")!.pastWeek.length;
    const oneWeekAgo = Temporal.Now.plainDateISO().subtract({ days: 7 }).toString();

    const scorecard = habitsArr
        .filter((habit) => habit.weeklyTarget != null)
        .map((habit) => _createResultsLine(habit, sickInjuredDays, oneWeekAgo))
        .join("\n");

    let totalScore = `Total – ${successCount}/${totalTarget}`;
    totalScore = successCount >= totalTarget ? `🎯 ${totalScore}` : totalScore;

    return `${scorecard}\n\n${totalScore}`;
}

function _resetRewardPool(rewardList: Reward[]): Reward[] {
    return rewardList.map((obj) => ({ ...obj, timesAppeared: 0 }));
}

/**
 * Updates `weight` property of `blank` reward such that 1/3 of items in starting pool are rewards and 2/3 are blank.
 * Also resets reward pool if the only remaining rewards are `blank` or if all non-blank rewards have appeared.
 * @param rewardList - Array of {@link Reward} objects
 * @returns Array of {@link Reward} objects with updated `weight` for `blank` reward and reset `timesAppeared`, if applicable
 */
export function rewardsDailyUpdate(rewardList: Reward[]): Reward[] {
    let updatedRewardList = rewardList.filter((reward) => reward.weight > 0);

    // Update weight of 'blank' such that 1/3 of items in pool are rewards
    const blankWeight = updatedRewardList
        .filter((reward) => reward.name !== "blank")
        .reduce((sum, reward) => sum + reward.weight, 0);
    const blankReward = updatedRewardList.find((reward) => reward.name === "blank")!;
    blankReward.weight = blankWeight * 2;

    if (updatedRewardList.some((r) => r.timesAppeared > r.weight)) {
        updatedRewardList = _resetRewardPool(updatedRewardList);
    }

    const availableRewardNames: string[] = _filterAvailableRewards(updatedRewardList);
    const uniqueRewardNames: string[] = uniq(availableRewardNames);

    const onlyBlankRewardsRemain: boolean = uniqueRewardNames.length === 1 && uniqueRewardNames[0] === "blank";
    const allRewardsHaveAppeared: boolean = availableRewardNames.length === 0;

    // Reset pool if all non-blank rewards have appeared
    if (onlyBlankRewardsRemain || allRewardsHaveAppeared) {
        updatedRewardList = _resetRewardPool(updatedRewardList);
    }

    return updatedRewardList;
}
