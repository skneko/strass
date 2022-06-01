export interface Benchmark {
    id: string;
    name: string;
    cases: Case[];
}

export interface Case {
    depth: number;
    originalRunTime: number | DecoratedNumber;
    fixedRunTime: number | DecoratedNumber;
    originalSearchSize: number | DecoratedNumber;
    fixedSearchSize: number | DecoratedNumber;
    speedup: number | DecoratedNumber;
}

export interface DecoratedNumber {
    value: number;
    prefix: string;
    suffix: string;
}