<template>
  <div
    class="hitBoxPoint"
    :style="{ left: hitBox.x1 + xUnit, bottom: hitBox.y1 + yUnit }"
  >
    <!-- x1,y1 -->
  </div>
  <div
    class="hitBoxPoint"
    :style="{ left: hitBox.x2 + xUnit, bottom: hitBox.y1 + yUnit }"
  >
    <!-- x2,y1 -->
  </div>
  <div
    class="hitBoxPoint"
    :style="{ left: hitBox.x1 + xUnit, bottom: hitBox.y2 + yUnit }"
  >
    <!-- x1,y2 -->
  </div>
  <div
    class="hitBoxPoint"
    :style="{ left: hitBox.x2 + xUnit, bottom: hitBox.y2 + yUnit }"
  >
    <!-- x2,y2 -->
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { PLAYER_SIZE, X_UNIT, Y_UNIT } from "@/constants";
import { useGetRectangleFromPoint } from "@/composables/game-setup";

export default defineComponent({
  name: "HitBox",
  props: ["coordinates"],
  setup(props) {
    const hitBox = computed(() => {
      const hitBox = useGetRectangleFromPoint(props.coordinates, PLAYER_SIZE);

      return hitBox;
    });

    return { hitBox, xUnit: X_UNIT, yUnit: Y_UNIT };
  },
});
</script>

<style scoped lang="scss">
.hitBoxPoint {
  background-color: pink;
  height: 1px;
  width: 1px;
  position: fixed;
}
</style>
