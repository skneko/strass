import type { Benchmark } from "@models/Benchmark";
import type { Example } from "@models/Example";
import { Readable, readable } from "svelte/store";

export const examples: Readable<Example[]> = readable([
    {
        id: "dam-controller",
        name: "Dam Controller",
        constraints: "state"
    },
    {
        id: "dam-controller-naive",
        name: "Dam Controller (without explicit mutual exclusion)",
        constraints: "abridged",
    },
    {
        id: "blocks-world",
        name: "Blocks World",
        constraints: "state"
    },
    {
        id: "containers",
        name: "Containers",
        constraints: "state"
    },
    {
        id: "philo",
        name: "Dining Philosophers Problem",
        constraints: "state"
    },
    {
        id: "maze",
        name: "Maze",
        constraints: "state"
    },
    {
        id: "space-invaders",
        name: "Space Invaders",
        constraints: "state"
    }
]);

export const benchmarks: Readable<Benchmark[]> = readable([
    {
        id: "blocks-world",
        name: "Blocks World",
        cases: [
            {
                depth: 30,
                originalSearchSize: 551_921,
                fixedSearchSize: 1_205,
                originalRunTime: 9_668,
                fixedRunTime: 40,
                speedup: 241.70
            },
            {
                depth: 40,
                originalSearchSize: 2_004_332,
                fixedSearchSize: 2_568,
                originalRunTime: 41_384,
                fixedRunTime: 87,
                speedup: 475.68
            },
            {
                depth: 50,
                originalSearchSize: 5_841_540,
                fixedSearchSize: 4_689,
                originalRunTime: 139_198,
                fixedRunTime: 171,
                speedup: 814.02
            }
        ]
    },
    {
        id: "containers",
        name: "Containers",
        cases: [
            {
                depth: 15,
                originalSearchSize: 350_391,
                fixedSearchSize: 53_624,
                originalRunTime: 40_967,
                fixedRunTime: 7_635,
                speedup: 5.37
            },
            {
                depth: 20,
                originalSearchSize: 1_465_829,
                fixedSearchSize: 88_097,
                originalRunTime: 166_614,
                fixedRunTime: 13_289,
                speedup: 12.54
            },
            {
                depth: 25,
                originalSearchSize: 4_172_116,
                fixedSearchSize: 122_538,
                originalRunTime: 549_430,
                fixedRunTime: 19_518,
                speedup: 28.15
            }
        ]
    },
    {
        id: "dam-controller",
        name: "Dam Controller",
        cases: [
            {
                depth: 15,
                originalSearchSize: 139_948,
                fixedSearchSize: 220,
                originalRunTime: 4_198,
                fixedRunTime: 14,
                speedup: 299.86
            },
            {
                depth: 30,
                originalSearchSize: 2_271_930,
                fixedSearchSize: 505,
                originalRunTime: 82_845,
                fixedRunTime: 30,
                speedup: 2_761.50
            },
            {
                depth: 45,
                originalSearchSize: 9_581_406,
                fixedSearchSize: 790,
                originalRunTime: 392_157,
                fixedRunTime: 48,
                speedup: 8_169.94
            }
        ]
    },
    {
        id: "maze",
        name: "Maze",
        cases: [
            {
                depth: 4,
                originalSearchSize: 196,
                fixedSearchSize: 23,
                originalRunTime: 8,
                fixedRunTime: 2,
                speedup: 4
            },
            {
                depth: 6,
                originalSearchSize: 133_225,
                fixedSearchSize: 78,
                originalRunTime: 59_553,
                fixedRunTime: 9,
                speedup: 6_617
            },
            {
                depth: 8,
                originalSearchSize: { prefix: ">", value: 3_154_238, suffix: "" },
                fixedSearchSize: 303,
                originalRunTime: { prefix: ">", value: 1_236_722, suffix: "" },
                fixedRunTime: 53,
                speedup: { prefix: ">", value: 23_334.38, suffix: "" }
            },
        ]
    },
    {
        id: "space-invaders",
        name: "Space Invaders",
        cases: [
            {
                depth: 15,
                originalSearchSize: 518_379,
                fixedSearchSize: 88_680,
                originalRunTime: 21_679,
                fixedRunTime: 4_985,
                speedup: 4.35
            },
            {
                depth: 20,
                originalSearchSize: 1_797_799,
                fixedSearchSize: 268_115,
                originalRunTime: 120_930,
                fixedRunTime: 19_609,
                speedup: 6.17
            },
            {
                depth: 25,
                originalSearchSize: 5_024_516,
                fixedSearchSize: 720_649,
                originalRunTime: 515_246,
                fixedRunTime: 65_345,
                speedup: 7.8
            },
        ]
    }
]);