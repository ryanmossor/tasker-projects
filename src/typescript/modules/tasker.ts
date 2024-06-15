/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import * as chalk from "chalk";
import { readFileSync } from "fs";
import * as process from "process";
import { mocks } from "./taskerMocks";

const orange = chalk.hex("#FFA500");

export default class Tasker {
    private static log(message: string) {
        if (process.env.NODE_ENV !== "test") {
            console.log(message);
        }
    }

    /** Open the default browser at the specifed URL. */
    static browseURL = (url: string): void => {
        this.log(`Opening ${chalk.greenBright(url)} in default browser...`);
    };

    /** Stop execution of the JavaScript. */
    static exit = (): void => {
        this.log(chalk.redBright("Exiting JavaScript code...\n"));
        if (process.env.NODE_ENV !== "test") {
            process.exit();
        }
    };

    /** Flash a short-duration Android 'Toast' message. */
    static flash = (msg: string): void => {
        this.log(`${chalk.yellow("Toast:")} ${msg}\n`);
    };

    /** Flash a long-duration Android 'Toast' message. */
    static flashLong = (msg: string): void => {
        this.log(`${chalk.yellow("Toast (long):")} ${msg}\n`);
    };

    /** Retrieve the value of a Tasker global variable. Prefixing the name with `%` is optional. */
    static global = (varName: string): string => {
        if (mocks[varName] == null) {
            this.log(`${chalk.bgRed(" 404 ")} ${orange(`%${varName}`)} not found`);
        } else {
            this.log(`${chalk.bgBlue(" GET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(mocks[varName])}`);
        }

        return mocks[varName];
    };

    /** List all files in the specified `dirPath`. */
    static listFiles = (dirPath: string, hiddenToo: boolean): string => {
        this.log(`Getting file list from ${chalk.greenBright(dirPath)}. Retrieve hidden files: ${chalk.redBright(hiddenToo)}`);

        const files: string[] = [];
        for (let i = 1; i <= 10; i++) {
            files.push(`${dirPath}/file${i}`);
        }

        if (hiddenToo) {
            files.push(`${dirPath}/.hiddenFile1`);
        }

        return files.join("\n");
    };

    /** Retrieve the value of a Tasker scene-local variable. The name should **not** be prefixed with %. */
    static local = (varName: string): string => {
        if (mocks[varName] == null) {
            this.log(`${chalk.bgRed(" 404 ")} ${orange(`%${varName}`)} not found`);
        } else {
            this.log(`${chalk.bgBlue(" GET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(mocks[varName])}.`);
        }

        return mocks[varName];
    };

    /** Run the Tasker task `taskName`. **Note:** JavaScript does not wait for the task to complete. */
    static performTask = (
        taskName: string,
        priority: number,
        parameterOne?: string,
        parameterTwo?: string,
        returnVariable?: string,
        stop?: boolean,
        variablePassthrough?: boolean,
        variablePassthroughList?: string,
        resetReturnVariable?: boolean,
    ): boolean => {
        const task = chalk.cyanBright(taskName);
        const pri = chalk.yellow(priority);
        const par1Label = orange("%par1");
        const par1 = chalk.greenBright(parameterOne);
        const par2Label = orange("%par2");
        const par2 = chalk.greenBright(parameterTwo);

        this.log(`Performing task ${task} with priority ${pri}. ${par1Label}: ${par1}, ${par2Label}: ${par2}.`);
        return true;
    };

    /** Read the contents of a text file. */
    static readFile = (path: string): string => {
        this.log(`Reading contents of ${chalk.greenBright(path)}...`);
        try {
            const data = readFileSync(path, "utf8");
            return data;
        } catch (error) {
            this.log(`Error reading file ${path}: ${error.message}`);
            return "";
        }
    };

    /**
     * Set the value of a Tasker global user variable. Prefixing `varName` with `%` is optional.
     * Arrays are **not** supported due to limitations of the Android JS interface.
     */
    static setGlobal = (varName: string, newValue: string | null): void => {
        this.log(`${chalk.bgGreen(" SET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(newValue)}`);
    };

    /** Set the value of a Tasker **scene-local** user variable. Variable names should **not** be prefixed with `%`. */
    static setLocal = (varName: string, newValue: string): void => {
        this.log(`${chalk.bgGreen(" SET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(newValue)}`);
    };

    /**
     * Run a system shell command under Linux.
     * `output` is `undefined` if the shell command failed. It's maximum size is restricted to around 750K.
     */
    static shell = (command: string, asRoot: boolean, timoutSecs: number): void => {
        this.log(`${chalk.greenBright("Executing shell command...")}`);
    };

    /** Expand or contract the system status bar. */
    static statusBar = (expanded: boolean): void => {
        const statusBarAction = expanded
            ? `${chalk.greenBright("Expanding status bar...")}`
            : `${chalk.redBright("Collapsing status bar...")}`;

        this.log(statusBarAction);
    };

    /**
     * Pause the script for the specified time.
     * **Warning:** may cause some preceeding functions not to complete in some situations.
     * If in doubt, use JavaScript `setTimeout()` instead.
     */
    static wait = (durationMilliseconds: number): void => {
        this.log(chalk.magentaBright(`Waiting ${durationMilliseconds} ms...`));
    };

    /** Write `text` to file `path`. */
    static writeFile = (path: string, text: string, append: boolean): void => {
        this.log(`Writing ${chalk.cyanBright(text)} to file ${chalk.greenBright(path)}. Append: ${chalk.cyanBright(append)}\n`);
    };
}
