<script lang="ts">
  import type { monaco } from "monaco-editor";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import DiagnosticList from "@components/DiagnosticList.svelte";
  import Alert from "@components/Alert.svelte";
  import { navigate } from "svelte-routing";
  import { program, predicatesAddendum, rootModuleName, addendumModuleName, constraints } from "@stores/wizardSession";
  import { rootPath } from "@stores/context";
  import { Strass } from "api/strass";
  import { convertToMonacoMarkerData } from "api/strass/monacoIntegration";

  let addendumEditor: CodeEditor;
  let constraintsEditor: CodeEditor;

  const editorOptions = {
    minimap: {
      enabled: false
    }
  };

  let constraintsDiagnostics: Strass.Diagnostic[];

  let alertAddendumInvalid = false;
  let alertEmptyConstraints = false;
  
  const wizardStepProps = {
    step: 2,
    header: "Specify assertions for your program",
    onNext: async () => {
      $predicatesAddendum = addendumEditor.getMonacoEditor().getValue();
      $constraints = constraintsEditor.getMonacoEditor().getValue();

      let shouldContinue = true;

      if (!$constraints.replace(/\s/g, "").length) {
        alertEmptyConstraints = true;
        return;
      } else {
        alertEmptyConstraints = false;
      }

      try {
        let [addendumResult, constraintsResult] = await Promise.all([
          Strass.checkProgram(
            Strass.joinProgramWithAddendum($program, $predicatesAddendum, $rootModuleName, $addendumModuleName)),
          Strass.checkConstraints({
            programWithAddendum: Strass.joinProgramWithAddendum(
              $program, $predicatesAddendum, $rootModuleName, $addendumModuleName),
            rootModuleName: $rootModuleName,
            addendumModuleName: $addendumModuleName,
            constraints: $constraints
          })
        ]);

        if (!addendumResult.success) {
          shouldContinue = false;
          alertAddendumInvalid = true;
        } else {
          alertAddendumInvalid = false;
        }

        if (!constraintsResult.success) {
          let model = constraintsEditor.getMonacoEditor().getModel();
          monaco.editor.setModelMarkers(model, "STRASS API Response",
            constraintsResult.diagnostics.map(diagnostic => convertToMonacoMarkerData(diagnostic, model)).filter(x => !!x));
          
          shouldContinue = false;
          constraintsDiagnostics = constraintsResult.diagnostics;
        } else {
          constraintsDiagnostics = [];
        }
      } catch (e) {
        alert("Error: " + e); // TODO
        shouldContinue = false;
      }

      if (shouldContinue) {
        navigate(`${$rootPath}/result`);
      }
    },
    onBack: () =>  { 
      $predicatesAddendum = addendumEditor.getMonacoEditor().getValue();
      $constraints = constraintsEditor.getMonacoEditor().getValue();
      navigate(`${$rootPath}/program`);
    }
  };
</script>

<WizardStepLayout {...wizardStepProps}>
  <div slot="alerts">
    {#if alertAddendumInvalid}
    <Alert title="Invalid predicates module" level="error">Please review the introduced predicates and try again.</Alert>
    {/if}
    {#if constraintsDiagnostics && constraintsDiagnostics.length > 0}
    <Alert title="Invalid assertions" level="error">Please review the problems listed below and try again.</Alert>
    {/if}
    {#if alertEmptyConstraints}
    <Alert title="No assertions provided" level="error">You must introduce at least one assertion.</Alert>
    {/if}
  </div>

  <ul class="list-group list-group-flush">
    <li class="list-group-item">
      <h5 class="card-title">Predicates</h5>
      <pre>mod {$addendumModuleName} is<br>    protecting {$rootModuleName} .<br>    protecting EXT-BOOL .</pre>
      <CodeEditor bind:this={addendumEditor} height="200px" options={editorOptions} initialValue={$predicatesAddendum}/>    
      <pre>endm</pre>
    </li>
    <li class="list-group-item">
      <h5 class="card-title">Assertions</h5>
      <CodeEditor bind:this={constraintsEditor} height="200px" initialValue={$constraints}
          options={{language: "strass-constraints", ...editorOptions}}/>
      {#if constraintsDiagnostics && constraintsDiagnostics.length > 0}
      <br/>
      <DiagnosticList diagnostics={constraintsDiagnostics}/>
      {/if}  
    </li>
  </ul>
</WizardStepLayout>
