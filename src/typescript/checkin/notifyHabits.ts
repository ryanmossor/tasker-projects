import * as tasker from "../dev/tasker";
import { CheckinJson } from "../dev/types";
import { notificationActions, sendNotification } from "../modules/sendNotification";
import { capitalize, readJsonData } from "../modules/utils";

const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
const reminderHabits = checkinJson.data.habits.filter((habit) => habit.reminderThreshold);

for (const habit of reminderHabits) {
    if (habit.reminderThreshold! >= habit.daysSince) {
        continue;
    }

    sendNotification({
        title: `Habit Reminder: ${capitalize(habit.name)}`,
        text: `It's been ${habit.daysSince} days since your last ${habit.reminderText}.`,
        category: "Check-in",
        action1: {
            label: "Set Reminder",
            action: {
                name: notificationActions.setReminder,
                par1: `${capitalize(habit.name)}`,
                par2: "reminder",
            },
        },
    });

    tasker.wait(1000);
}
