import { Temporal } from "temporal-polyfill";
import Tasker from "../../src/typescript/modules/tasker";
import { formatDateTime, isEnvTasker, isNullOrEmpty, readJsonData } from "../../src/typescript/modules/utils";

describe("utils", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("isNullOrEmpty", () => {
        test.each([
            [],
            {},
            "",
            "  ",
            null,
            undefined,
            "undefined",
        ])("should return true for empty test cases", (testCase) => {
            // arrange & act
            const result = isNullOrEmpty(testCase);

            // assert
            expect(result).toBe(true);
        });

        test.each([
            "[]",
            "{}",
            [1, 2, 3],
            { a: 1 },
            "hello",
            "  hello  ",
            1,
        ])("should return false for non-empty test cases", (testCase) => {
            // arrange & act
            const result = isNullOrEmpty(testCase);

            // assert
            expect(result).toBe(false);
        });
    });

    describe("isEnvTasker", () => {
        it("should return false if current env is not Tasker", () => {
            // arrange
            vi.spyOn(Tasker, "global").mockImplementation(() => "");

            // act
            const result = isEnvTasker();

            // assert
            expect(result).toBe(false);
        });

        it("should return true if current env is Tasker", () => {
            // arrange
            vi.spyOn(Tasker, "global").mockImplementation(() => "34");

            // act
            const result = isEnvTasker();

            // assert
            expect(result).toBe(true);
        });
    });

    describe("readJsonFile", () => {
        it("should append .json extension if not provided", () => {
            // arrange
            const expectedJsonData = { test: "test" };
            vi.spyOn(Tasker, "readFile").mockImplementation(() => JSON.stringify(expectedJsonData));

            // act
            const result = readJsonData({ filename: "test" });

            // assert
            expect(result.data).toStrictEqual(expectedJsonData);
        });

        it("should exit if JSON file not found", () => {
            // arrange
            vi.spyOn(Tasker, "readFile").mockImplementation(() => "undefined");
            const taskerExit = vi.spyOn(Tasker, "exit").mockImplementation(() => {});

            // act
            const result = readJsonData({ filename: "test.json" });

            // assert
            expect(result).toBeNull();
            expect(taskerExit).toHaveBeenCalledTimes(1);
        });

        it("should exit if JSON file is invalid", () => {
            // arrange
            vi.spyOn(Tasker, "readFile").mockImplementation(() => "invalid JSON");
            const taskerExit = vi.spyOn(Tasker, "exit").mockImplementation(() => {});

            // act
            const result = readJsonData({ filename: "test.json" });

            // assert
            expect(result).toBeNull();
            expect(taskerExit).toHaveBeenCalledTimes(1);
        });

        ["testKey.json", "checkin.json"].forEach((filename) => {
            it(`should return JSON data for ${filename}`, () => {
                // arrange
                const expectedJsonData = { test: "test" };
                vi.spyOn(Tasker, "readFile").mockImplementation(() => JSON.stringify(expectedJsonData));
                const taskerExit = vi.spyOn(Tasker, "exit").mockImplementation(() => {});

                // act
                const result = readJsonData({ filename });

                // assert
                expect(result.data).toStrictEqual(expectedJsonData);
                expect(taskerExit).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe("formatDateTime", () => {
        test.each([
            "invalid",
            "14:49:23", // date required
            "2024-05-11 0:49:23", // leading 0 required for hour
            "05/11/2024 14:49:23", // invalid date format
        ])("should exit and return null given invalid input string %s", (inputStr) => {
            // arrange
            const taskerExit = vi.spyOn(Tasker, "exit").mockImplementation(() => {});

            // act
            const result = formatDateTime(inputStr, "h:mm A");

            // assert
            expect(result).toBeNull();
            expect(taskerExit).toHaveBeenCalledTimes(1);
        });

        test.each([
            ["00:00:00", "2024-05-11", "HH:mm:ss"],
            ["16:49", "2024-05-11 16:49:23", "HH:mm"],
            ["04:49 PM", "2024-05-11 16:49:23", "hh:mm A"],
            ["4:49:03 pm", "2024-05-11 16:49:03", "h:mm:ss a"],
            ["12:49:23 am", "2024-05-11 00:49:23", "h:mm:ss a"],
            ["0:49:23 am", "2024-05-11 00:49:23", "H:mm:ss a"],
            ["00:49:23 am", "2024-05-11 00:49:23", "HH:mm:ss a"],
            ["12:49:23 pm", "2024-05-11 12:49:23", "h:mm:ss a"],
            ["9:23", "2024-05-11 16:09:23", "m:ss"],
            ["3", "2024-05-11 16:09:03", "s"],
            ["2024-05-11 4:49:23 PM", "2024-05-11 16:49:23", "YYYY-MM-DD h:mm:ss A"],
            ["Thursday Oct 10 4:49 PM", "2024-10-10 16:49:23", "DDDD MMM DD h:mm A"],
            ["Tue October 1 6:49 AM", "2024-10-01 06:49:23", "DDD MMMM D H:mm A"],
            ["10/01/24", "2024-10-01 06:49:23", "MM/DD/YY"],
            ["20241001064923", "2024-10-01 06:49:23", "YYYYMMDDHHmmss"],
        ])("should return '%s' given the input string '%s' and the format string '%s'", (expectedResult, inputStr, formatStr) => {
            // arrange & act
            const result = formatDateTime(inputStr, formatStr);

            // assert
            expect(result).toEqual(expectedResult);
        });

        it("should format Temporal.PlainDate as input", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-11T21:43:10")); // called by Temporal

            // act
            const result = formatDateTime(Temporal.Now.plainDateISO(), "YYYY-MM-DD HH:mm:ss");

            // assert
            expect(result).toBe("2024-05-11 00:00:00");
        });

        it("should format Temporal.PlainDateTime as input", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-11T21:43:10")); // called by Temporal

            // act
            const result = formatDateTime(Temporal.Now.plainDateTimeISO(), "YYYY-MM-DD HH:mm:ss");

            // assert
            expect(result).toBe("2024-05-11 21:43:10");
        });

        it("should format Temporal.ZonedDateTime as input", () => {
            // arrange
            Date.now = vi.fn().mockReturnValue(new Date("2024-05-11T21:43:10")); // called by Temporal

            // act
            const result = formatDateTime(Temporal.Now.zonedDateTimeISO(), "YYYY-MM-DD HH:mm:ss");

            // assert
            expect(result).toBe("2024-05-11 21:43:10");
        });
    });
});
