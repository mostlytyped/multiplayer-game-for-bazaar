<template>
  <button class="button is-small-text" @click="endGame">Delete Game</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GAMES_TABLE_NAME } from "@/constants";
import { useGetStringFromParam } from "@/composables/router-params";
import { rid, useGamesTable, usePlayersTableName } from "@/rethinkid";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "EndGameButton",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    const gamesTable = useGamesTable(gameUserId);

    function endGame() {
      if (!window.confirm("Are you sure you want to delete this game?")) return;

      gamesTable
        .delete({ rowId: gameId })
        .then(() => {
          rid
            .tablesDrop(usePlayersTableName(gameId))
            .catch((e) => console.error(e.message));

          rid
            .permissionsGet({ tableName: GAMES_TABLE_NAME })
            .then((response: any) => {
              for (const permission of response.data) {
                if (permission.condition.rowId === gameId) {
                  rid.permissionsDelete({ permissionId: permission.id });
                }
              }
            });

          rid
            .permissionsGet({ tableName: usePlayersTableName(gameId) })
            .then((response: any) => {
              for (const permission of response.data) {
                rid.permissionsDelete({ permissionId: permission.id });
              }
            });
        })
        .catch((e) => console.error(e.message))
        .finally(() => router.push({ name: "home" })); // in any case, safest bet just go home
    }

    return { endGame };
  },
});
</script>

<style scoped lang="scss"></style>
