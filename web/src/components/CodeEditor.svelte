<script lang="ts">
  import type { editor } from "monaco-editor";
  import loader from "@monaco-editor/loader";
  import { grammar as maudeGrammar } from "editor/grammars/maude";
  import { grammar as constraintsGrammar } from "editor/grammars/strass-constraints";
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
      monaco.languages.register({ id: "maude" });
      //@ts-ignore
      monaco.languages.setMonarchTokensProvider("maude", maudeGrammar);

      monaco.languages.register({ id: "strass-constraints" });
      //@ts-ignore
      monaco.languages.setMonarchTokensProvider("strass-constraints", constraintsGrammar);

      editor = monaco.editor.create(elem, {
        value: initialValue,
        language: "maude",
        lineDecorationsWidth: 0,
        minimap: {
          scale: 0.3
        },
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
    border: 2px solid black;
    border-radius: 0.25em;
  }
</style>