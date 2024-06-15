import { Temporal } from "temporal-polyfill";
import { Http } from "../modules/httpClient";
import Logger from "../modules/logger";
import Tasker from "../modules/tasker";
import { formatDateTime, isEnvTasker, readJsonData, tryGetGlobal } from "../modules/utils";
import { YogaJson } from "../types/types";
import { Playlist } from "../types/youtubeTypes";

export async function getLatestPlaylist(ytApiKey: string, yogaJson: YogaJson): Promise<Playlist> {
    try {
        return await Http.get<Playlist>({
            url: "https://www.googleapis.com/youtube/v3/playlists",
            params: {
                key: ytApiKey,
                channelId: yogaJson.ywaChannelId,
                part: "snippet",
            },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: getLatestPlaylist.name });
        Tasker.exit();
    }
}

export function updatePlaylistData(playlistData: Playlist, yogaJson: YogaJson): YogaJson {
    const currentMonth = formatDateTime(Temporal.Now.plainDateISO(), "MMMM");
    let playlistId: string;
    let playlistTitle: string;

    // If it's January, set playlistId to YWA channel ID (replacing UC with UU).
    // This enables getting the latest videos from the channel during January since
    // the playlist doesn't tend to get updated immediately.
    if (currentMonth === "January") {
        playlistId = yogaJson.ywaChannelId.replace(/^UC/, "UU");
        playlistTitle = "Yoga With Adriene (Latest Videos)";
    } else {
        playlistId = playlistData.items[0].id;
        playlistTitle = playlistData.items[0].snippet.title;
    }

    const updatedYogaJson: YogaJson = {
        ...structuredClone(yogaJson),
        currentVidIndex: 0,
        currentMonth,
        playlistId,
        playlistTitle,
    };

    return updatedYogaJson;
}

if (isEnvTasker()) {
    const yogaJson = readJsonData<YogaJson>({ filename: "yoga.json" });
    const apiKey = tryGetGlobal("YOUTUBE_KEY");

    (async () => {
        const playlistData = await getLatestPlaylist(apiKey, yogaJson.data);
        const updatedYogaJson = updatePlaylistData(playlistData, yogaJson.data);

        yogaJson.save();
        Tasker.setLocal("playlist_title", updatedYogaJson.playlistTitle);
        Tasker.exit();
    })();
}
