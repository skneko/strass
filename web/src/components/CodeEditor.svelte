<script lang="ts">
    import loader from "@monaco-editor/loader";
    import { grammar as maudeGrammar } from "editor/grammars/maude";
    import { grammar as constraintsGrammar } from "editor/grammars/strass-constraints";
    import type { editor as monacoEditor } from "monaco-editor";
    import { onMount } from "svelte";

    let elem: HTMLDivElement;
    let editor: monacoEditor.IStandaloneCodeEditor;

    export let initialValue = "";
    export let width = "100%";
    export let height = "600px";
    export let options: monacoEditor.IStandaloneEditorConstructionOptions = {};

    export function getMonacoEditor(): monacoEditor.IStandaloneCodeEditor {
        return editor;
    }

    onMount(async () => {
        let monaco = await loader.init();

        monaco.languages.register({ id: "maude" });
        //@ts-ignore
        monaco.languages.setMonarchTokensProvider("maude", maudeGrammar);

        monaco.languages.register({ id: "strass-constraints" });
        monaco.languages.setMonarchTokensProvider(
            "strass-constraints",
            //@ts-ignore
            constraintsGrammar 
        );

        monaco.editor.defineTheme("strass-theme", {
            base: "vs",
            inherit: true,
            colors: {
                "editorGutter.background": "#efefef",
            },
            rules: [],
        });

        editor = monaco.editor.create(elem, {
            value: initialValue,
            language: "maude",
            theme: "strass-theme",
            fontSize: 12,
            lineDecorationsWidth: 0,
            glyphMargin: false,
            ...options,
        });

        return () => {
            editor.dispose();
        };
    });
</script>

<div bind:this={elem} class="editor" style="width: {width}; height: {height}" />

<style>
    .editor {
        border: 2px solid black;
        border-radius: 0.25em;
    }
</style>
