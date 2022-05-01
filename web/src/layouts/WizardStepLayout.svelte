<script lang="ts">
  import MainCardLayout from "@layouts/MainCardLayout.svelte";

  export let step: Number | null;
  export let header = "";
  export let onBack: () => void | null = null;
  export let onNext: () => void | null = null;
</script>

<MainCardLayout>
  <div class="card-header bg-primary bg-gradient text-white">
    {#if step}
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
          <button type="button" class="btn btn-secondary" on:click={onBack}>Back</button>
        {/if}
      </slot>
    </div>
    <div class="bottom-stripe-right">
      <slot name="bottom-stripe-right">
        {#if onNext}
          <button type="button" class="btn btn-primary" on:click={onNext}>Next</button>
        {/if}
      </slot>
    </div>
  </div>
</MainCardLayout>

<style>
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
    font-family: Georgia, "Times New Roman", Times, serif;
  }

  .bottom-stripe-left {
    float: left;
  }
  .bottom-stripe-right {
    float: right;
  }
</style>