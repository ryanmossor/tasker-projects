import Logger from "./logger";

type BenchmarkParams = {
    name: string,
    count: number,
    func: (...args: any[]) => any,
    args?: any[],
};

export type BenchmarkStats = {
    name: string;
    count: number;
    stats: {
        min: number;
        first: number,
        avg: number;
        med: number;
        p95: number;
        max: number;
        total: number;
    }
};

function sum(arr: number[]) {
    let total = 0;
    for (const num of arr) {
        total += num;
    }
    return total;
}

function avg(arr: number[]): number {
    return (sum(arr) / arr.length);
}

function percentile(arr: number[], p: number): number {
    const N = arr.length;
    if (p === 0 || N === 1) {
        return arr[0];
    }

    const n = (N - 1) * (p / 100);
    const base = Math.floor(n);
    const diff = n - base;
    if (arr[base + 1] !== undefined) {
        return (arr[base] + diff * (arr[base + 1] - arr[base]));
    }

    return arr[base];
}

function calculateStats(name: string, arr: number[], totalTime: number): BenchmarkStats {
    const first = arr[0];
    arr.sort((a, b) => a - b);

    return {
        name,
        count: arr.length,
        stats: {
            min: arr[0],
            first,
            avg: avg(arr),
            med: percentile(arr, 50),
            p95: percentile(arr, 95),
            max: arr[arr.length - 1],
            total: totalTime,
        },
    };
}

export function benchmark({ name, count, func, args }: BenchmarkParams): BenchmarkStats {
    const times: number[] = [];
    const totalStart = performance.now();

    try {
        for (let i = 0; i < count; i++) {
            const start = performance.now();
            func(...args);
            times.push(performance.now() - start);
        }
    } catch (error) {
        Logger.error({ message: error, funcName: benchmark.name });
    }

    const totalTime = performance.now() - totalStart;
    return calculateStats(name, times, totalTime);
}

export async function benchmarkAsync({ name, count, func, args }: BenchmarkParams): Promise<BenchmarkStats> {
    const times: number[] = [];
    const totalStart = performance.now();

    try {
        for (let i = 0; i < count; i++) {
            const start = performance.now();
            // eslint-disable-next-line no-await-in-loop
            await func(...args);
            times.push(performance.now() - start);
        }
    } catch (error) {
        Logger.error({ message: error, funcName: benchmarkAsync.name });
    }

    const totalTime = performance.now() - totalStart;
    return calculateStats(name, times, totalTime);
}
