<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import FileEarkmarkArrowUp from "svelte-bootstrap-icons/lib/FileEarmarkArrowUp/FileEarmarkArrowUp.svelte";

    export let accept: string;

    let inputElem: HTMLInputElement;
    let files: FileList | null;

    let dispatch = createEventDispatcher<{ uploaded: FileList }>();

    function openDialog(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        event.preventDefault();
        inputElem.click();
    }

    function fileSelected(
        event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) {
        event.preventDefault();
        dispatch("uploaded", files);
    }
</script>

<form>
    <input
        type="file"
        hidden
        bind:this={inputElem}
        bind:files
        on:change={fileSelected}
        {accept}
    />
    <button on:click={openDialog} class="btn btn-primary"
        ><FileEarkmarkArrowUp /> Upload file</button
    >
</form>
