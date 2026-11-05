<script lang="ts">
  import { t, type MessageKey } from "../i18n/en";
  import { TUTORIAL_STEPS } from "../meta/tutorial";

  let { step, onnext, onskip }: { step: number; onnext: () => void; onskip: () => void } = $props();
  const manual = $derived(step === 0 || step === TUTORIAL_STEPS - 1);
</script>

<aside class="card tutorial" role="status" aria-live="polite">
  <p>{t(`tutorial${step}` as MessageKey)}</p>
  <div class="row">
    {#if manual}<button class="btn primary" type="button" onclick={onnext}>{t("tutorialNext")}</button>{/if}
    <button class="btn" type="button" onclick={onskip}>{t("tutorialSkip")}</button>
  </div>
</aside>
