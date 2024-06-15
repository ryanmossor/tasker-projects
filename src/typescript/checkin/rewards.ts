import Logger from "../modules/logger";
import { chooseReward, countSuccessfulHabits, generateHabitScorecard } from "../modules/rewardFunctions";
import { notificationActions, notificationIcons, sendNotification } from "../modules/sendNotification";
import Tasker from "../modules/tasker";
import { isEnvTasker, readJsonData } from "../modules/utils";
import { CheckinJson } from "../types/types";

function processRewards() {
    try {
        const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
        const { habits } = checkinJson.data;
        const { rewardList, habitsTarget } = checkinJson.data.rewards;

        const successfulHabitsCount = countSuccessfulHabits(habits);

        let reward;
        if (successfulHabitsCount >= habitsTarget) {
            reward = chooseReward(rewardList);
            checkinJson.data.rewards.daysSinceLastRewardRoll = 0;
            checkinJson.data.rewards.rollStreak += 1;
        } else {
            checkinJson.data.rewards.daysSinceLastRewardRoll += 1;
            checkinJson.data.rewards.rollStreak = 0;
        }

        if (reward != null) {
            sendNotification({
                title: "🌟 Reward Unlocked",
                text: `You've earned a reward: ${reward}\nKeep up the good work!`,
                icon: notificationIcons.star,
                priority: 5,
                action1: {
                    label: "View Rewards UI",
                    action: { name: notificationActions.rewardsUi },
                },
            });

            Tasker.wait(1000);
        }

        sendNotification({
            title: "Habit Scorecard: Past 7 Days",
            text: generateHabitScorecard(habits, successfulHabitsCount, habitsTarget),
            icon: notificationIcons.clipboard,
            priority: 5,
            category: "Check-in",
        });

        const { daysSinceLastRewardRoll, rollStreak } = checkinJson.data.rewards;

        const title = "Consider Adjusting Habit Targets";
        const baseNotifPayload = {
            title,
            priority: 5,
            category: "Check-in",
            // TODO: change action to load new habits UI to modify habit targets
            action1: {
                label: "Open checkin.json",
                action: {
                    name: notificationActions.viewFile,
                    par1: "/sdcard/Tasker/json/checkin.json",
                    par2: title,
                },
            },
        };

        // TODO: make these thresholds configurable via habits UI
        if (daysSinceLastRewardRoll >= 7) {
            sendNotification({
                ...baseNotifPayload,
                text: `It's been ${daysSinceLastRewardRoll} days since your last reward roll. Want to adjust your habit targets?`,
                icon: notificationIcons.clipboardWarn,
            });
        } else if (rollStreak >= 7) {
            sendNotification({
                ...baseNotifPayload,
                text: `You've rolled for a reward ${rollStreak} days in a row. Want to increase some of your habit targets?`,
                icon: notificationIcons.clipboardCheck,
            });
        }

        checkinJson.data.habits = habits;
        checkinJson.save();
    } catch (error) {
        Logger.error({ message: error, funcName: processRewards.name });
        Tasker.exit();
    }
}

if (isEnvTasker()) {
    processRewards();
}
