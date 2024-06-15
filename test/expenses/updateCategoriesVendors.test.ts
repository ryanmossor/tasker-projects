import { updateCategoriesVendors } from "../../src/typescript/expenses/updateCategoriesVendors";

describe("updateCategoriesVendors", () => {
    it("should return an object with categories and vendors with duplicate vendors removed", () => {
    // arrange
        const expenseCategories = "category1,category2,category3";
        const expenseVendors = "vendor1,vendor1,vendor2,vendor2,vendor3";
        const oldVendors = "existing1,existing2,existing3";

        // act
        const result = updateCategoriesVendors(
            expenseCategories.split(","),
            oldVendors.split(","),
            expenseVendors.split(","),
        );

        // assert
        expect(result).toEqual({
            categories: ["category1", "category2", "category3"],
            vendors: ["existing1", "existing2", "existing3", "vendor1", "vendor2", "vendor3"],
        });
    });
});
