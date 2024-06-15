/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import * as chalk from "chalk";
import { readFileSync } from "fs";
import * as process from "process";
import { mocks } from "./taskerMocks";

const orange = chalk.hex("#FFA500");

function log(message: string) {
    if (process.env.NODE_ENV !== "test") {
        console.log(message);
    }
}

/** Open the default browser at the specifed URL. */
export function browseURL(url: string): void {
    log(`Opening ${chalk.greenBright(url)} in default browser...`);
}

/** Stop execution of the JavaScript. */
export function exit(): void {
    log(chalk.redBright("Exiting JavaScript code...\n"));
    if (process.env.NODE_ENV !== "test") {
        process.exit();
    }
}

/** Flash a short-duration Android 'Toast' message. */
export function flash(msg: string): void {
    log(`${chalk.yellow("Toast:")} ${msg}\n`);
}

/** Flash a long-duration Android 'Toast' message. */
export function flashLong(msg: string): void {
    log(`${chalk.yellow("Toast (long):")} ${msg}\n`);
}

/** Retrieve the value of a Tasker global variable. Prefixing the name with `%` is optional. */
export function global(varName: string): string {
    if (mocks[varName] == null) {
        log(`${chalk.bgRed(" 404 ")} ${orange(`%${varName}`)} not found`);
    } else {
        log(`${chalk.bgBlue(" GET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(mocks[varName])}`);
    }

    return mocks[varName];
}

/** List all files in the specified `dirPath`. */
export function listFiles(dirPath: string, hiddenToo: boolean): string {
    log(`Getting file list from ${chalk.greenBright(dirPath)}. Retrieve hidden files: ${chalk.redBright(hiddenToo)}`);

    const files: string[] = [];
    for (let i = 1; i <= 10; i++) {
        files.push(`${dirPath}/file${i}`);
    }

    if (hiddenToo) {
        files.push(`${dirPath}/.hiddenFile1`);
    }

    return files.join("\n");
}

/** Retrieve the value of a Tasker scene-local variable. The name should **not** be prefixed with %. */
export function local(varName: string): string {
    if (mocks[varName] == null) {
        log(`${chalk.bgRed(" 404 ")} ${orange(`%${varName}`)} not found`);
    } else {
        log(`${chalk.bgBlue(" GET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(mocks[varName])}.`);
    }

    return mocks[varName];
}

/** Run the Tasker task `taskName`. **Note:** JavaScript does not wait for the task to complete. */
export function performTask(
    taskName: string,
    priority: number,
    parameterOne?: string,
    parameterTwo?: string,
    returnVariable?: string,
    stop?: boolean,
    variablePassthrough?: boolean,
    variablePassthroughList?: string,
    resetReturnVariable?: boolean,
): boolean {
    const task = chalk.cyanBright(taskName);
    const pri = chalk.yellow(priority);
    const par1Label = orange("%par1");
    const par1 = chalk.greenBright(parameterOne);
    const par2Label = orange("%par2");
    const par2 = chalk.greenBright(parameterTwo);

    log(`Performing task ${task} with priority ${pri}. ${par1Label}: ${par1}, ${par2Label}: ${par2}.`);
    return true;
}

/** Read the contents of a text file. */
export function readFile(path: string): string {
    log(`Reading contents of ${chalk.greenBright(path)}...`);
    try {
        const data = readFileSync(path, "utf8");
        return data;
    } catch (error) {
        log(`Error reading file ${path}: ${error.message}`);
        return "";
    }
}

/**
     * Set the value of a Tasker global user variable. Prefixing `varName` with `%` is optional.
     * Arrays are **not** supported due to limitations of the Android JS interface.
     */
export function setGlobal(varName: string, newValue: string | null): void {
    log(`${chalk.bgGreen(" SET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(newValue)}`);
}

/** Set the value of a Tasker **scene-local** user variable. Variable names should **not** be prefixed with `%`. */
export function setLocal(varName: string, newValue: string): void {
    log(`${chalk.bgGreen(" SET ")} ${orange(`%${varName}`)}: ${chalk.cyanBright(newValue)}`);
}

/**
     * Run a system shell command under Linux.
     * `output` is `undefined` if the shell command failed. It's maximum size is restricted to around 750K.
     */
export function shell(command: string, asRoot: boolean, timoutSecs: number): void {
    log(`${chalk.greenBright("Executing shell command...")}`);
}

/** Expand or contract the system status bar. */
export function statusBar(expanded: boolean): void {
    const statusBarAction = expanded
        ? `${chalk.greenBright("Expanding status bar...")}`
        : `${chalk.redBright("Collapsing status bar...")}`;

    log(statusBarAction);
}

/**
     * Pause the script for the specified time.
     * **Warning:** may cause some preceeding functions not to complete in some situations.
     * If in doubt, use JavaScript `setTimeout()` instead.
     */
export function wait(durationMilliseconds: number): void {
    log(chalk.magentaBright(`Waiting ${durationMilliseconds} ms...`));
}

/** Write `text` to file `path`. */
export function writeFile(path: string, text: string, append: boolean): void {
    log(`Writing ${chalk.cyanBright(text)} to file ${chalk.greenBright(path)}. Append: ${chalk.cyanBright(append)}\n`);
}
