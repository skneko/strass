<script lang="ts">
    import { Level } from "@models/AlertLevel";
    import CheckCircleFill from "svelte-bootstrap-icons/lib/CheckCircleFill/CheckCircleFill.svelte";
    import ExclamationTriangleFill from "svelte-bootstrap-icons/lib/ExclamationTriangleFill/ExclamationTriangleFill.svelte";
    import InfoCircleFill from "svelte-bootstrap-icons/lib/InfoCircleFill/InfoCircleFill.svelte";
    import XCircleFill from "svelte-bootstrap-icons/lib/XCircleFill/XCircleFill.svelte";

    export let title: string | null = null;
    export let level: Level = Level.Error;
    export let dismissible = true;
</script>

<div
    class="alert fade show"
    class:alert-primary={level == Level.Info}
    class:alert-success={level == Level.Success}
    class:alert-warning={level == Level.Warning}
    class:alert-danger={level == Level.Error}
    class:alert-dismissible={dismissible}
    role="alert"
>
    {#if level == Level.Info}
        <InfoCircleFill />
    {:else if level == Level.Success}
        <CheckCircleFill />
    {:else if level == Level.Warning}
        <ExclamationTriangleFill />
    {:else if level == Level.Error}
        <XCircleFill />
    {/if}

    <span>
        {#if title}
            <strong style="padding-right: 1.1em;">{title}</strong>
        {/if}
        <slot />
    </span>
    <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
    />
</div>

<style>
    .alert {
        border-width: 2px;
    }
</style>
