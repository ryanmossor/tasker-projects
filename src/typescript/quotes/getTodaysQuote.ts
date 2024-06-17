import { QuotesJson } from "../dev/types";
import { readJsonData, sample, shuffle } from "../modules/utils";

const quotesJson = readJsonData<QuotesJson>({ filename: "quotes.json" });

const dailyQuotes = quotesJson.data.daily.quotes;
const availableQuotes = shuffle(dailyQuotes.filter((quote) => !quote.hasAppeared));

let selectedQuote = sample(availableQuotes);

while (selectedQuote.id === quotesJson.data.daily.todaysQuoteId) {
    selectedQuote = sample(availableQuotes);
}

selectedQuote.hasAppeared = true;
quotesJson.data.daily.todaysQuoteId = selectedQuote.id;

// Reset `hasAppeared` property of all quotes to false once all quotes have appeared
if (availableQuotes.length === 1) {
    quotesJson.data.daily.quotes = dailyQuotes.map((obj) => ({ ...obj, hasAppeared: false }));
}

quotesJson.save();
