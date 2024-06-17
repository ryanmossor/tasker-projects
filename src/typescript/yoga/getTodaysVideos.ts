import { Temporal } from "temporal-polyfill";
import * as tasker from "../dev/tasker";
import { PlaylistItem, YogaJson } from "../dev/types";
import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import { isEnvTasker, readJsonData, tryGetGlobal } from "../modules/utils";

const ytApiUrl = "https://www.googleapis.com/youtube/v3";
const youtubeKey = tryGetGlobal("YOUTUBE_KEY");

/**
 * @param durationStr - Duration format: `PTxHxMxS`
 * @returns Video duration in `m:ss` or `h:mm:ss` format
 */
function formatVideoDuration(durationStr: string): string {
    const duration = Temporal.Duration.from(durationStr);
    const hours = duration.hours ? `${duration.hours}:` : "";
    const minutes = duration.hours ? String(duration.minutes).padStart(2, "0") : duration.minutes;
    const seconds = String(duration.seconds).padStart(2, "0");

    return `${hours}${minutes}:${seconds}`;
}

function formatTitle(title: string): string {
    return title.replace(/\s*\|.+$|\s*.\s*Yoga With Adriene/, "");
}

async function getPlaylistData(playlistId: string): Promise<PlaylistItem> {
    try {
        return await Http.get<PlaylistItem>({
            url: `${ytApiUrl}/playlistItems`,
            params: {
                key: youtubeKey,
                playlistId,
                part: "snippet",
                maxResults: 50,
            },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: getPlaylistData.name });
        tasker.exit();
    }
}

async function getVideoDuration(vidId: string): Promise<string> {
    try {
        const data = await Http.get({
            url: `${ytApiUrl}/videos`,
            params: {
                key: youtubeKey,
                id: vidId,
                part: "contentDetails",
            },
        });

        const { duration } = data.items[0].contentDetails;
        const formattedDuration = formatVideoDuration(duration);

        return formattedDuration;
    } catch (error) {
        Logger.error({ message: error, funcName: getVideoDuration.name });
        tasker.exit();
    }
}

async function updateResultsObj(
    results: {} | YogaJson["videos"],
    videoId: string,
    title: string,
): Promise<YogaJson["videos"]> {
    const prefix = "yogaVideo" in results ? "meditation" : "yoga";

    return {
        ...results,
        [`${prefix}Video`]: `https://youtube.com/watch?v=${videoId}`,
        [`${prefix}Title`]: formatTitle(title),
        [`${prefix}Duration`]: await getVideoDuration(videoId),
    } as YogaJson["videos"];
}

async function getTodaysVideos(yogaJson: YogaJson): Promise<YogaJson> {
    const playlistData = await getPlaylistData(yogaJson.playlistId);
    const currentIndex = yogaJson.currentVidIndex;
    const currentItem = playlistData?.items[currentIndex];
    const nextItem = playlistData?.items[currentIndex + 1];

    if (!currentItem) {
        return yogaJson;
    }

    const currentId = currentItem.snippet.resourceId.videoId;
    const currentTitle = currentItem.snippet.title;

    const updatedYogaJson = structuredClone(yogaJson);
    const results = await updateResultsObj({}, currentId, currentTitle);

    if (updatedYogaJson.currentMonth === "January" || !nextItem) {
        return { ...updatedYogaJson, videos: results };
    }

    const nextTitle = nextItem.snippet.title;
    const titleIncludesMeditation = (title: string) => title.toLowerCase().includes("meditation");

    if (!titleIncludesMeditation(currentTitle) && titleIncludesMeditation(nextTitle)) {
        const nextId = nextItem.snippet.resourceId.videoId;
        const resultsWithMeditation = await updateResultsObj(results, nextId, nextTitle);
        return { ...updatedYogaJson, videos: resultsWithMeditation, currentVidIndex: currentIndex + 2 };
    }

    return { ...updatedYogaJson, videos: results, currentVidIndex: currentIndex + 1 };
}

if (isEnvTasker()) {
    const yogaJson = readJsonData<YogaJson>({ filename: "yoga.json" });

    (async () => {
        yogaJson.data = await getTodaysVideos(yogaJson.data);
        tasker.setGlobal("YOGA_TIME", yogaJson.data.defaultNotifTime);
        yogaJson.save();
        tasker.exit();
    })();
}
