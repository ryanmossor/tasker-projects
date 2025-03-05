const checkinType = /** @type {'Morning'|'Evening'|'Edit'} */(tryGetLocal("checkin_type")); // stored as task variable
const amountInputPromptMapping = {
    Alcohol: "How many drinks?",
};

/**
 * Toggles visibility of the amount `<input>` associated with the `selectedItem`
 * @param {HTMLInputElement} selectedItem - Parent element to which the amount `<input>` belongs
 */
function toggleAmountInput(selectedItem) {
    const itemName = selectedItem.id;

    const numberInputContainer = document.getElementById(`${itemName}-amount-input-container`);
    const selectedCheckbox = /** @type {HTMLInputElement} */(document.getElementById(itemName));
    numberInputContainer.style.display = selectedCheckbox.checked ? "flex" : "none";

    const numberInputElement = /** @type {HTMLInputElement} */(document.getElementById(`${itemName}-amount`));
    numberInputElement.required = selectedCheckbox.checked;
    numberInputElement.value = null;
}

/**
 * Generates a component with an input field for amount/quantity
 * @param {string} itemName - Name of checklist item
 * @returns {string} Amount input component
 */
function $AmountInput(itemName) {
    return `
    <div id="${itemName}-amount-input-container" class="flex gap-4 pb-6" style="display: none;">
        <label class="flex-auto pl-8 my-auto italic" for="${itemName}-amount">
            ${amountInputPromptMapping[itemName] ?? `How much ${itemName.toLowerCase()}?`}
        </label>
        <input class="border-2 dark:border-0 flex-none p-2 me-8 h-10 w-20 my-auto rounded text-black text-right"
               name="${itemName}-amount" id="${itemName}-amount" data-item-name="${itemName}" type="number" />
    </div>`;
}

/**
 * Generates a card header component
 * @param {string} listName - Header name
 * @returns {string} Card header component
 */
function $CardHeader(listName) {
    return `<h2 class="text-2xl font-medium italic ml-5 mt-2 mb-6">${listName}</h2>`;
}

/**
 * Generates a component with a label and checkbox (and a hidden amount `<input>` if `itemName` ends with `**`)
 * @param {Object} args
 * @param {string} args.itemName - Name of checklist item
 * @param {boolean} args.includeHr - Whether to include an `<hr>` element beneath the checklist item component
 * @returns {string} Checklist item component
 */
function $ChecklistItem({ itemName, includeHr }) {
    const name = itemName.replace("**", "");

    return `
    <div class="flex items-center my-3 px-6">
        <label for="${name}" class="w-10/12 mx-auto">${name}</label>
        <input type="checkbox" id="${name}" name="${name}" 
               class="w-5 h-5 mx-auto" ${itemName.endsWith("**") ? "onchange='toggleAmountInput(this)'" : ""} />
    </div>
    ${itemName.endsWith("**") ? $AmountInput(name) : ""}
    ${includeHr ? "<hr class='w-10/12 mx-auto'>" : ""}`;
}

/**
 * Generates a component with a header and labeled checkbox inputs for each item in `itemList`
 * @param {string} listName - Name of list; used as header for checklist card
 * @param {string[]} itemList - Checklist items
 * @returns {string} Checklist card component
 */
function $ChecklistCard(listName, itemList) {
    return `
    <div id="${listName}" class="m-6 py-5 rounded-xl bg-white drop-shadow-lg dark:bg-zinc-900">
        ${checkinType !== "Morning" ? $CardHeader(listName) : ""}
        ${itemList.reduce((acc, itemName, i) => acc + $ChecklistItem({ itemName, includeHr: i < itemList.length - 1 }), "")}
    </div>`;
}

/**
 * Generates a component with a labeled range `<input>` and an indicator of the input's current value
 * @param {string} itemName - Name of checklist item
 * @param {string} value - Value
 * @returns {string} Range item component
 */
function $RangeItem(itemName, value = "1") {
    return `
    <p class="pl-8 py-2 mt-2">${itemName}</p>
    <div class="flex items-center justify-center mb-2 px-4">
        <input id="${itemName}" class="h-8 w-8/12" type="range" value="${value}" min="1" max="5"
               data-item-name="${itemName}" oninput="this.nextElementSibling.value = this.value">
        <output id="${itemName}-output" class="w-4 pl-6">${value}</output>
    </div>`;
}

/**
 * @param {Object} args
 * @param {string} args.itemName - Name of DateTime item
 * @param {string} args.id - ID of DateTime item
 * @param {string} args.timeZone - Time zone
 * @param {number} [args.unixTs] - Unix timestamp
 * @returns {string} Datetime component
 */
