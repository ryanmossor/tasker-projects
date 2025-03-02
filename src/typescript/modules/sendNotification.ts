import * as tasker from "../dev/tasker";
import { NotificationPayload } from "../dev/types";

export const notificationActions = {
    processCheckinQueue: "📅 Process Check-in Queue",
    rewardsUi: "📅 Rewards UI",
    setReminder: "⏰ Reminder Prompt",
    viewFile: "View File",
};

export const notificationIcons = {
    clipboard: "android.resource://net.dinglisch.android.taskerm/drawable/mw_action_assignment",
    clipboardCheck: "android.resource://net.dinglisch.android.taskerm/drawable/mw_action_assignment_turned_in",
    clipboardWarn: "android.resource://net.dinglisch.android.taskerm/drawable/mw_action_assignment_late",
    ringingBell: "android.resource://net.dinglisch.android.taskerm/drawable/mw_social_notifications_active",
    star: "android.resource://net.dinglisch.android.taskerm/drawable/mw_action_stars",
    xEyes: "android.resource://net.dinglisch.android.taskerm/drawable/mw_social_sentiment_very_dissatisfied",
};

export function sendNotification(notifPayload: NotificationPayload): void {
    tasker.performTask("Send Notification", 101, JSON.stringify({
        ...notifPayload,
        icon: notifPayload.icon ?? notificationIcons.ringingBell,
        priority: notifPayload.priority ?? 3,
        soundFile: notifPayload.soundFile ?? "/sdcard/Notifications/silent.mp3",
        category: notifPayload.category ?? "Custom Notifications",
    }));
}
