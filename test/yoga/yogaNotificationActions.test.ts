import * as tasker from "../../src/typescript/modules/tasker";
import { YogaJson } from "../../src/typescript/types/types";
import { yogaNotificationActions } from "../../src/typescript/yoga/yogaNotificationActions";

describe("yogaNotificationActions", () => {
    beforeEach(() => {
        vi.spyOn(tasker, "browseURL").mockImplementation(() => {});
        vi.spyOn(tasker, "performTask").mockImplementation(() => true);
        vi.spyOn(tasker, "exit").mockImplementation(() => {});
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
        expect(tasker.browseURL).toHaveBeenCalledWith(yogaJsonData.videos.yogaVideo);
        expect(tasker.performTask).not.toHaveBeenCalled();
        expect(tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should launch meditationVideo if actionType is 'Meditation'", () => {
    // arrange
        const actionType = "Meditation";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(tasker.browseURL).toHaveBeenCalledWith(yogaJsonData.videos.meditationVideo);
        expect(tasker.performTask).not.toHaveBeenCalled();
        expect(tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should launch playlist if actionType is 'Playlist'", () => {
    // arrange
        const actionType = "Playlist";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(tasker.browseURL).toHaveBeenCalledWith(`https://youtube.com/playlist?list=${yogaJsonData.playlistId}`);
        expect(tasker.performTask).not.toHaveBeenCalled();
        expect(tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should re-run Get Today's Video(s) task if actionType is 'retry'", () => {
    // arrange
        const actionType = "retry";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(tasker.browseURL).not.toHaveBeenCalled();
        expect(tasker.performTask).toHaveBeenCalledWith("Get Today's Video(s)", 101);
        expect(tasker.exit).toHaveBeenCalledTimes(1);
    });

    it("should only exit if actionType not supported", () => {
    // arrange
        const actionType = "invalid action type";

        // act
        yogaNotificationActions(actionType, yogaJsonData);

        // assert
        expect(tasker.browseURL).not.toHaveBeenCalled();
        expect(tasker.performTask).not.toHaveBeenCalled();
        expect(tasker.exit).toHaveBeenCalledTimes(1);
    });
});
