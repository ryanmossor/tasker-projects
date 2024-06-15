const checkinType = /** @type {'Morning'|'Evening'} */(tryGetLocal("checkin_type")); // stored as task variable
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
    <div class="m-6 py-5 rounded-xl bg-white drop-shadow-lg dark:bg-zinc-900">
        ${checkinType === "Evening" ? $CardHeader(listName) : ""}
        ${itemList.reduce((acc, itemName, i) => acc + $ChecklistItem({ itemName, includeHr: i < itemList.length - 1 }), "")}
    </div>`;
}

/**
 * Generates a component with a labeled range `<input>` and an indicator of the input's current value
 * @param {string} itemName - Name of checklist item
 * @returns {string} Range item component
 */
function $RangeItem(itemName) {
    return `
    <p class="pl-8 py-2">${itemName}</p>
    <div class="flex items-center justify-center mb-4 px-4">
        <input class="h-8 w-8/12" type="range" value="1" min="1" max="5"
               data-item-name="${itemName}" oninput="this.nextElementSibling.value = this.value">
        <output class="w-4 pl-6">1</output>
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
    <div class="m-6 py-5 rounded-xl bg-white drop-shadow-lg dark:bg-zinc-900">
        ${checkinType === "Evening" ? $CardHeader(listName) : ""}
        ${itemList.reduce((acc, itemName) => acc + $RangeItem(itemName), "")}
    </div>`;
}

addEventListener("submit", (event) => {
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
        }
        tasker.flash("Check-in successfully completed");
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
});

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
