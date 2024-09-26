<template>
  <div v-if="games.length > 0" class="my-games card">
    <h2>My Games</h2>
    <ul class="my-games-list">
      <li v-for="game in games" :key="game.id">
        <router-link
          :to="{ name: 'game', params: { userId: myId, gameId: game.id } }"
          >{{ game.name }} - {{ game.id }}</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useGamesCollection } from "@/bzr";
import { getMyId } from "@/utils";

export default defineComponent({
  name: "MyGames",
  setup() {
    let games: any = ref([]);

    const myId: Ref<string> = ref(getMyId());

    const gamesCollection = useGamesCollection();

    gamesCollection
      .getAll()
      .then((fetchedGames: any) => {
        console.log("fetched games", fetchedGames);
        games.value = fetchedGames;
      })
      .catch((e: any) => {
        console.error(e.type);
        console.error(e.message);
        console.error(e);
      });

    return { games, myId };
  },
});
</script>

<style scoped lang="scss">
.my-games-list {
  a {
    color: yellow;
  }
}
</style>
