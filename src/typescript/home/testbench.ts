import * as tasker from "../dev/tasker";
import Logger from "../modules/logger";
import { BenchmarkStats, benchmark } from "../modules/metrics";
import { isEnvTasker, isNullOrEmpty } from "../modules/utils";

async function runBenchmarks() {
    try {
        const count = isNullOrEmpty(tasker.local("count")) ? 100 : Number(tasker.local("count"));
        const results: BenchmarkStats[] = [];
        const args = [];

        results.push(benchmark({
            name: "globalSplit",
            count,
            func: (() => tasker.global("JS_PATH").split(":").find((x) => x.includes("utils"))),
            args,
        }));

        results.push(benchmark({
            name: "objectSearch",
            count,
            func: ((pathMap) => pathMap.JS_PATH.split(":").find((x) => x.includes("utils"))),
            args: [{ "JS_PATH": "node_modules/axios:node_modules/temporal:utils:httpClient:rewardFunctions:require:showPopup:metrics:constants:logger:sendNotification:habitFunctions" }],
        }));

        const filename = `/sdcard/Documents/benchmarks/${results.map((obj) => obj.name).join("_")}.json`;
        tasker.writeFile(filename, JSON.stringify(results, null, 4), false);
        tasker.setLocal("metrics_path", filename);
    } catch (error) {
        Logger.error({ message: error, funcName: runBenchmarks.name });
    } finally {
        tasker.exit();
    }
}

if (isEnvTasker()) {
    runBenchmarks();
}
