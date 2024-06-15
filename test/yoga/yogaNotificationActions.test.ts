import Tasker from "../../src/typescript/modules/tasker";
import { YogaJson } from "../../src/typescript/types/types";
import { yogaNotificationActions } from "../../src/typescript/yoga/yogaNotificationActions";

describe("yogaNotificationActions", () => {
    beforeEach(() => {
        vi.spyOn(Tasker, "browseURL").mockImplementation(() => {});
        vi.spyOn(Tasker, "performTask").mockImplementation(() => true);
        vi.spyOn(Tasker, "exit").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const yogaJsonData: YogaJson = {
        ywaChannelId: "ywaChannelId",
        currentVidIndex: 0,
        currentMonth: "currentMonth",
        defaultNotifTime: "defaultNotifTime",
        playlistId: "playlistId",
        playlistTitle: "playlistTitle",
        videos: {
            yogaVideo: "yogaVideo",
            yogaTitle: "yogaTitle",
            yogaDuration: "yogaDuration",
            meditationVideo: "meditationVideo",
            meditationTitle: "meditationTitle",
            meditationDuration: "meditationDuration",
        },
    };

    it("should launch yogaVideo if actionType is 'Yoga'", () => {
    // arrange
        const actionType = "Yoga";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(Tasker.browseURL).toHaveBeenCalledWith(yogaJsonData.videos.yogaVideo);
        expect(Tasker.performTask).not.toHaveBeenCalled();
        expect(Tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should launch meditationVideo if actionType is 'Meditation'", () => {
    // arrange
        const actionType = "Meditation";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(Tasker.browseURL).toHaveBeenCalledWith(yogaJsonData.videos.meditationVideo);
        expect(Tasker.performTask).not.toHaveBeenCalled();
        expect(Tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should launch playlist if actionType is 'Playlist'", () => {
    // arrange
        const actionType = "Playlist";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(Tasker.browseURL).toHaveBeenCalledWith(`https://youtube.com/playlist?list=${yogaJsonData.playlistId}`);
        expect(Tasker.performTask).not.toHaveBeenCalled();
        expect(Tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should re-run Get Today's Video(s) task if actionType is 'retry'", () => {
    // arrange
        const actionType = "retry";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(Tasker.browseURL).not.toHaveBeenCalled();
        expect(Tasker.performTask).toHaveBeenCalledWith("Get Today's Video(s)", 101);
        expect(Tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should only exit if actionType not supported", () => {
    // arrange
        const actionType = "invalid action type";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(Tasker.browseURL).not.toHaveBeenCalled();
        expect(Tasker.performTask).not.toHaveBeenCalled();
        expect(Tasker.exit).toHaveBeenCalledTimes(1);
    });
});
