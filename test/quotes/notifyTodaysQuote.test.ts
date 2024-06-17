import { QuotesJson } from "../../src/typescript/dev/types";
import { notifyTodaysQuote } from "../../src/typescript/quotes/notifyTodaysQuote";

describe("notifyTodaysQuote", () => {
    it("returns correct quote and author if author is present", () => {
    // arrange
        const quotesJson: QuotesJson = {
            daily: {
                quotes: [
                    {
                        quote: "quote 1",
                        author: "author 1",
                        id: 1,
                        hasAppeared: true,
                    },
                ],
                nextId: 2,
                todaysQuoteId: 1,
            },
            weekly: "",
            monthly: "",
        };

        const expectedQuoteObj = quotesJson.daily.quotes[0];
        const expectedQuoteString = `"${expectedQuoteObj.quote}" - ${expectedQuoteObj.author}`;

        // act
        const result = notifyTodaysQuote(quotesJson);

        // assert
        expect(result).toBe(expectedQuoteString);
    });

    it("returns only quote if author not present", () => {
    // arrange
        const quotesJson: QuotesJson = {
            daily: {
                quotes: [
                    {
                        quote: "quote 1",
                        author: "",
                        id: 1,
                        hasAppeared: true,
                    },
                ],
                nextId: 2,
                todaysQuoteId: 1,
            },
            weekly: "",
            monthly: "",
        };

        // act
        const result = notifyTodaysQuote(quotesJson);

        // assert
        expect(result).toBe(`"${quotesJson.daily.quotes[0].quote}"`);
    });
});