function $DatetimeItem({ itemName, id, timeZone, unixTs }) {
    let value = null;
    if (unixTs != null) {
        const dateTime = unixTs != null
            ? unixToDateTime(unixTs, timeZone)
            : null;
        value = formatDateTime(dateTime, "YYYY-MM-DDTHH:mm");
    }

    return `
     <div class="px-8 mt-3 mb-5">
        <div>
            <label for="${itemName}" class="w-10/12 mx-auto">${itemName}:</label>
        </div>
        <div>
            <input class="text-black ml-6 mt-3 w-10/12" id="${id}" type="datetime-local" name="${itemName}"
                   value="${value ?? ""}" />
        </div>
     </div>`;
}

/**
 * Generates a component with a header and labeled range inputs for each item in `itemList`
 * @param {string} listName - Name of list; used as header for checklist card
 * @param {string[]} itemList - Checklist items
 * @returns {string} Range card component
 */
function $RangeCard(listName, itemList) {
    return `
    <div id="${listName}" class="m-6 py-5 rounded-xl bg-white drop-shadow-lg dark:bg-zinc-900">
        ${checkinType !== "Morning" ? $CardHeader(listName) : ""}
        ${itemList.reduce((acc, itemName) => acc + $RangeItem(itemName), "")}
    </div>`;
}

