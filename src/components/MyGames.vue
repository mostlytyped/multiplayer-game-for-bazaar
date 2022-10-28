<template>
  <div v-if="games.length > 0" class="my-games card">
    <h2>My Games</h2>
    <ul class="my-games-list">
      <li v-for="game in games" :key="game.id">
        <router-link
          :to="{ name: 'game', params: { userId: myId, gameId: game.id } }"
          >{{ game.name }}</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useGamesTable } from "@/rethinkid";
import { getMyId } from "@/utils";

export default defineComponent({
  name: "MyGames",
  setup() {
    let games: any = ref([]);

    const myId = getMyId();

    const gamesTable = useGamesTable(myId);

    gamesTable
      .read()
      .then((response: any) => {
        console.log("response read games", response);
        games.value = response.data;
      })
      .catch((e: any) => console.error(e.message));

    return { games, myId };
  },
});
</script>

<style scoped lang="scss"></style>
