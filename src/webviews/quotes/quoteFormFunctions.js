function submitQuote() {
    try {
        /** @type {JsonData<QuotesJson>} */
        const quotesJson = readJsonData({ filename: "quotes.json" });
        quotesJson.data.daily.quotes.push({
            quote: /** @type {HTMLInputElement} */(document.getElementById("quote")).value.trim(),
            author: /** @type {HTMLInputElement} */(document.getElementById("author")).value.trim(),
            hasAppeared: false,
            id: quotesJson.data.daily.nextId,
        });
        quotesJson.data.daily.nextId += 1;
        quotesJson.save();

        tasker.flash("Quote added successfully");
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
}
