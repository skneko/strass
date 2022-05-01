<script lang="ts">
  import { navigate } from "svelte-routing";
  import WizardStepLayout from "@layouts/WizardStepLayout.svelte";
  import CodeEditor from "@components/CodeEditor.svelte";
  import { program, rootModuleName, predicatesAddendum, addendumModuleName, constraints } from "@stores/wizardSession";
  import { Strass } from "api/strass";
  import { rootPath } from "@stores/context";
  
  let editor: CodeEditor;
  
  const wizardStepProps = {
    step: null,
    header: "Fixed program result",
    onBack: () => navigate(`${$rootPath}/constraints`)
  };
  
  let fixRequest = Strass.fixProgram({
    programWithAddendum: $program 
      + `\nmod ${$addendumModuleName} is pr ${$rootModuleName} .\n`
      + $predicatesAddendum
      + "\nendm",
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
  <CodeEditor bind:this={editor} options={{readOnly: true}} 
      initialValue={`${$program}\n\n${fixed.result}`}/>
  {:catch e}
  {e}
  {/await}
</WizardStepLayout>
