/* eslint-disable no-console */
class tasker {
    /** @param {string} url */
    static browseURL(url) {
        console.log(`Opening ${url} in default browser...`);
    }

    /** @param {string} sceneName */
    static destroyScene(sceneName) {
        console.log(`Destroying ${sceneName}...`);
    }

    static exit() {
        console.log("Exiting JavaScript code...\n");
    }

    /** @param {string} msg */
    static flash(msg) {
        console.log(`Toast: ${msg}\n`);
    }

    /** @param {string} msg */
    static flashLong(msg) {
        console.log(`Toast (long): ${msg}\n`);
    }

    /**
     * @param {string} varName
     * @returns {string}
     */
    static global(varName) {
        if (mocks[varName] == null) {
            console.log(`[404] %${varName} not found`);
        } else {
            console.log(`[GET] %${varName}: ${mocks[varName]}`);
        }

        return mocks[varName];
    }

    /**
     * @param {string} dirPath
     * @param {boolean} hiddenToo
     * @returns {string}
     */
    static listFiles(dirPath, hiddenToo) {
        console.log(`Getting file list from ${dirPath}. Retrieve hidden files: ${hiddenToo}`);

        const files = [];
        for (let i = 1; i <= 10; i++) {
            files.push(`${dirPath}/file${i}`);
        }

        if (hiddenToo) {
            files.push(`${dirPath}/.hiddenFile1`);
        }

        return files.join("\n");
    }

    /**
     * @param {string} varName
     * @returns {string}
     */
    static local(varName) {
        if (mocks[varName] == null) {
            console.log(`[404] %${varName} not found`);
        } else {
            console.log(`[GET] %${varName}: ${mocks[varName]}.`);
        }

        return mocks[varName];
    }

    /**
     * @param {string} taskName
     * @param {number} priority
     * @param {string} parameterOne
     * @param {string} parameterTwo
     * @param {string} returnVariable
     * @param {boolean} stop
     * @param {boolean} variablePassthrough
     * @param {string} variablePassthroughList
     * @param {boolean} resetReturnVariable
     */
    static performTask(
        taskName,
        priority,
        parameterOne,
        parameterTwo,
        returnVariable,
        stop,
        variablePassthrough,
        variablePassthroughList,
        resetReturnVariable,
    ) {
        console.log(`Performing task ${taskName} with priority ${priority}. %par1: ${parameterOne}, %par2: ${parameterTwo}.`);
    }

    /**
     * @param {string} path
     * @returns {string}
     */
    static readFile(path) {
        console.log(`Reading contents of ${path}...`);
        return mockFiles[path];
    }

    /**
     * @param {string} varName
     * @param {string} newValue
     */
    static setGlobal(varName, newValue) {
        console.log(`[SET] %${varName}: ${newValue}`);
    }

    /**
     * @param {string} varName
     * @param {string} newValue
     */
    static setLocal(varName, newValue) {
        console.log(`[SET] %${varName}: ${newValue}`);
    }

    /**
     * @param {string} command
     * @param {boolean} asRoot
     * @param {number} timeoutSecs
     */
    static shell(command, asRoot, timeoutSecs) {
        console.log(`${"Executing shell command..."}`);
    }

    /** @param {boolean} expanded */
    static statusBar(expanded) {
        console.log(expanded ? "Expanding status bar..." : "Collapsing status bar...");
    }

    /** @param {number} durationMilliseconds */
    static wait(durationMilliseconds) {
        console.log(`Waiting ${durationMilliseconds} ms...`);
    }

    /**
     * @param {string} path
     * @param {string} text
     * @param {boolean} append
     */
    static writeFile(path, text, append) {
        console.log(`Writing ${text} to file ${path}. Append: ${append}\n`);
    }
}
