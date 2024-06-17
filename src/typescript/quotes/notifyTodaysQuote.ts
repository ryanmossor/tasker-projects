import * as tasker from "../dev/tasker";
import { Quote, QuotesJson } from "../dev/types";
import { isEnvTasker, isNullOrEmpty, readJsonData } from "../modules/utils";

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
    tasker.setLocal("todays_quote", todaysQuote);
    tasker.exit();
}
