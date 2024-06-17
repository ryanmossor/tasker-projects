import * as tasker from "../dev/tasker";
import { ExpensesJson } from "../dev/types";
import { isEnvTasker, readJsonData, tryGetLocal, uniq } from "../modules/utils";

export function updateCategoriesVendors(expenseCategories: string[], existingVendors: string[], newVendors: string[]) {
    const expensesJson: ExpensesJson = {
        categories: expenseCategories.sort(),
        vendors: uniq([...existingVendors, ...newVendors]).sort(),
    };

    return expensesJson;
}

if (isEnvTasker()) {
    const expenseCategories = tryGetLocal("expense_categories").split(",");
    const expenseVendors = tryGetLocal("expense_vendors").split(",");

    const expensesJson = readJsonData<ExpensesJson>({ filename: "expenses.json" });
    expensesJson.data = updateCategoriesVendors(expenseCategories, expensesJson.data.vendors, expenseVendors);
    expensesJson.save({ prettyPrint: false });

    tasker.exit();
}
