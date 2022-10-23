<template>
  <div
    class="player"
    :style="{
      left: player.coordinates.x + xUnit,
      bottom: player.coordinates.y + yUnit,
    }"
  >
    <!-- <div>{{ player.coordinates }}</div> -->
    <HitBox v-if="showHitBox" :coordinates="player.coordinates" />

    <div
      class="player-sprite"
      :style="{ width: PLAYER_SIZE + xUnit, height: PLAYER_SIZE + yUnit }"
    ></div>
    <div class="player-name is-small-text">
      {{ usePlayerName(player) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import HitBox from "@/components/HitBox.vue";
import { PLAYER_SIZE, X_UNIT, Y_UNIT } from "@/constants";
import { usePlayerName } from "@/composables/game-setup";

export default defineComponent({
  name: "GamePlayer",
  components: {
    HitBox,
  },
  props: ["player"], // add type
  setup() {
    const showHitBox = ref(false);

    return {
      showHitBox,
      xUnit: X_UNIT,
      yUnit: Y_UNIT,
      PLAYER_SIZE,
      usePlayerName,
    };
  },
});
</script>

<style scoped lang="scss">
.player {
  position: fixed;
  transition: all 3s linear; // if time matches frame rate = linear animation
  // position set with inline styles
}

.player-sprite {
  background-color: blue;
  // size set with inline styles
}

.player-name {
  font-size: 0.5em;
  position: absolute;
  top: 2vh;
  left: calc(2vw + 3px);
  transform: rotate(45deg);
  transform-origin: center left;
}
</style>
