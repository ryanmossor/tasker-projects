import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import * as tasker from "../modules/tasker";
import { isEnvTasker, readJsonData, tryGetGlobal, tryGetLocal } from "../modules/utils";
import { YogaJson } from "../types/types";
import { Playlist } from "../types/youtubeTypes";

type PlaylistInfo = { playlistId: string, playlistTitle: string };

export async function getPlaylistTitleAndId(ytApiKey: string, playlistUrl: string): Promise<PlaylistInfo> {
    try {
        const playlistId = playlistUrl.split("&")[1].replace("list=", "");

        const data = await Http.get<Playlist>({
            url: "https://www.googleapis.com/youtube/v3/playlists",
            params: {
                key: ytApiKey,
                id: playlistId,
                part: "snippet",
            },
        });

        return {
            playlistId,
            playlistTitle: data?.items[0]?.snippet?.title,
        };
    } catch (error) {
        Logger.error({ message: error, funcName: getPlaylistTitleAndId.name });
        tasker.exit();
    }
}

if (isEnvTasker()) {
    const yogaJson = readJsonData<YogaJson>({ filename: "yoga.json" });
    const apiKey = tryGetGlobal("YOUTUBE_KEY");
    const playlistUrl = tryGetLocal("input");

    (async () => {
        const { playlistId, playlistTitle } = await getPlaylistTitleAndId(apiKey, playlistUrl);

        yogaJson.data = {
            ...yogaJson.data,
            currentVidIndex: 0,
            playlistId,
            playlistTitle,
        };

        tasker.setLocal("playlist_title", playlistTitle);
        yogaJson.save();
        tasker.exit();
    })();
}
