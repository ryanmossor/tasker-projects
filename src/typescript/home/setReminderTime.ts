import { Temporal } from "temporal-polyfill";
import Tasker from "../modules/tasker";
import { formatDateTime, isNullOrEmpty } from "../modules/utils";

const nowUnix = Temporal.Now.zonedDateTimeISO().epochSeconds;
const timezone = Temporal.Now.timeZoneId();

const reminderDate = Tasker.local("date");
const reminderTime = Tasker.local("time");

const dateTime = isNullOrEmpty(reminderDate)
    ? Temporal.PlainDateTime.from(`${Temporal.Now.plainDateISO().toString()} ${reminderTime}`).toZonedDateTime(timezone)
    : Temporal.PlainDateTime.from(`${reminderDate} ${reminderTime}`).toZonedDateTime(timezone);

Tasker.setLocal("restart", "0");

if (dateTime.epochSeconds - nowUnix < 0) {
    Tasker.setLocal("restart", "1");
    Tasker.flash("⚠️ Pick a time that has not already passed");
    Tasker.exit();
}

const formatted = formatDateTime(dateTime, "MMMM D, h:mm a");
Tasker.flash(`✅ Reminder set for ${formatted}`);
if (Tasker.local("par1") === "Yoga") {
    Tasker.setGlobal("YOGA_TIME", Tasker.local("time"));
    Tasker.exit();
}

Tasker.setLocal("time_json", JSON.stringify({
    dueDate: dateTime.toPlainDate().toString(),
    dueTime: formatDateTime(dateTime, "HH:mm"),
}));

Tasker.exit();
