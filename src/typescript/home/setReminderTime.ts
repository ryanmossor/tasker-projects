import { Temporal } from "temporal-polyfill";
import * as tasker from "../modules/tasker";
import { formatDateTime, isNullOrEmpty } from "../modules/utils";

const nowUnix = Temporal.Now.zonedDateTimeISO().epochSeconds;
const timezone = Temporal.Now.timeZoneId();

const reminderDate = tasker.local("date");
const reminderTime = tasker.local("time");

const dateTime = isNullOrEmpty(reminderDate)
    ? Temporal.PlainDateTime.from(`${Temporal.Now.plainDateISO().toString()} ${reminderTime}`).toZonedDateTime(timezone)
    : Temporal.PlainDateTime.from(`${reminderDate} ${reminderTime}`).toZonedDateTime(timezone);

tasker.setLocal("restart", "0");

if (dateTime.epochSeconds - nowUnix < 0) {
    tasker.setLocal("restart", "1");
    tasker.flash("⚠️ Pick a time that has not already passed");
    tasker.exit();
}

const formatted = formatDateTime(dateTime, "MMMM D, h:mm a");
tasker.flash(`✅ Reminder set for ${formatted}`);
if (tasker.local("par1") === "Yoga") {
    tasker.setGlobal("YOGA_TIME", tasker.local("time"));
    tasker.exit();
}

tasker.setLocal("time_json", JSON.stringify({
    dueDate: dateTime.toPlainDate().toString(),
    dueTime: formatDateTime(dateTime, "HH:mm"),
}));

tasker.exit();
