<script lang="ts">
  import type { monaco } from "monaco-editor";
  import { navigate } from "svelte-routing";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import DiagnosticList from "@components/DiagnosticList.svelte";
  import Alert from "@components/Alert.svelte";
  import ExampleSelector from "@components/ExampleSelector.svelte";
  import { program, rootModuleName } from "@stores/wizardSession";
  import { Strass } from "api/strass";
  import { convertToMonacoMarkerData } from "api/strass/monacoIntegration";
  import { collectModuleNames } from "api/strass/maude";
  import { rootPath } from "@stores/context";
  
  let editor: CodeEditor;
  let diagnostics: Strass.Diagnostic[] = [];

  let alertEmpty = false;
  let alertProgramInvalid = false;
  let alertNoModules = false;
  
  const wizardStepProps = {
    step: 1,
    header: "Provide your Maude program",
    onNext: async () => {
      $program = editor.getMonacoEditor().getValue();

      if ($program.replace(/\s/g, "").length) {
        alertEmpty = false;
      } else {
        alertEmpty = true;
        return;
      }
      
      let shouldContinue = true;
      
      try {
        let result = await Strass.checkProgram($program);
        if (!result.success) {
          let model = editor.getMonacoEditor().getModel();
          monaco.editor.setModelMarkers(model, "STRASS API Response",
          result.diagnostics.map(diagnostic => convertToMonacoMarkerData(diagnostic, model)).filter(x => !!x));
          
          alertProgramInvalid = true;
          shouldContinue = false;
          diagnostics = result.diagnostics;
        }
      } catch (e) {
        alert("Error: " + e); // TODO
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
    onBack: () =>  { 
      $program = editor.getMonacoEditor().getValue();
      navigate($rootPath);
    }
  };

  function handleExampleChanged() {
    editor.getMonacoEditor().setValue($program);
    alertEmpty = false;
    alertProgramInvalid = false;
    alertNoModules = false;
    diagnostics = [];
  }
</script>

<WizardStepLayout {...wizardStepProps}>
  <div slot="alerts">
    {#if alertProgramInvalid}
    <Alert title="Invalid input program" level="error">Please review the problems listed below and try again.</Alert>
    {/if}
    {#if alertEmpty}
    <Alert title="No program provided" level="error">You cannot leave the input program area empty.</Alert>
    {/if}
    {#if alertNoModules}
    <Alert title="No modules found" level="error">The input program must contain at least one module.</Alert>
    {/if}
  </div>

  <ExampleSelector on:change={handleExampleChanged}/>
  <br/>
  <CodeEditor bind:this={editor} initialValue={$program}/>
  {#if diagnostics && diagnostics.length > 0}
  <ul class="list-group list-group-flush">
    <li class="list-group-item">
      <DiagnosticList diagnostics={diagnostics}/>
    </li>
  </ul>
  {/if}
</WizardStepLayout>

<style>
  .list-group-item {
    padding-right: 0;
    padding-left: 0;
  }
</style>
