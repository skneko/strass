<script lang="ts">
    import Alert from "@components/Alert.svelte";
    import BenchmarksTable from "@components/BenchmarksTable.svelte";
    import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
    import { Level } from "@models/AlertLevel";
    import { rootPath } from "@stores/context";
    import { benchmarks } from "@stores/data";
    import { navigate } from "svelte-routing";

    const wizardStepProps = {
        showStep: false,
        header: "Benchmarks",
        onBack: () => navigate(`${$rootPath}`),
    };
</script>

<WizardStepLayout {...wizardStepProps}>
    <p>
        The primary objective of this experimental evaluation aims at comparing
        the performance of the computed safe programs w.r.t. the original unsafe
        counter-parts both in terms of space and time. More precisely, we have
        considered four assertions per benchmark. We have generated three
        computation trees of increasing depths (in the range [5, 50]) for each
        input program and its corresponding strategy driven version computed by
        STRASS. We have then compared the size of the computation trees and the
        time needed to produce them.
    </p>
    <p>
        All of the experiments were conducted on an Intel Xeon Silver 4215R
        3.3GHz CPU with 378GB of RAM. The transformation time is negligible
        (less than 0.1 milliseconds in all cases). Column Depth sets a bound to
        the depth of the computation trees that are generated for the program
        and its fixed counterpart. Execution times are measured in milliseconds.
        We set a timeout of 60 minutes for the generation of the computation
        trees that is only overrun in the case of <em>Maze</em>.
    </p>
    <p>
        We recorded the total speedup <em>time original</em>/<em>time fixed</em>
        in column Speedup.
    </p>
    <br />
    <Alert level={Level.Info}
        >If desired, click on the icons to download the source code and output
        of the corresponding benchmarks.</Alert
    >
    <BenchmarksTable
        benchmarks={$benchmarks}
        rootDataPath={`${$rootPath}/benchmarks`}
    />
</WizardStepLayout>

<style>
    p {
        text-align: justify;
    }
</style>
