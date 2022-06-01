<script lang="ts">
    import Alert from "@components/Alert.svelte";
    import CodeEditor from "@components/CodeEditor.svelte";
    import DiagnosticList from "@components/DiagnosticList.svelte";
    import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
    import { Level } from "@models/AlertLevel";
    import { rootPath } from "@stores/context";
    import {
        addendumModuleName,
        constraints,
        predicatesAddendum,
        program,
        rootModuleName
    } from "@stores/wizardSession";
    import { Strass } from "api/strass";
    import { convertToMonacoMarkerData } from "api/strass/monacoIntegration";
    import { navigate } from "svelte-routing";

    let addendumEditor: CodeEditor;
    let constraintsEditor: CodeEditor;

    const editorOptions = {
        minimap: {
            enabled: false,
        },
    };

    let constraintsDiagnostics: Strass.Diagnostic[];

    let alertGeneric = false;
    let alertAddendumInvalid = false;
    let alertEmptyConstraints = false;

    const wizardStepProps = {
        step: 2,
        header: "Specify assertions for your program",
        onNext: async () => {
            $predicatesAddendum = addendumEditor.getMonacoEditor().getValue();
            $constraints = constraintsEditor.getMonacoEditor().getValue();

            let shouldContinue = true;
            alertGeneric = false;

            if (!$constraints.replace(/\s/g, "").length) {
                alertEmptyConstraints = true;
                return;
            } else {
                alertEmptyConstraints = false;
            }

            try {
                let [addendumResult, constraintsResult] = await Promise.all([
                    Strass.checkProgram(
                        Strass.joinProgramWithAddendum(
                            $program,
                            $predicatesAddendum,
                            $rootModuleName,
                            $addendumModuleName
                        )
                    ),
                    Strass.checkConstraints({
                        programWithAddendum: Strass.joinProgramWithAddendum(
                            $program,
                            $predicatesAddendum,
                            $rootModuleName,
                            $addendumModuleName
                        ),
                        rootModuleName: $rootModuleName,
                        addendumModuleName: $addendumModuleName,
                        constraints: $constraints,
                    }),
                ]);

                if (!addendumResult.success) {
                    shouldContinue = false;
                    alertAddendumInvalid = true;
                } else {
                    alertAddendumInvalid = false;
                }

                if (!constraintsResult.success) {
                    let model = constraintsEditor.getMonacoEditor().getModel();
                    // HACK
                    // @ts-ignore 
                    window.monaco.editor.setModelMarkers(
                        model,
                        "STRASS API Response",
                        constraintsResult.diagnostics
                            .map((diagnostic) =>
                                convertToMonacoMarkerData(diagnostic, model)
                            )
                            .filter((x) => !!x)
                    );

                    shouldContinue = false;
                    constraintsDiagnostics = constraintsResult.diagnostics;
                } else {
                    constraintsDiagnostics = [];
                }
            } catch (e) {
                console.log(e);
                alertGeneric = true;
                shouldContinue = false;
            }

            if (shouldContinue) {
                navigate(`${$rootPath}/result`);
            }
        },
        onBack: () => {
            $predicatesAddendum = addendumEditor.getMonacoEditor().getValue();
            $constraints = constraintsEditor.getMonacoEditor().getValue();
            navigate(`${$rootPath}/program`);
        },
    };
</script>

<WizardStepLayout {...wizardStepProps}>
    <div slot="alerts">
        {#if alertGeneric}
            <Alert title="Something went wrong" level={Level.Error}
                >Your request cannot be fulfilled at this moment. Please try
                again.</Alert
            >
        {/if}
        {#if alertAddendumInvalid}
            <Alert title="Invalid predicates module" level={Level.Error}
                >Please review the introduced predicates and try again.</Alert
            >
        {/if}
        {#if constraintsDiagnostics && constraintsDiagnostics.length > 0}
            <Alert title="Invalid assertions" level={Level.Error}
                >Please review the problems listed below and try again.</Alert
            >
        {/if}
        {#if alertEmptyConstraints}
            <Alert title="No assertions provided" level={Level.Error}
                >You must introduce at least one assertion.</Alert
            >
        {/if}
    </div>

    <ul class="list-group list-group-flush">
        <li class="list-group-item">
            <h5 class="card-title">Predicates</h5>
            Optionally, add the extra predicates used in your assertions:
            <pre class="maude-code"><span class="maude-kw">mod</span
                > {$addendumModuleName} <span class="maude-kw">is</span><br
                />    <span class="maude-kw">protecting</span
                > {$rootModuleName} .<br />    <span class="maude-kw"
                    >protecting</span
                > EXT-BOOL .</pre>
            <CodeEditor
                bind:this={addendumEditor}
                height="200px"
                options={editorOptions}
                initialValue={$predicatesAddendum}
            />
            <pre class="maude-code"><span class="maude-kw">endm</span></pre>
        </li>
        <li class="list-group-item">
            <h5 class="card-title">Assertions</h5>
            Specify one assertion per line. Assertions may be state assertions (<em
                >pattern</em
            > <code>#</code> <em>guard</em>) or path assertions (<code
                >path for</code
            > <em>sort</em><code>:</code> <em>strategy</em>).
            <CodeEditor
                bind:this={constraintsEditor}
                height="200px"
                initialValue={$constraints}
                options={{ language: "strass-constraints", ...editorOptions }}
            />
            {#if constraintsDiagnostics && constraintsDiagnostics.length > 0}
                <br />
                <DiagnosticList diagnostics={constraintsDiagnostics} />
            {/if}
        </li>
    </ul>
</WizardStepLayout>

<style>
    .maude-code {
        font-size: 12px;
        margin-top: 5px;
        margin-left: 2px;
        margin-bottom: 0;
    }

    .maude-kw {
        color: #0000ff;
    }

    em {
        font-style: italic;
        font-weight: bold;
        background-color: #dfdfdf;
        color: #4a4a4a;
        border-radius: 0.25rem;
        font-size: 13px;
        padding: 0.1rem;
    }
</style>
