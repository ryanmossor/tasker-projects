import Tasker from "../modules/tasker";
import { isEnvTasker, isNullOrEmpty, readJsonData } from "../modules/utils";
import { Quote, QuotesJson } from "../types/types";

export function notifyTodaysQuote(quotesJson: QuotesJson) {
    const todaysQuote: Quote = quotesJson.daily.quotes.find((x) => x.id === quotesJson.daily.todaysQuoteId);

    const formattedQuote = isNullOrEmpty(todaysQuote.author)
        ? `"${todaysQuote.quote}"`
        : `"${todaysQuote.quote}" - ${todaysQuote.author}`;

    return formattedQuote;
}

if (isEnvTasker()) {
    const quotesJson = readJsonData<QuotesJson>({ filename: "quotes.json" });
    const todaysQuote = notifyTodaysQuote(quotesJson.data);
    Tasker.setLocal("todays_quote", todaysQuote);
    Tasker.exit();
}