function submitEdit() {
    try {
        /** @type {CheckinQueueItem} */
        const queueItem = JSON.parse(tryGetLocal("res"));
        queueItem.formResponse = {};

        /** @type {JsonData<CheckinQueueItem[]>} */
        const queueJson = readJsonData({ filename: "checkinQueue.json" });

        /** @type {HTMLInputElement[]} */
        const checkedItems = Array.from(document.querySelectorAll("input[type='checkbox']:checked"));
        for (const item of checkedItems) {
            queueItem.formResponse[item.name] = "1";
        }

        const inputTypes = ["input[type='range']", "input[type='number']"];
        inputTypes.forEach((selector) => {
            /** @type {HTMLInputElement[]} */
            const elements = Array.from(document.querySelectorAll(selector));
            for (const element of elements) {
                const { value, dataset } = element;
                if (value.trim() !== "") {
                    queueItem.formResponse[dataset.itemName] = value;
                }
            }
        });

        /** @type {HTMLInputElement[]} */
        const sleepTimes = Array.from(document.querySelectorAll("input[type='datetime-local']"));
        sleepTimes.forEach((time) => {
            if (!isNullOrEmpty(time.value)) {
                const localUnixTs = time.valueAsNumber;
                // Add timezone offset to get GMT unix timestamp
                const timezoneOffset = new Date(localUnixTs).getTimezoneOffset() * 60 * 1000;
                const gmtUnixTs = (localUnixTs + timezoneOffset) / 1000;
                queueItem[time.id] = gmtUnixTs;
            } else {
                delete queueItem[time.id];
            }
        });

        if (tasker.global("DRY_RUN") !== "1") {
            queueJson.data.push(queueItem);
            queueJson.save();
            tasker.setGlobal("CHECKIN_QUEUE_READY", "1");
        }

        tasker.flash("Check-in updated");
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
}

function submitCheckinForm(event) {
    try {
        /** @type {JsonData<CheckinQueueItem[]>} */
        const queueJson = readJsonData({ filename: "checkinQueue.json" });
        /** @type {CheckinFields} */
        const checkinFields = JSON.parse(tryGetGlobal("CHECKIN_FIELDS"));
        let queueItem = queueJson.data.find((x) => x.checkinFields.date === checkinFields.date);

        if (checkinType === "Evening") {
            if (queueItem != null && !confirm("Check-in response already exists for today. Overwrite?")) {
                event.preventDefault();
                return;
            }

            if (queueItem == null) {
                queueItem = {
                    checkinFields,
                    formResponse: {},
                    getWeight: tasker.global("LOG_WEIGHT") === "1",
                    timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
                };
                queueJson.data.push(queueItem);
            } else {
                queueItem.formResponse = {};
            }
        }

        if (checkinType === "Morning" && queueItem == null) {
            throw new Error(`No existing check-in item found for ${checkinFields.date}`);
        }

        /** @type {HTMLInputElement[]} */
        const checkedItems = Array.from(document.querySelectorAll("input[type='checkbox']:checked"));
        for (const item of checkedItems) {
            queueItem.formResponse[item.name] = "1";
        }

        const inputTypes = ["input[type='range']", "input[type='number']"];
        inputTypes.forEach((selector) => {
            /** @type {HTMLInputElement[]} */
            const elements = Array.from(document.querySelectorAll(selector));
            for (const element of elements) {
                const { value, dataset } = element;
                if (value.trim() !== "") {
                    queueItem.formResponse[dataset.itemName] = value;
                }
            }
        });

        queueJson.save();
        if (tasker.global("DRY_RUN") !== "1") {
            tasker.setGlobal(`${checkinType.toUpperCase()}_CHECKIN_COMPLETE`, "1");
            tasker.setLocal("form_submitted", "1");
        }
        tasker.flash("Check-in successfully completed");
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
}

function setupCheckinForm() {
    try {
        document.getElementById("header").innerText = `${checkinType} Check-in`;

        /** @type {JsonData<CheckinJson>} */
        const checkinJson = readJsonData({ filename: "checkin.json" });

        /** @type {CheckinListCategories} */
        const { checkboxItems, rangeItems } = checkinJson.data.lists[checkinType.toLowerCase()];

        const checklistsDiv = document.getElementById("checklists");
        for (const [listName, itemList] of Object.entries(checkboxItems)) {
            checklistsDiv.innerHTML += $ChecklistCard(listName, itemList);
        }

        const rangesDiv = document.getElementById("range-items");
        for (const [listName, itemList] of Object.entries(rangeItems)) {
            rangesDiv.innerHTML += $RangeCard(listName, itemList);
        }
    } catch (error) {
        tasker.flashLong(`${error}`);
        tasker.destroyScene(document.title);
    }
}

function setupCheckinEdit() {
    try {
        document.getElementById("header").innerText = `${checkinType} Check-in`;

        /** @type {CheckinQueueItem} */
        const checkinItem = JSON.parse(tryGetLocal("res"));
        if (checkinItem.timeZoneId == null) {
            checkinItem.timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }

        /** @type {JsonData<CheckinJson>} */
        const checkinJson = readJsonData({ filename: "checkin.json" });
        const { lists } = checkinJson.data;

        const checklistsDiv = document.getElementById("checklists");
        for (const [listName, itemList] of Object.entries(lists.evening.checkboxItems)) {
            checklistsDiv.innerHTML += $ChecklistCard(listName, itemList);
        }

        const rangesDiv = document.getElementById("range-items");
        for (const [listName, itemList] of Object.entries(lists.evening.rangeItems)) {
            rangesDiv.innerHTML += $RangeCard(listName, itemList);
        }

        for (const [listName, itemList] of Object.entries(lists.morning.checkboxItems)) {
            const sleepChecklist = $ChecklistCard(listName, itemList);
            rangesDiv.innerHTML += sleepChecklist;
        }

        const sleepCard = document.getElementById("Sleep");
        sleepCard.innerHTML += "<hr class='w-10/12 mx-auto'>";
        sleepCard.innerHTML += $DatetimeItem({
            itemName: "Bedtime",
            id: "sleepStart",
            unixTs: checkinItem.sleepStart,
            timeZone: checkinItem.timeZoneId,
        });
        sleepCard.innerHTML += $DatetimeItem({
            itemName: "Wake-up time",
            id: "sleepEnd",
            unixTs: checkinItem.sleepEnd,
            timeZone: checkinItem.timeZoneId,
        });
        sleepCard.innerHTML += "<hr class='w-10/12 mx-auto'>";
        sleepCard.innerHTML += $RangeItem("Feel Well-Rested", checkinItem.formResponse["Feel Well-Rested"]);

        for (const [key, val] of Object.entries(checkinItem.formResponse)) {
            const inputElement = /** @type {HTMLInputElement} */(document.getElementById(key));
            if (inputElement == null) {
                console.warn("element not found:", key);
                continue;
            }

            if (inputElement.type === "checkbox") {
                inputElement.checked = true;
                const amountInput = /** @type {HTMLInputElement} */(document.getElementById(`${key}-amount`));
                if (amountInput != null) {
                    toggleAmountInput(inputElement);
                    amountInput.value = val;
                }
            } else if (inputElement.type === "range") {
                inputElement.value = val;
                const outputDisplay = /** @type {HTMLOutputElement} */(document.getElementById(`${key}-output`));
                outputDisplay.value = val;
            } else if (inputElement.type === "time") {
                inputElement.value = val;
            }
        }
    } catch (error) {
        tasker.flashLong(`${error}`);
        tasker.destroyScene(document.title);
    }
}

if (checkinType === "Edit") {
    setupCheckinEdit();
} else {
    setupCheckinForm();
}

addEventListener("submit", (event) => {
    if (checkinType === "Edit") {
        submitEdit();
    } else {
        submitCheckinForm(event);
    }
});
