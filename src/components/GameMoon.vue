<template>
  <div
    class="moon"
    :style="{
      left: moon.coordinates.x + xUnit,
      bottom: moon.coordinates.y + yUnit,
    }"
  >
    <div
      class="moon-sprite"
      :style="{ width: MOON_SIZE + xUnit, height: MOON_SIZE + yUnit }"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { MOON_SIZE, X_UNIT, Y_UNIT } from "@/constants";
import { usePlayerName } from "@/composables/game-setup";

export default defineComponent({
  name: "GameMoon",
  props: ["moon"], // add type
  setup() {
    const showHitBox = ref(false);

    return {
      showHitBox,
      xUnit: X_UNIT,
      yUnit: Y_UNIT,
      MOON_SIZE,
      usePlayerName,
    };
  },
});
</script>

<style scoped lang="scss">
.moon {
  position: fixed;
  transition: all 1s linear; // if time matches frame rate = linear animation
  // position set with inline styles
}

.moon-sprite {
  background-color: white;
  // size set with inline styles
  border-radius: 100%;
}
</style>
