<script lang="ts">
  import { Strass } from "api/strass";
  import XCircleFill from "svelte-bootstrap-icons/lib/XCircleFill/XCircleFill.svelte";
  import ExclamationTriangleFill from "svelte-bootstrap-icons/lib/ExclamationTriangleFill/ExclamationTriangleFill.svelte";
  
  export let diagnostics: Strass.Diagnostic[];
</script>

<div class="card text-dark bg-light mb-3">
  <div class="card-header"><b>Problems</b> ({diagnostics.length})</div>
  <div class="card-body">
    <ul>
      {#each diagnostics as diagnostic}
      <li>
        {#if diagnostic.severity === Strass.DiagnosticSeverity.Error}
        <span style="color: red"><XCircleFill/> <b>Error: </b></span>
        {:else if diagnostic.severity === Strass.DiagnosticSeverity.Advisory}
        <span style="color: orange"><ExclamationTriangleFill/> <b>Advisory: </b></span>
        {/if}
        {diagnostic.text}
      </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
</style>