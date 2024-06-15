import Http from "../modules/httpClient";
import Logger from "../modules/logger";
import * as tasker from "../modules/tasker";
import { readJsonData, tryGetGlobal, tryGetLocal } from "../modules/utils";
import { CheckinJson, CheckinLists } from "../types/types";

const asteriskRegex = /(?<!\*)\*(?!\*)/g;

function filterItems(data: string[], prefix: string): string[] {
    return data
        .filter((item) => item.trim().startsWith(prefix))
        .map((item) => {
            let modifiedItem = item.replace(prefix, "");
            modifiedItem = modifiedItem.replace(asteriskRegex, "");
            return modifiedItem.trim();
        });
}

async function updateChecklists(fullChecklist: string[], trackedActivities: string[]): Promise<void> {
    try {
        await Http.patch<CheckinLists>({
            url: `${tryGetGlobal("CHECKIN_API")}/checkin/lists`,
            body: {
                fullChecklist,
                trackedActivities,
            },
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        Logger.error({ message: error, funcName: updateChecklists.name });
    } finally {
        // have to put this here (not after updateChecklists call) otherwise API throws `BadHttpRequestException:
        // Unexpected end of request content` the first time the check-in lists are loaded by the API
        tasker.exit();
    }
}

const prefixMapping = {
    "Habits": "[H]",
    "Exercise": "[E]",
    "Lifestyle": "[L]",
    "Status": "[ST]",
    "Meds & Supplements": "[MS]",
    "Mental Health": "[M]",
    "Sleep": "[S]",
};

const spreadsheetData: string[] = tryGetLocal("spreadsheet_data").split(",");
const checklists: CheckinJson["lists"] = {
    evening: {
        checkboxItems: {},
        rangeItems: {},
    },
    morning: {
        checkboxItems: {},
        rangeItems: {},
    },
};

for (const [key, value] of Object.entries(prefixMapping)) {
    if (key === "Sleep") {
        const sleepItems = filterItems(spreadsheetData, value);
        checklists.morning.checkboxItems[key] = sleepItems.filter((i) => i !== "Feel Well-Rested");
        checklists.morning.rangeItems[key] = ["Feel Well-Rested"];
    } else if (key === "Mental Health") {
        checklists.evening.rangeItems[key] = filterItems(spreadsheetData, value);
    } else {
        checklists.evening.checkboxItems[key] = filterItems(spreadsheetData, value);
    }
}

const trackedActivities = spreadsheetData
    .filter((item) => item.includes("*") && item.includes(prefixMapping.Exercise))
    .map((item) => {
        let modifiedItem = item.replace(asteriskRegex, "");
        modifiedItem = modifiedItem.replace(prefixMapping.Exercise, "");
        return modifiedItem.trim();
    });

const fullChecklist = spreadsheetData.splice(1)
    .map((item) => {
        let modifiedItem = item.replace(/\[\w*\]/, "");
        modifiedItem = modifiedItem.replace(/\**/g, "");
        return modifiedItem.trim();
    });

const checkinJson = readJsonData<CheckinJson>({ filename: "checkin.json" });
checkinJson.data.lists = checklists;
checkinJson.save();

updateChecklists(fullChecklist, trackedActivities);
