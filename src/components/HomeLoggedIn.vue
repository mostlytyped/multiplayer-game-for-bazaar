<template>
  <div>
    <p class="home-title">Rocket launch successful! You are in space.</p>
    <div class="start-buttons">
      <button @click="useCreateAndGoToGame($router)" class="button">
        New Game
      </button>
    </div>
  </div>

  <p class="is-small-text">
    Note, to join someone else's game, go to a URL provided by its creator.
  </p>

  <MyGames />

  <div class="nav">
    <button @click="logout" class="button is-small-text">
      Return to earth
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MyGames from "@/components/MyGames.vue";
import { useCreateAndGoToGame } from "@/composables/game-setup";
import { rid } from "@/rethinkid";

export default defineComponent({
  name: "HomeLoggedIn",
  components: {
    MyGames,
  },
  setup() {
    function logout() {
      return rid.logOut();
    }

    return { useCreateAndGoToGame, logout };
  },
});
</script>

<style scoped lang="scss">
.home-title {
  text-align: center;
}

.start-buttons {
  display: flex;
  justify-content: space-around;
}
</style>
