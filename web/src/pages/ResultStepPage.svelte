<script lang="ts">
  import { navigate } from "svelte-routing";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import DiagnosticList from "@components/DiagnosticList.svelte";
  import Alert from "@components/Alert.svelte";
  import { program, rootModuleName, predicatesAddendum, addendumModuleName, constraints } from "@stores/wizardSession";
  import { Strass } from "api/strass";
  import { rootPath } from "@stores/context";
  
  const wizardStepProps = {
    step: 3,
    showStep: false,
    header: "Fixed program",
    onBack: () => navigate(`${$rootPath}/constraints`)
  };
  
  let fixRequest = Strass.fixProgram({
    programWithAddendum: Strass.joinProgramWithAddendum(
      $program, $predicatesAddendum, $rootModuleName, $addendumModuleName),
    rootModuleName: $rootModuleName,
    addendumModuleName: $addendumModuleName,
    constraints: $constraints
  });
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
  <Alert title="Something went wrong">Could not fix the program successfully.</Alert>
  {:else}
  <CodeEditor options={{readOnly: true}} 
      initialValue={`${$program}\n\n${fixed.result}`} />
  {/if}
  {#if fixed.diagnostics && fixed.diagnostics.length > 0}
  <DiagnosticList diagnostics={fixed.diagnostics} />
  {/if}

  {:catch e}

  <Alert title="Internal error">Please report this error.</Alert>
  {e}

  {/await}
</WizardStepLayout>
