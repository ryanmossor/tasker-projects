let expenseFormId = 0;
let totalExpenseFormCounter = 0;

/** @type {JsonData<ExpensesJson>} */
const expensesJson = readJsonData({ filename: "expenses.json" });
const { categories, vendors } = expensesJson.data;

// const vendorOptions = vendors.map((vendor) => `<option value="${vendor}">${vendor}</option>`).join("");
// const datalist = `
// <datalist id="vendor-options">
//   ${vendorOptions}
// </datalist>`;

// document.body.innerHTML += datalist;

/** @returns {string} Delete button component */
function $DeleteButton() {
    return `
    <div class="container d-flex justify-content-end">
        <div class="row">
            <button type="button" class="btn btn-danger fw-bold" onclick="deleteExpenseForm('${expenseFormId}')"">
                X
            </button>
        </div>
    </div>`;
}

function addExpense() {
    const newExpenseFields = `
    <div id="expense-form-${expenseFormId}">

      ${expenseFormId > 0 ? "<hr class='mb-5 mt-4'>" : ""}

      <div class="input-group mb-3">
        <input type="date" id="date-picker-${expenseFormId}" name="date-picker-${expenseFormId}" 
               class="input-group date form-control" value="${new Date().toLocaleDateString("en-CA")}" required>
      </div>

      <div class="input-group mb-3">
        <select name="category-${expenseFormId}" id="category-${expenseFormId}" class="form-select" required>
          <option value="" selected disabled hidden>Category</option>
        </select>
      </div>

      <div class="input-group mb-3">
        <input type="text" list="vendor-options" name="vendor-${expenseFormId}" 
               id="vendor-${expenseFormId}" class="form-control vendor-input" placeholder="Vendor" aria-label="Vendor" 
               required>
      </div>

      <div class="input-group mb-3">
        <input type="text" name="details-${expenseFormId}" id="details-${expenseFormId}" class="form-control" 
               placeholder="Details (optional)" aria-label="Details">
      </div>

      <div class="input-group mb-3">
        <span class="input-group-text">$</span>
        <input type="text" inputmode="decimal" class="form-control" placeholder="Amount" aria-label="Amount" 
               name="amount-${expenseFormId}" id="amount-${expenseFormId}" required >
        <button class="btn btn-primary px-3" type="button" onclick="insertSymbol('amount-${expenseFormId}', '=')">
          =
        </button>
        <button class="btn btn-secondary px-3" type="button" onclick="insertSymbol('amount-${expenseFormId}', '+')">
          +
        </button>
      </div>
      
      ${expenseFormId > 0 ? $DeleteButton() : ""}

    </div>`;

    // Add the new form fields below the existing ones
    const form = document.getElementById("expense-form");
    form.insertAdjacentHTML("beforeend", newExpenseFields);

    // Update the category dropdown options for the new set of fields
    const dropdown = document.getElementById(`category-${expenseFormId}`);
    categories.forEach((category) => {
        dropdown.innerHTML += `<option value="${category}">${category}</option>`;
    });

    expenseFormId++;
    totalExpenseFormCounter++;

    if (totalExpenseFormCounter > 1) {
        const footer = document.getElementById("footer-padding");
        footer.style.height = "300px";
    }
}

/** @param {string} formId */
function deleteExpenseForm(formId) {
    const form = document.getElementById("expense-form");
    const formToDelete = document.getElementById(`expense-form-${formId}`);
    form.removeChild(formToDelete);
    totalExpenseFormCounter--;

    if (totalExpenseFormCounter <= 1) {
        const footer = document.getElementById("footer-padding");
        footer.style.height = "0px";
    }
}

/**
 * @param {string} inputId
 * @param {string} symbol - `+` or `=`
 */
function insertSymbol(inputId, symbol) {
    const amountInput = /** @type {HTMLButtonElement} */(document.getElementById(inputId));
    if (symbol === "=" && !amountInput.value.includes("=")) {
        amountInput.value = `=${amountInput.value}`;
    } else if (symbol === "+") {
        amountInput.value = `${amountInput.value}+`;
    }
}

function submitResults() {
    try {
        const vlookupFormula = "=VLOOKUP(INDIRECT(ADDRESS(ROW(), COLUMN()-1, 4)), categories!$B$2:$C$102, 2, FALSE)";
        let results = "";

        for (let i = 0; i < totalExpenseFormCounter; i++) {
            const date = /** @type {HTMLInputElement} */(document.getElementById(`date-picker-${i}`)).value;
            const category = /** @type {HTMLInputElement} */(document.getElementById(`category-${i}`)).value;
            const vendor = /** @type {HTMLInputElement} */(document.getElementById(`vendor-${i}`)).value;
            const expenseDetails = /** @type {HTMLInputElement} */(document.getElementById(`details-${i}`)).value ?? "";
            const amount = /** @type {HTMLInputElement} */(document.getElementById(`amount-${i}`)).value;

            const line = `${date}=:=${category}=:=${vlookupFormula}=:=${vendor}=:=${expenseDetails}=:=${amount}`;

            if (results !== "") {
                results += "|||"; // add row separator if results already contain data
            }

            results += line;
        }

        tasker.setLocal("results", results);
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
}

try {
    addExpense();
} catch (error) {
    tasker.flashLong(`${error}`);
}
