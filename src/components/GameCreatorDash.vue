<template>
  <div class="card">
    <h2>Players standing by</h2>
    <ul>
      <li v-for="player in players" :key="player.id">
        {{ usePlayerName(player) }}
      </li>
    </ul>
    <div v-if="players.length < MIN_PLAYERS" class="is-small-text">
      Waiting for at least {{ MIN_PLAYERS }} players to be able to start game
    </div>
    <div v-else>
      <button class="button" @click="$emit('startGame')">Start Game</button>
    </div>
  </div>
  <h3>How to invite players</h3>
  <InvitePlayer />
  <ManageTeam />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import InvitePlayer from "@/components/InvitePlayer.vue";
import ManageTeam from "@/components/ManageTeam.vue";
import { MIN_PLAYERS } from "@/constants";
import { usePlayerName } from "@/composables/game-setup";

export default defineComponent({
  name: "GameCreatorDash",
  props: ["players"],
  emits: ["startGame"],
  components: {
    InvitePlayer,
    ManageTeam,
  },
  setup() {
    return { MIN_PLAYERS, usePlayerName };
  },
});
</script>

<style scoped lang="scss"></style>
