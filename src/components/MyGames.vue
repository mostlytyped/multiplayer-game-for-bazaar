<template>
  <div v-if="gameIds.length > 0" class="my-games card">
    <h2>My Games</h2>
    <ul class="my-games-list">
      <li v-for="gameId in gameIds" :key="gameId">
        <router-link
          :to="{ name: 'game', params: { userId: myId, gameId: gameId } }"
          >{{ gameId }}</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { rid } from "@/rethinkid";
import { getMyId } from "@/utils";
import { GAME_TABLE_SUFFIX } from "@/constants";

export default defineComponent({
  name: "MyGames",
  setup() {
    let gameIds: any = ref([]);

    const myId = getMyId();

    rid
      .tablesList()
      .then((response: any) => {
        for (const dbName of response.data) {
          if (dbName.endsWith(GAME_TABLE_SUFFIX)) {
            const endIndex = dbName.length - GAME_TABLE_SUFFIX.length;
            const gameId = dbName.slice(0, endIndex);
            gameIds.value.push(gameId);
          }
        }
      })
      .catch((e) => console.error(e.message));

    return { gameIds, myId };
  },
});
</script>

<style scoped lang="scss"></style>
