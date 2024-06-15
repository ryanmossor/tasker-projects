/** @type {number} */
const timePrecision = tasker.local("time_precision").trim() === "" ? 2 : Number(tasker.local("time_precision"));

/**
 * Table header cell component containing the name of the function under test
 * @param {string} name - Name of function under test
 * @returns {string} Table header cell component
 */
function $HeaderCell(name) {
    return `
    <th class="bg-neutral-300 border-2 border-black dark:bg-zinc-800 dark:border-zinc-500">
        <code>${name}</code>
    </th>`;
}

/**
 * Table header row component containing names of functions under test. Top-left cell is intentionally left blank.
 * @param {BenchmarkStats[]} results - Benchmark results
 * @returns {string} Table header row component
 */
function $HeaderRow(results) {
    return `
    <tr>
        <th class="bg-neutral-300 border-2 border-black dark:bg-zinc-800 dark:border-zinc-500"></th>
        ${results.reduce((acc, result) => acc + $HeaderCell(result.name), "")}
    </tr>`;
}

/**
 * Table cell component containing reported time for stat in milliseconds
 * @param {number} timeInMs
 * @returns {string} Table cell component
 */
function $TableCell(timeInMs) {
    return `
    <td class="text-center border-2 border-black dark:border-zinc-500" >
        <code>${timeInMs.toFixed(timePrecision)} ms</code>
    </td> `;
}

/**
 * Table row component containing times for given `rowName`
 * @param {string} rowName - Row name (avg, med, p95, etc.)
 * @param {BenchmarkStats[]} results - Benchmark results object
 * @returns {string} Table row component
 */
function $TableRow(rowName, results) {
    return `
    <tr>
        <td class="bg-neutral-300 text-center p-1.5 border-2 border-black dark:bg-zinc-800 dark:border-zinc-500">
            <code>${rowName}</code>
        </td>
        ${results.reduce((acc, result) => acc + $TableCell(result.stats[rowName]), "")}
    </tr>`;
}

/**
 * Component displaying total benchmark runs
 * @param {number} total - Total benchmark runs
 * @returns {string} Total runs component
 */
function $TotalRuns(total) {
    return `
    <p class= "text-right text-lg pr-6 mt-2">
        <strong>Total runs: </strong> ${total}
    </p>`;
}

try {
    /** @type {BenchmarkStats[]} */
    const results = JSON.parse(tasker.readFile(tryGetLocal("metrics_path")));

    const table = /** @type {HTMLTableElement} */(document.getElementById("table"));
    table.innerHTML += $HeaderRow(results);

    for (const key of Object.keys(results[0].stats)) {
        table.innerHTML += $TableRow(key, results);
    }

    table.insertAdjacentHTML("afterend", $TotalRuns(results[0].count));
} catch (error) {
    tasker.flashLong(`${error}`);
    tasker.destroyScene(document.title);
}
