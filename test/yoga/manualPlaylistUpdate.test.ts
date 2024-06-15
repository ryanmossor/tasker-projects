import Http from "../../src/typescript/modules/httpClient";
import { Playlist } from "../../src/typescript/types/youtubeTypes";
import { getPlaylistTitleAndId } from "../../src/typescript/yoga/manualPlaylistUpdate";

describe("getPlaylistTitleAndId", () => {
    const playlistData: Playlist = {
        items: [
            {
                id: "testPlaylistId",
                snippet: {
                    title: "newManualPlaylistTitle",
                },
            },
        ],
    };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return playlist ID and title for provided playlist URL", async () => {
        // arrange
        const mockYoutubeKey = "youtubeKey";
        const playlistUrl = `http://test.test.test/playlist&list=${playlistData.items[0].id}`;

        const mockHttpGet = vi.spyOn(Http, "get").mockImplementation(async () => (playlistData));

        const expectedResult = {
            playlistId: playlistData.items[0].id,
            playlistTitle: playlistData.items[0].snippet.title,
        };

        // act
        const result = await getPlaylistTitleAndId(mockYoutubeKey, playlistUrl);

        // assert
        expect(mockHttpGet).toHaveBeenCalledTimes(1);
        expect(mockHttpGet).toHaveReturnedWith(playlistData);
        expect(mockHttpGet).toHaveBeenCalledWith({
            url: "https://www.googleapis.com/youtube/v3/playlists",
            params: {
                key: mockYoutubeKey,
                id: playlistData.items[0].id,
                part: "snippet",
            },
        });
        expect(result).toStrictEqual(expectedResult);
    });
});
