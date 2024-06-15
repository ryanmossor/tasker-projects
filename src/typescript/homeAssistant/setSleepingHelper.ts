import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import * as tasker from "../modules/tasker";
import { isEnvTasker, tryGetGlobal, tryGetLocal } from "../modules/utils";

async function toggleSleeping(): Promise<void> {
    const body = {
        "state": tryGetLocal("par1"),
        "attributes": {
            "editable": true,
            "icon": "mdi:sleep",
            "friendly_name": "Sleeping",
        },
    };

    try {
        await Http.post({
            url: `${tryGetGlobal("HA_URL")}/states/input_boolean.sleeping`,
            body,
            headers: {
                "Authorization": `Bearer ${tryGetGlobal("HA_TOKEN")}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: toggleSleeping.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    toggleSleeping();
}
