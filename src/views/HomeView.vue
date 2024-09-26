<template>
  <div class="home">
    <div>
      <!-- Logged out -->
      <template v-if="!isLoggedIn">
        <button @click="login" class="button">
          Commence space exploration
        </button>
      </template>
      <!-- Logged in -->
      <template v-else>
        <div>
          <p class="home-title">Rocket launch successful! You are in space.</p>
          <div class="start-buttons">
            <button @click="createAndGoToGame" class="button">New Game</button>
          </div>
        </div>

        <MyGames />

        <div class="nav">
          <button @click="logOut" class="button is-small-text">
            Return to earth
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MyGames from "@/components/MyGames.vue";
import { useCreateGame } from "@/composables/game-setup";
import { bzr } from "@/bzr";
import { useRouter } from "vue-router";
import { getMyId } from "@/utils";
import { LOCAL_STORAGE_NAME_MY_ID } from "@/constants";

const router = useRouter();

const isLoggedIn = ref(bzr.isLoggedIn());

function login() {
  bzr.login();
}

function logOut() {
  bzr.logOut();
}

async function doLogin(): Promise<void> {
  if (!bzr.isLoggedIn()) return;
  isLoggedIn.value = true;

  // Set user ID in localStorage for global access
  bzr.social.getUser().then((user) => {
    console.log("user", user);
    localStorage.setItem(LOCAL_STORAGE_NAME_MY_ID, user.id);
  });
}

bzr.onLogin(doLogin);
doLogin();

async function createAndGoToGame() {
  const gameId = await useCreateGame();

  router.push({
    name: "game",
    params: { userId: getMyId(), gameId },
  });
}
</script>

<style lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: space-around;

  height: 100vh;
  padding: 1em;
}

.home-title {
  text-align: center;
}

.start-buttons {
  display: flex;
  justify-content: space-around;
}
</style>
