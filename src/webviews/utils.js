/** @param {string} str */
function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

/**
 * Checks whether an object, array, or string is null, empty, or whitespace-only. \
 * **NOTE:** does not support evaluating a `Set` or a `Map`.
 * @param {any} item - Item to evaluate.
 * @returns {boolean}
 */
function isNullOrEmpty(item) {
    if (item == null) {
        return true;
    }
    if (typeof item === "string") {
        return item.trim() === "" || item === "undefined"; // readFile returns "undefined" for non-existent files
    }
    if (Array.isArray(item) || typeof item === "object") {
        return !Object.entries(item).length;
    }
    return false;
}

/**
 * @param {string} varName
 * @param {'global' | 'local'} type
 * @returns {string}
 */
function tryGetTaskerVar(varName, type) {
    try {
        const result = type === "global" ? tasker.global(varName) : tasker.local(varName);
        if (isNullOrEmpty(result)) {
            throw new Error(`${capitalize(type)} variable ${varName} is empty`);
        }

        return result;
    } catch (error) {
        tasker.flashLong(`${error}`);
        tasker.destroyScene(document.title);
    }
}

/**
 * Attempts to get value of local Tasker variable `varName`. Stops code execution if variable is null/empty,
 * so use only if null/empty should cause a program failure.
 * @param {string} varName
 * @returns {string}
 */
function tryGetLocal(varName) {
    return tryGetTaskerVar(varName, "local");
}

/**
 * Attempts to get value of global Tasker variable `varName`. Stops code execution if variable is null/empty,
 * so use only if null/empty should cause a program failure.
 * @param {string} varName
 * @returns {string}
 */
function tryGetGlobal(varName) {
    return tryGetTaskerVar(varName, "global");
}

/** @returns {boolean} */
function isEnvTasker() {
    return tasker.global("SDK") !== "";
}

/** @template T */
class JsonData {
    data;

    #path;

    /**
     * @param {T} data - JSON data
     * @param {string} path - Path to JSON file
     */
    constructor(data, path) {
        this.data = data;
        this.#path = path;
    }

    /**
     * Saves JSON data to file
     * @param {Object} [options]
     * @param {boolean} [options.prettyPrint] - Whether to print JSON file with 4-space indenting. Default: `true`
     */
    save({ prettyPrint } = { prettyPrint: true }) {
        if (tasker.global("DRY_RUN") !== "1") {
            tasker.writeFile(this.#path, JSON.stringify(this.data, null, prettyPrint ? 4 : 0), false);
        } else {
            tasker.flash("Dry run -- save skipped");
        }
    }
}

/**
 * Parses JSON data from a local file. Looks for `filename` in `/sdcard/Tasker/json` unless a
 * fully qualified path name is provided
 * @template T
 * @param {Object} options
 * @param {string} options.filename - Name of the JSON file to get. `.json` extension will be applied if not provided.
 * @returns {JsonData<T>} Object containing parsed JSON data and `save()` function to persist updates to JSON data.
 */
function readJsonData({ filename }) {
    try {
        let path = filename.includes("/") ? filename : `${tasker.global("JSON_PATH")}/${filename}`;
        if (!filename.endsWith(".json")) {
            path = `${path}.json`;
        }

        const json = tasker.readFile(path);
        if (isNullOrEmpty(json)) {
            throw new Error(`${path} not found`);
        }
        /** @type {T} */
        const data = JSON.parse(json);

        return new JsonData(data, path);
    } catch (error) {
        tasker.flashLong(`${error}`);
        tasker.destroyScene(document.title);
    }
}

// apply dark theme if %DARK_MODE is set
document.addEventListener("DOMContentLoaded", () => {
    if (tasker.global("DARK_MODE") === "1") {
        const root = document.documentElement;
        root.style.setProperty("--bg", "#161C23");
        root.style.setProperty("--text", "#fff");

        // tailwind
        document.documentElement.classList.add("dark");
    }
});
