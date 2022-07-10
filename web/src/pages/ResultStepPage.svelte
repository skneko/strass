<script lang="ts">
    import Alert from "@components/Alert.svelte";
    import CodeEditor from "@components/CodeEditor.svelte";
    import DiagnosticList from "@components/DiagnosticList.svelte";
    import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
    import { rootPath } from "@stores/context";
    import {
    addendumModuleName,
    constraints,
    predicatesAddendum,
    program,
    rootModuleName
    } from "@stores/wizardSession";
    import { Strass } from "api/strass";
    import FileEarkmarkArrowDown from "svelte-bootstrap-icons/lib/FileEarmarkArrowDown/FileEarmarkArrowDown.svelte";
    import { navigate } from "svelte-routing";

    const wizardStepProps = {
        step: 3,
        showStep: false,
        header: "Fixed program",
        onBack: () => navigate(`${$rootPath}/constraints`),
    };

    let fixRequest = Strass.fixProgram({
        programWithAddendum: Strass.joinProgramWithAddendum(
            $program,
            $predicatesAddendum,
            $rootModuleName,
            $addendumModuleName
        ),
        rootModuleName: $rootModuleName,
        addendumModuleName: $addendumModuleName,
        constraints: $constraints,
    });

    function download(filename: string, text: string) {
        var link = document.createElement("a");
        link.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        link.setAttribute("download", filename);
        link.click();
    }
</script>

<WizardStepLayout {...wizardStepProps}>
    {#await fixRequest}
        <div class="position-relative start-50">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    {:then fixed}
        {#if !fixed.success}
            <Alert title="Something went wrong"
                >Could not fix the program successfully.</Alert
            >
        {:else}
            <CodeEditor
                options={{ readOnly: true }}
                initialValue={`${$program}\n\n${fixed.result}`}
            />
        {/if}
        {#if fixed.diagnostics && fixed.diagnostics.length > 0}
            <DiagnosticList diagnostics={fixed.diagnostics} />
        {/if}
    {:catch e}
        <Alert title="Internal error">Please report this error.</Alert>
        {e}
    {/await}

    <div slot="bottom-stripe-right">
        {#await fixRequest then fixed}
            {#if fixed.success}
                <button
                    type="button"
                    class="btn btn-primary"
                    on:click={() =>
                        download(
                            `${$rootModuleName.toLowerCase()}_fixed.maude`,
                            `${$program}\n\n${fixed.result}`
                        )}
                >
                    <FileEarkmarkArrowDown /> Download fixed program
                </button>
            {/if}
        {/await}
    </div>
</WizardStepLayout>
