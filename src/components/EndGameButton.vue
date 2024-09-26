<template>
  <button class="button is-small-text" @click="endGame">Delete Game</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useGetStringFromParam } from "@/composables/router-params";
import { bzr, useGamesCollection, usePlayersCollectionName } from "@/bzr";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "EndGameButton",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    const gamesCollection = useGamesCollection(gameUserId);

    function endGame() {
      if (!window.confirm("Are you sure you want to delete this game?")) return;

      gamesCollection
        .deleteOne(gameId)
        .then(() => {
          bzr.collections
            .drop(usePlayersCollectionName(gameId))
            .catch((e: any) => console.error(e.message));

          // bzr
          //   .permissionsGet({ tableName: GAMES_COLLECTION_NAME })
          //   .then((response: any) => {
          //     for (const permission of response) {
          //       if (permission.condition.rowId === gameId) {
          //         bzr.permissionsDelete({ permissionId: permission.id });
          //       }
          //     }
          //   });

          // bzr
          //   .permissionsGet({ tableName: usePlayersCollectionName(gameId) })
          //   .then((response: any) => {
          //     for (const permission of response) {
          //       bzr.permissionsDelete({ permissionId: permission.id });
          //     }
          //   });
        })
        .catch((e: any) => console.error(e.message))
        .finally(() => router.push({ name: "home" })); // in any case, safest bet just go home
    }

    return { endGame };
  },
});
</script>

<style scoped lang="scss"></style>
