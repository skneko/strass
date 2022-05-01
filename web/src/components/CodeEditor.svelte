<script lang="ts">
  import type { editor } from "monaco-editor";
  import loader from "@monaco-editor/loader";
  import { onMount } from "svelte";

  let elem: HTMLDivElement;
  let editor: editor.IStandaloneCodeEditor;

  export let initialValue = "";
  export let width = "100%";
  export let height = "600px";
  export let options: editor.IStandaloneEditorConstructionOptions = {};

  export function getMonacoEditor(): editor.IStandaloneCodeEditor {
    return editor;
  }

  onMount(async () => {
    loader.init().then(monaco => {
      editor = monaco.editor.create(elem, {
        value: initialValue,
        ...options
      })
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div bind:this={elem} class="editor" style="width: {width}; height: {height}"/>

<style>
  .editor {
    border: 2px solid grey;
    border-radius: 0.25em;
  }
</style>