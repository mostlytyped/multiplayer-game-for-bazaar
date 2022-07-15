<template>
  <div class="card">
    <p>To join this game, copy your user ID and send it to the creator.</p>
    <button class="button is-small-text" @click="copyIdToClipboard">
      {{ copyButtonText }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { getMyId } from "@/utils";

export default defineComponent({
  name: "HowToJoinGame",
  setup() {
    const copyButtonTextInitial = "Copy my user ID";
    const copyButtonText = ref(copyButtonTextInitial);

    function copyIdToClipboard(): void {
      copyButtonText.value = "Copied!";
      navigator.clipboard.writeText(getMyId());

      setTimeout(() => {
        copyButtonText.value = copyButtonTextInitial;
      }, 1000);
    }

    return { copyIdToClipboard, copyButtonText };
  },
});
</script>

<style scoped lang="scss"></style>
