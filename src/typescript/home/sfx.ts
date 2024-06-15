import Logger from "../modules/logger";
import * as tasker from "../modules/tasker";
import { tryGetGlobal } from "../modules/utils";

type SfxJson = {
    nextIndex: number;
    nextSfxFile: string;
};

try {
    const sfxJson: SfxJson = JSON.parse(tryGetGlobal("SFX_JSON"));
    const paths: string[] = sfxJson.nextSfxFile.split("/");
    const filename: string = paths[paths.length - 1];
    const logPath = "/sdcard/Tasker/log/sfx-log.txt";

    const cmd = `
        settings put global charging_started_sound ${sfxJson.nextSfxFile}
        settings put secure charging_sounds_enabled 0
        echo "${filename}" >> ${logPath}
        echo "$(tail -10 ${logPath})" > ${logPath}`;
    tasker.shell(cmd, true, 10);

    const sfxFiles: string[] = tasker.listFiles("/sdcard/Notifications/sfx", false).split("\n");
    sfxJson.nextIndex = sfxJson.nextIndex + 1 < sfxFiles.length ? sfxJson.nextIndex + 1 : 0;
    sfxJson.nextSfxFile = sfxFiles[sfxJson.nextIndex];

    tasker.setGlobal("SFX_JSON", JSON.stringify(sfxJson));
} catch (error) {
    Logger.error({ message: error, funcName: "sfx" });
}
