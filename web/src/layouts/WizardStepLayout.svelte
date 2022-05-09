<script lang="ts">
  import MainCardLayout from "@layouts/MainCardLayout.svelte";
  import { maxStepAllowed } from "@stores/wizardSession";
  import CaretLeftFill from "svelte-bootstrap-icons/lib/CaretLeftFill/CaretLeftFill.svelte";
  import CaretRightFill from "svelte-bootstrap-icons/lib/CaretRightFill/CaretRightFill.svelte";
  import { rootPath } from "stores/context";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let step: Number | null = null;
  export let showStep = true;
  export let header = "";
  export let onBack: () => void | null = null;
  export let onNext: () => void | null = null;
  export let escapeRoute = "";

  function onBackWrapper() {
    if (step != null) {
      $maxStepAllowed = Math.max($maxStepAllowed - 1, 1);;
    }
    onBack();
  }

  function onNextWrapper() {
    if (step != null) {
      $maxStepAllowed += 1; 
    }
    onNext();
  }

  onMount(() => {
    if (step != null && step > $maxStepAllowed) {
      navigate(`${$rootPath}${escapeRoute}`);
    }
  });
</script>

<MainCardLayout>
  <div class="card-header bg-primary bg-gradient text-white">
    {#if showStep && step}
      <span class="em-capsule">STEP {step}</span>
    {/if}
    <span class="step-header">{header}</span>
  </div>
  <div class="card-body">
    <slot name="alerts"/>
    <slot/>
  </div>
  <div class="card-footer">
    <div class="bottom-stripe-left">
      <slot name="bottom-stripe-left">
        {#if onBack}
          <button type="button" class="btn btn-primary" on:click={onBackWrapper}><CaretLeftFill/> Back</button>
        {/if}
      </slot>
    </div>
    <div class="bottom-stripe-right">
      <slot name="bottom-stripe-right">
        {#if onNext}
          <button type="button" class="btn btn-primary" on:click={onNextWrapper}>Next <CaretRightFill/></button>
        {/if}
      </slot>
    </div>
  </div>
</MainCardLayout>

<style>
  .card-header {
    border-bottom: 2px solid black;
  }

  .em-capsule {
    background: rgba(0, 0, 0, 0.2);
    background-blend-mode: darken;
    border: 1px solid rgba(0, 0, 0, 0.5);
    padding-left: 0.6em;
    padding-right: 0.6em;
    border-radius: 999px;
    font-size: small;
  }

  .step-header {
    margin-left: 5px;
    font-variant: small-caps;
    font-family: "Open Sans", serif;
    letter-spacing: 0.06em;
  }

  .bottom-stripe-left {
    float: left;
  }
  .bottom-stripe-right {
    float: right;
  }

  .card-footer {
    background-color: rgba(0, 0, 0, 0.01);
  }
</style>