import * as tasker from "../dev/tasker";
import { Quote, QuotesJson } from "../dev/types";
import { isEnvTasker, readJsonData } from "../modules/utils";

if (isEnvTasker()) {
    const quotesJson: QuotesJson = readJsonData<QuotesJson>({ filename: "quotes.json" }).data;
    const todaysQuote: Quote = quotesJson.daily.quotes.find((x) => x.id === quotesJson.daily.todaysQuoteId);
    tasker.setLocal("todays_quote", JSON.stringify(todaysQuote));
    tasker.exit();
}
