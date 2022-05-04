<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let inputElem: HTMLInputElement;
  let files: FileList | null;
  let accept: string;

  let dispatch = createEventDispatcher();

  function openDialog(event) {
    event.preventDefault();
    inputElem.click();
  }

  function fileSelected(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    event.preventDefault();
    dispatch("uploaded", { files });
  }
</script>

<form>
  <input type="file" hidden bind:this={inputElem} bind:files={files} on:change={fileSelected} accept={accept} />
  <button on:click={openDialog} class="btn btn-primary">Upload file</button>
</form>