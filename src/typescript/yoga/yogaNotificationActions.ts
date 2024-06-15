import Tasker from "../modules/tasker";
import { isEnvTasker, readJsonData, tryGetLocal } from "../modules/utils";
import { YogaJson } from "../types/types";

export function yogaNotificationActions(actionType: string, yogaJsonData: YogaJson): void {
    if (actionType === "Yoga") {
        Tasker.browseURL(yogaJsonData.videos.yogaVideo);
    } else if (actionType === "Meditation") {
        Tasker.browseURL(yogaJsonData.videos.meditationVideo);
    } else if (actionType === "Playlist") {
        Tasker.browseURL(`https://youtube.com/playlist?list=${yogaJsonData.playlistId}`);
    } else if (actionType === "retry") {
        Tasker.performTask("Get Today's Video(s)", 101);
    }

    Tasker.exit();
}

if (isEnvTasker()) {
    Tasker.statusBar(false);
    const yogaJson = readJsonData<YogaJson>({ filename: "yoga.json" });
    const actionType = tryGetLocal("par1");
    yogaNotificationActions(actionType, yogaJson.data);
}
