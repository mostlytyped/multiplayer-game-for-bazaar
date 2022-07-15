<template>
  <button class="button is-small-text" @click="endGame">End Game</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useGetStringFromParam } from "@/composables/router-params";
import { getGameTableName, getPlayersTableName } from "@/utils";
import { rid } from "@/rethinkid";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "EndGameButton",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const gameId = useGetStringFromParam(route.params.gameId);

    const gameTableName = getGameTableName(gameId);
    const playersTableName = getPlayersTableName(gameId);

    function endGame() {
      if (!window.confirm("Are you sure you want to delete this game?")) return;

      rid
        .tablesDrop(gameTableName)
        .then((r) => {
          console.log("res drop game table", r);
          return rid.tablesDrop(playersTableName);
        })
        .catch((e) => console.error(e.message)) // maybe one or more tables already deleted
        .finally(() => router.push({ name: "home" })); // either way, safest bet just go home

      // rid
      //   .tableDelete(gameTableName, { rowId: gameId, userId: gameUserId })
      //   .catch((e) => console.error(e.message)) // maybe table already deleted
      //   .finally(() => router.push({ name: "home" })); // either way, safest bet just go home

      // rid
      //   .tableDelete(playersTableName, { rowId: gameId, userId: gameUserId })
      //   .catch((e) => console.error(e.message)) // maybe table already deleted
      //   .finally(() => router.push({ name: "home" })); // either way, safest bet just go home
    }

    return { endGame };
  },
});
</script>

<style scoped lang="scss"></style>
