<script lang="ts">
  import type { Strass } from "api/strass";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import DiagnosticList from "@components/DiagnosticList.svelte";
  import Alert from "@components/Alert.svelte";
  import { navigate } from "svelte-routing";
  import { predicatesAddendum, rootModuleName, addendumModuleName, constraints } from "@stores/wizardSession";
  import { rootPath } from "@stores/context";

  let addendumEditor: CodeEditor;
  let constraintsEditor: CodeEditor;

  const editorOptions = {
    minimap: {
      enabled: false
    }
  };

  let predicateDiagnostics: Strass.Diagnostic[];

  let alertProgramInvalid = false;
  let alertEmptyConstraints = false;
  
  const wizardStepProps = {
    step: 2,
    header: "Specify assertions for your program",
    onNext: () => {
      $predicatesAddendum = addendumEditor.getMonacoEditor().getValue();
      $constraints = constraintsEditor.getMonacoEditor().getValue();

      let shouldContinue = true;

      if (!$constraints.replace(/\s/g, "").length) {
        alertEmptyConstraints = true;
        return;
      } else {
        alertEmptyConstraints = false;
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
    {#if alertProgramInvalid}
    <Alert title="Invalid predicate module" level="error">Please review the problems listed below and try again.</Alert>
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
      {#if predicateDiagnostics}
      <br/>
      <DiagnosticList diagnostics={predicateDiagnostics}/>
      {/if}
    </li>
    <li class="list-group-item">
      <h5 class="card-title">Assertions</h5>
      <CodeEditor bind:this={constraintsEditor} height="200px" initialValue={$constraints}
          options={{language: "strass-constraints", ...editorOptions}}/>    
    </li>
  </ul>
</WizardStepLayout>
