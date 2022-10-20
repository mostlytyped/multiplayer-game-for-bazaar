<template>
  <button class="button is-small-text" @click="endGame">Delete Game</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GAME_TABLE_NAME } from "@/constants";
import { useGetStringFromParam } from "@/composables/router-params";
import { rid } from "@/rethinkid";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "EndGameButton",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    const gamesTableOnCreate = async () => {
      console.log("Table onCreate callback fired!");
    };

    const gamesTable = rid.table(GAME_TABLE_NAME, gamesTableOnCreate, {
      userId: gameUserId,
    });

    function endGame() {
      if (!window.confirm("Are you sure you want to delete this game?")) return;

      gamesTable
        .delete({ rowId: gameId })
        .then((r) => {
          console.log("res delete game", r);
        })
        .catch((e) => console.error(e.message))
        .finally(() => router.push({ name: "home" })); // in any case, safest bet just go home
    }

    return { endGame };
  },
});
</script>

<style scoped lang="scss"></style>
