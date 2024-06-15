import Http from "../../src/typescript/modules/httpClient";
import { YogaJson } from "../../src/typescript/types/types";
import { Playlist } from "../../src/typescript/types/youtubeTypes";
import { getLatestPlaylist, updatePlaylistData } from "../../src/typescript/yoga/getLatestPlaylist";

describe("YWA monthly playlist", () => {
    const mockYoutubeKey = "youtubeKey";

    const yogaJson: YogaJson = {
        ywaChannelId: "UCFKE7WVJfvaHW5q283SxchA",
        currentMonth: "June",
        currentVidIndex: 5,
        defaultNotifTime: "7.20",
        playlistId: "oldPlaylistId",
        playlistTitle: "oldPlaylistTitle",
        videos: {
            yogaVideo: "http://test.test.test/watch?v=videoId",
            yogaTitle: "title",
            yogaDuration: "10:00",
        },
    };

    const playlistData: Playlist = {
        items: [
            {
                id: "newPlaylistId",
                snippet: {
                    title: "newPlaylistTitle",
                },
            },
        ],
    };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getLatestPlaylist", () => {
        it("should get YWA playlist data", async () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2023-01-15T20:25:10.000Z")); // called by Temporal
            const mockHttpGet = vi.spyOn(Http, "get").mockImplementation(async () => (playlistData));

            // act
            const result = await getLatestPlaylist(mockYoutubeKey, yogaJson);

            // assert
            expect(mockHttpGet).toHaveBeenCalledTimes(1);
            expect(mockHttpGet).toHaveReturnedWith(playlistData);
            expect(mockHttpGet).toHaveBeenCalledWith({
                url: "https://www.googleapis.com/youtube/v3/playlists",
                params: {
                    channelId: yogaJson.ywaChannelId,
                    key: mockYoutubeKey,
                    part: "snippet",
                },
            });
            expect(result).toBe(playlistData);
        });
    });

    describe("updatePlaylistData", () => {
        it("should update yoga JSON with latest playlist ID and title if not January", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2023-08-22T20:25:10.000Z")); // called by Temporal

            // act
            const result = updatePlaylistData(playlistData, yogaJson);

            // assert
            expect(result).toEqual({
                ...yogaJson,
                currentVidIndex: 0,
                currentMonth: "August",
                playlistId: playlistData.items[0].id,
                playlistTitle: playlistData.items[0].snippet.title,
            });
        });

        it("should not update yoga JSON with playlist title/ID if January", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2023-01-22T20:25:10.000Z")); // called by Temporal

            // act
            const result = updatePlaylistData(playlistData, yogaJson);

            // assert
            expect(result).toEqual({
                ...yogaJson,
                currentVidIndex: 0,
                currentMonth: "January",
                playlistId: yogaJson.ywaChannelId.replace(/^UC/, "UU"),
                playlistTitle: "Yoga With Adriene (Latest Videos)",
            });
        });
    });
});
