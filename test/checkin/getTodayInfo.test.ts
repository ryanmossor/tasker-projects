import { getTodayInfo } from "../../src/typescript/checkin/getTodayInfo";

describe("getTodayInfo", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test.each([
        ["January", "01", 31, 0],
        ["February", "02", 28, 3, "AE999"],
        ["March", "03", 31, 0],
        ["April", "04", 30, 1],
        ["May", "05", 31, 0],
        ["June", "06", 30, 1],
        ["July", "07", 31, 0],
        ["August", "08", 31, 0],
        ["September", "09", 30, 1],
        ["October", "10", 31, 0],
        ["November", "11", 30, 1],
        ["December", "12", 31, 0],
    ])("should return correct info for %s", (monthName, month, daysInMonth, subtractDays, cellReference = "AG999") => {
        // arrange
        Date.now = vi.fn().mockReturnValue(new Date(`2023-${month}-01T20:25:10.000Z`)); // called by Temporal

        // act
        const result = getTodayInfo();

        // assert
        expect(result).toEqual({
            daysInMonth,
            monthOfYear: Number(month).toString(),
            monthAbbr: monthName.slice(0, 3),
            month: monthName,
            uppercaseMonth: monthName.toUpperCase(),
            spreadsheetId: "sheetId",
            cellReference,
            subtractDays,
        });
    });

    it("should return correct info for February in leap year", () => {
        // arrange
        Date.now = vi.fn().mockReturnValue(new Date("2024-02-01T20:25:10.000Z")); // called by Temporal

        // act
        const result = getTodayInfo();

        // assert
        expect(result).toEqual({
            daysInMonth: 29,
            monthOfYear: "2",
            monthAbbr: "Feb",
            month: "February",
            uppercaseMonth: "FEBRUARY",
            spreadsheetId: "sheetId",
            cellReference: "AF999",
            subtractDays: 2,
        });
    });
});
