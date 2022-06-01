<script lang="ts">
    import type { Benchmark,Case,DecoratedNumber } from "@models/Benchmark";
    import FileEarmarkCheckFill from "svelte-bootstrap-icons/lib/FileEarmarkCheckFill";
    import FileEarmarkCodeFill from "svelte-bootstrap-icons/lib/FileEarmarkCodeFill";
    import FileEarmarkTextFill from "svelte-bootstrap-icons/lib/FileEarmarkTextFill";
    import ShieldFillCheck from "svelte-bootstrap-icons/lib/ShieldFillCheck";

    export let benchmarks: Benchmark[];
    export let rootDataPath: string;

    function toResult(benchmark: Benchmark, run: Case): string {
        return `${rootDataPath}/${benchmark.id}/results/by-depth/${run.depth}.txt`;
    }

    function toString(number: number | DecoratedNumber) {
        if (typeof number === "number") {
            return formatActualNumber(number);
        } else {
            return (
                number.prefix + formatActualNumber(number.value) + number.suffix
            );
        }
    }

    function formatActualNumber(number: number) {
        return number.toLocaleString("en-US", {
            notation: "standard",
            style: "decimal",
            useGrouping: true,
            maximumSignificantDigits: 2,
        });
    }
</script>

<div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
        <col />
        <col />
        <col />
        <col />
        <col />
        <col />
        <col />
        <col />

        <thead class="align-middle">
            <tr>
                <th scope="col">Program</th>
                <th scope="col">Depth</th>
                <th scope="col">
                    <span data-bs-toggle="tooltip" data-bs-placement="top" title="Size of original program">Size<sub>R</sub></span>
                </th>
                <th scope="col">
                    <span data-bs-toggle="tooltip" data-bs-placement="top" title="Size of fixed program">Size<sub>R<sub>S</sub></sub></span>
                </th>
                <th scope="col">
                    <span data-bs-toggle="tooltip" data-bs-placement="top" title="Time of original program">T<sub>R</sub></span>
                </th>
                <th scope="col">
                    <span data-bs-toggle="tooltip" data-bs-placement="top" title="Time of fixed program">T<sub>R<sub>S</sub></sub></span>
                </th>
                <th scope="col">Speedup</th>
            </tr>
        </thead>

        <tbody>
            {#each benchmarks as benchmark}
                {#each benchmark.cases as run, i}
                    <tr class:separated={i == 0}>
                        {#if i == 0}
                            <th rowspan="3" scope="row">
                                {benchmark.name}
                                <a
                                    class="link-icon text-primary"
                                    href={`${rootDataPath}/${benchmark.id}/original.maude`}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Original program"
                                    ><FileEarmarkCodeFill /></a
                                >
                                <a
                                    class="link-icon text-primary"
                                    href={`${rootDataPath}/${benchmark.id}/strass.constraints`}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Assertions"><ShieldFillCheck /></a
                                >
                                <a
                                    class="link-icon text-primary"
                                    href={`${rootDataPath}/${benchmark.id}/strass.maude`}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Fixed program"
                                    ><FileEarmarkCheckFill /></a
                                >
                            </th>
                        {/if}
                        <td
                            ><a href={toResult(benchmark, run)}
                                >{toString(run.depth)}</a
                            ></td
                        >
                        <td
                            ><a href={toResult(benchmark, run)}
                                >{toString(run.originalRunTime)}</a
                            ></td
                        >
                        <td
                            ><a href={toResult(benchmark, run)}
                                >{toString(run.fixedRunTime)}</a
                            ></td
                        >
                        <td
                            ><a href={toResult(benchmark, run)}
                                >{toString(run.originalSearchSize)}</a
                            ></td
                        >
                        <td
                            ><a href={toResult(benchmark, run)}
                                >{toString(run.fixedSearchSize)}</a
                            ></td
                        >
                        <td style="font-weigth: bold;"
                            >{toString(run.speedup)}</td
                        >
                        <td>
                            <a
                                class="link-icon text-primary"
                                href={toResult(benchmark, run)}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Results (raw output with commands)"
                                ><FileEarmarkTextFill /></a
                            >
                        </td>
                    </tr>
                {/each}
            {/each}
        </tbody>
    </table>

    <script>
        var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    </script>
</div>

<style>
    .separated {
        border-top: 2px dotted black;
    }

    :global(.table a) {
        /* Global due to :hover priority */
        display: block;
        text-decoration: none;
        color: inherit;
    }

    .link-icon {
        display: inline !important;
    }

    :global(.link-icon svg) {
        transform: scale(1.3);
    }
</style>
