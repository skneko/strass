<script lang="ts">
    import Alert from "@components/Alert.svelte";
    import CodeEditor from "@components/CodeEditor.svelte";
    import DiagnosticList from "@components/DiagnosticList.svelte";
    import ExampleSelector from "@components/ExampleSelector.svelte";
    import UploadFileButton from "@components/UploadFileButton.svelte";
    import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
    import { Level } from "@models/AlertLevel";
    import { rootPath } from "@stores/context";
    import { examples } from "@stores/data";
    import {
        program,
        rootModuleName,
        selectedExampleId
    } from "@stores/wizardSession";
    import { Strass } from "api/strass";
    import { collectModuleNames } from "api/strass/maude";
    import { convertToMonacoMarkerData } from "api/strass/monacoIntegration";
    import { navigate } from "svelte-routing";

    let editor: CodeEditor;
    let diagnostics: Strass.Diagnostic[] = [];

    let alertGeneric = false;
    let alertEmpty = false;
    let alertNoModules = false;

    const wizardStepProps = {
        step: 1,
        header: "Provide the Maude input program",
        onNext: async () => {
            $program = editor.getMonacoEditor().getValue();

            if ($program.replace(/\s/g, "").length) {
                alertEmpty = false;
            } else {
                alertEmpty = true;
                return;
            }

            let shouldContinue = true;
            alertGeneric = false;

            try {
                let result = await Strass.checkProgram($program);
                if (!result.success) {
                    let model = editor.getMonacoEditor().getModel();
                    // HACK
                    // @ts-ignore
                    window.monaco.editor.setModelMarkers(
                        model,
                        "STRASS API Response",
                        result.diagnostics
                            .map((diagnostic) =>
                                convertToMonacoMarkerData(diagnostic, model)
                            )
                            .filter((x) => !!x)
                    );

                    shouldContinue = false;
                    diagnostics = result.diagnostics;
                } else {
                    diagnostics = [];
                }
            } catch (e) {
                console.log(e);
                alertGeneric = true;
                shouldContinue = false;
            }

            let moduleNames = collectModuleNames($program);
            if (moduleNames.length > 0) {
                $rootModuleName = moduleNames.at(-1);
                alertNoModules = false;
            } else {
                alertNoModules = true;
                shouldContinue = false;
            }

            if (shouldContinue) {
                navigate(`${$rootPath}/constraints`);
            }
        },
        onBack: () => {
            $program = editor.getMonacoEditor().getValue();
            navigate($rootPath);
        },
    };

    function handleExampleChanged() {
        editor.getMonacoEditor().setValue($program);
        alertEmpty = false;
        alertNoModules = false;
        diagnostics = [];
    }

    function handleFileUploaded(event: CustomEvent<FileList>) {
        let file = event.detail[0];

        let reader = new FileReader();
        reader.onload = (e) => {
            let result: string | ArrayBuffer = e.target.result;
            let resultAsString: string;
            if (result instanceof ArrayBuffer) {
                resultAsString = new TextDecoder("utf-8").decode(
                    new Uint8Array(result)
                );
            } else {
                resultAsString = result;
            }

            $program = resultAsString;
            $selectedExampleId = "empty";
            handleExampleChanged();
        };
        reader.readAsText(file);
    }
</script>

<WizardStepLayout {...wizardStepProps}>
    <div slot="alerts">
        {#if alertGeneric}
            <Alert title="Something went wrong" level={Level.Error}
                >Your request cannot be fulfilled at this moment. Please try
                again.</Alert
            >
        {/if}
        {#if diagnostics && diagnostics.length > 0}
            <Alert title="Invalid input program" level={Level.Error}
                >Please review the problems listed below and try again.</Alert
            >
        {/if}
        {#if alertEmpty}
            <Alert title="No program provided" level={Level.Error}
                >You cannot leave the input program area empty.</Alert
            >
        {/if}
        {#if alertNoModules}
            <Alert title="No modules found" level={Level.Error}
                >The input program must contain at least one module.</Alert
            >
        {/if}
    </div>

    <div
        class="quick-intro-area"
        style="display: flex; flex-flow: row nowrap; gap: 5px;"
    >
        <div style="flex-grow: 1;">
            <ExampleSelector
                examples={$examples}
                on:change={handleExampleChanged}
            />
        </div>
        <div style="flex-grow: 0;">
            <UploadFileButton
                on:uploaded={handleFileUploaded}
                accept={".maude"}
            />
        </div>
    </div>
    <CodeEditor bind:this={editor} initialValue={$program} />
    {#if diagnostics && diagnostics.length > 0}
        <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <DiagnosticList bind:diagnostics />
            </li>
        </ul>
    {/if}
</WizardStepLayout>

<style>
    .list-group-item {
        padding-right: 0;
        padding-left: 0;
    }

    .quick-intro-area {
        margin-bottom: 1rem;
    }
</style>
