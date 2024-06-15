import assert from "../modules/assert";
import { Http } from "../modules/httpClient";
import Logger from "../modules/logger";
import Tasker from "../modules/tasker";
import { isEnvTasker, readJsonData, tryGetGlobal } from "../modules/utils";
import { CheckinApiResponse, CheckinQueueItem } from "../types/types";

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
            Tasker.performTask("asPopulateCell", 101, JSON.stringify(result));
            Tasker.wait(100);
        }

        queueJson.data = response.unprocessed;
        queueJson.save();

        // log warning if all unprocessed items have morning check-in complete (i.e., some other processing error occurred)
        if (response.unprocessed.length > 0 && response.unprocessed.every((item) => "Feel Well-Rested" in item.formResponse)) {
            Logger.warning({
                message: "Unprocessed items returned from check-in API",
                properties: response.unprocessed,
                funcName: processCheckinQueue.name,
            });
        }

        const time = ((performance.now() - start) / 1000).toFixed(2);
        Logger.info({
            message: `Processed ${response.results.length} item(s) in ${time} seconds`,
            funcName: processCheckinQueue.name,
        });

        Tasker.setGlobal("CHECKIN_QUEUE_READY", null);
    } catch (error) {
        Logger.error({ message: error, funcName: processCheckinQueue.name });
    } finally {
        Tasker.exit();
    }
}

if (isEnvTasker()) {
    processCheckinQueue();
}
