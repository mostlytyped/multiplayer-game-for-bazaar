<template>
  <div class="card">
    <p>1. Copy game URL and send to invite other players</p>
    <button class="button is-small-text" @click="copyUrlToClipboard">
      {{ copyButtonText }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "InvitePlayer",
  setup() {
    const copyButtonTextInitial = "Copy URL";
    const copyButtonText = ref(copyButtonTextInitial);

    function copyUrlToClipboard(): void {
      copyButtonText.value = "Copied!";
      navigator.clipboard.writeText(window.location.href);

      setTimeout(() => {
        copyButtonText.value = copyButtonTextInitial;
      }, 1000);
    }

    return { copyUrlToClipboard, copyButtonText };
  },
});
</script>

<style scoped lang="scss"></style>
