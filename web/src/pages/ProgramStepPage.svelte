<script lang="ts">
  import type { monaco } from "monaco-editor";
  import { navigate } from "svelte-routing";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import DiagnosticList from "@components/DiagnosticList.svelte";
  import Alert from "@components/Alert.svelte";
  import ExampleSelector from "@components/ExampleSelector.svelte";
  import UploadFileButton from "@components/UploadFileButton.svelte";
  import { program, rootModuleName, selectedExampleId } from "@stores/wizardSession";
  import { rootPath } from "@stores/context";
  import { Strass } from "api/strass";
  import { convertToMonacoMarkerData } from "api/strass/monacoIntegration";
  import { collectModuleNames } from "api/strass/maude";
  
  let editor: CodeEditor;
  let diagnostics: Strass.Diagnostic[] = [];

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
      
      try {
        let result = await Strass.checkProgram($program);
        if (!result.success) {
          let model = editor.getMonacoEditor().getModel();
          monaco.editor.setModelMarkers(model, "STRASS API Response",
            result.diagnostics.map(diagnostic => convertToMonacoMarkerData(diagnostic, model)).filter(x => !!x));
          
          shouldContinue = false;
          diagnostics = result.diagnostics;
        } else {
          diagnostics = [];
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
    alertNoModules = false;
    diagnostics = [];
  }

  function handleFileUploaded(event) {
    let file = event.detail.files[0];

    let reader = new FileReader();
    reader.onload = (e) => {
      $program = e.target.result;
      $selectedExampleId = "empty";
      handleExampleChanged();
    };
    reader.readAsText(file);
  }
</script>

<WizardStepLayout {...wizardStepProps}>
  <div slot="alerts">
    {#if diagnostics && diagnostics.length > 0}
    <Alert title="Invalid input program" level="error">Please review the problems listed below and try again.</Alert>
    {/if}
    {#if alertEmpty}
    <Alert title="No program provided" level="error">You cannot leave the input program area empty.</Alert>
    {/if}
    {#if alertNoModules}
    <Alert title="No modules found" level="error">The input program must contain at least one module.</Alert>
    {/if}
  </div>

  <div style="display: flex; flex-flow: row nowrap; gap: 5px;">
    <div style="flex-grow: 1;">
      <ExampleSelector on:change={handleExampleChanged}/>
    </div>
    <div style="flex-grow: 0;">
      <UploadFileButton on:uploaded={handleFileUploaded} accept={".maude"}/>
    </div>
  </div>
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
