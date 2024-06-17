import * as tasker from "../dev/tasker";
import { YogaJson } from "../dev/types";
import { isEnvTasker, readJsonData, tryGetLocal } from "../modules/utils";

export function yogaNotificationActions(actionType: string, yogaJsonData: YogaJson): void {
    if (actionType === "Yoga") {
        tasker.browseURL(yogaJsonData.videos.yogaVideo);
    } else if (actionType === "Meditation") {
        tasker.browseURL(yogaJsonData.videos.meditationVideo);
    } else if (actionType === "Playlist") {
        tasker.browseURL(`https://youtube.com/playlist?list=${yogaJsonData.playlistId}`);
    } else if (actionType === "retry") {
        tasker.performTask("Get Today's Video(s)", 101);
    }

    tasker.exit();
}

if (isEnvTasker()) {
    tasker.statusBar(false);
    const yogaJson = readJsonData<YogaJson>({ filename: "yoga.json" });
    const actionType = tryGetLocal("par1");
    yogaNotificationActions(actionType, yogaJson.data);
}
