import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import * as tasker from "../modules/tasker";
import { isEnvTasker, tryGetGlobal, tryGetLocal } from "../modules/utils";

async function toggleHome(state: "on" | "off"): Promise<void> {
    const body = {
        state,
        "attributes": {
            "editable": true,
            "icon": "mdi:home-account",
            "friendly_name": "Ryan Home",
        },
    };

    try {
        await Http.post({
            url: `${tryGetGlobal("HA_URL")}/states/input_boolean.ryan_home`,
            body,
            headers: {
                "Authorization": `Bearer ${tryGetGlobal("HA_TOKEN")}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: toggleHome.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    const state = tryGetLocal("par1") as "on" | "off";
    toggleHome(state);
}
