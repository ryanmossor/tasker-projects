import * as tasker from "../dev/tasker";
import { CheckinApiResponse, CheckinQueueItem } from "../dev/types";
import { assert } from "../modules/assert";
import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import { notificationActions } from "../modules/sendNotification";
import { isEnvTasker, readJsonData, tryGetGlobal } from "../modules/utils";

async function processCheckinQueue() {
    try {
        const start = performance.now();
        const queueJson = readJsonData<CheckinQueueItem[]>({ filename: "checkinQueue.json" });

        const response = await Http.post<CheckinQueueItem[], CheckinApiResponse>({
            url: `${tryGetGlobal("CHECKIN_API")}/checkin/process`,
            body: queueJson.data,
            params: { "concatResults": true },
            headers: { "Content-Type": "application/json" },
        });

        assert(response != null, "Received null response from check-in API");

        for (const result of response.results) {
            tasker.performTask("asPopulateCell", 101, JSON.stringify(result));
            tasker.wait(100);
        }

        queueJson.data = response.unprocessed;
        queueJson.save();

        // log warning if all unprocessed items have morning check-in complete (i.e., some other processing error occurred)
        if (response.unprocessed.length > 0 && response.unprocessed.every((item) => "Feel Well-Rested" in item.formResponse)) {
            Logger.warning({
                message: "Unprocessed items returned from check-in API",
                properties: response.unprocessed,
                funcName: processCheckinQueue.name,
                customAction1: {
                    label: "Retry",
                    action: {
                        name: notificationActions.processCheckinQueue,
                        par1: "retry",
                    },
                },
            });
        }

        const time = ((performance.now() - start) / 1000).toFixed(2);
        Logger.info({ message: `Processed ${response.results.length} check-in queue item(s) in ${time} seconds` });

        tasker.setGlobal("CHECKIN_QUEUE_READY", null);
    } catch (error) {
        Logger.error({ message: error, funcName: processCheckinQueue.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    processCheckinQueue();
}
