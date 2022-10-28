<template>
  <div class="game">
    <div class="game-background"></div>
    <h1 v-show="!game.on">
      Mission Code Name: <span v-show="game.name">{{ game.name }}</span>
    </h1>
    <p v-if="loading">Verifying security clearance...</p>
    <div v-else-if="error">Something went wrong...</div>
    <div v-else>
      <div class="text-overlay">
        <div v-if="game.winner">
          <template v-if="game.winner === me.name"
            >The mission is a success! You landed on the moon.</template
          >
          <template v-else
            >Mission failed! {{ me.name }} landed on the moon first.
          </template>
        </div>
        <div v-else-if="game.over">
          <h2>GAME OVER</h2>
          <p>No one made it to the moon. The mission is a failure.</p>
        </div>
        <div v-else-if="game.starting">
          Game about to start! Be the first to get to the moon.
        </div>
        <template v-else-if="!game.on">
          <HowToJoinGame v-if="!useAmGameCreator && !amTeamMember" />
          <div v-if="!useAmGameCreator && amTeamMember">
            <template v-if="game.paused">Creator has paused the game.</template>
            <template v-else>Waiting for creator to start game...</template>
          </div>
          <GameCreatorDash
            v-if="useAmGameCreator"
            :game="game"
            :players="players"
            @start-game="setGameOn(true)"
          />
        </template>
      </div>

      <div class="timer">Oxygen Remaining: {{ game.timeRemaining }}</div>
      <GamePlayer
        v-for="player of players"
        :key="player.id"
        :player="player"
        :class="{ 'is-semi-transparent': !game.on }"
      />
      <GameMoon
        v-if="amTeamMember"
        :moon="game.moon"
        :class="{ 'is-semi-transparent': !game.on }"
      />
    </div>
  </div>

  <button
    @click="useMoveMe"
    class="button move-button"
    v-if="game.on"
    :disabled="useAmMoving"
  >
    <template v-if="useAmMoving">Moving...</template>
    <template v-else>Move</template>
  </button>

  <div class="nav">
    <button
      v-if="useAmGameCreator && game.on"
      @click="togglePause()"
      class="button is-small-text"
    >
      <template v-if="game.paused">Continue Game</template>
      <template v-else>Pause Game</template>
    </button>
    <router-link class="button is-small-text" :to="{ name: 'home' }"
      >Leave Game</router-link
    >
    <EndGameButton v-if="useAmGameCreator" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref, watch, onUnmounted } from "vue";
import GameMoon from "@/components/GameMoon.vue";
import GamePlayer from "@/components/GamePlayer.vue";
import EndGameButton from "@/components/EndGameButton.vue";
import HowToJoinGame from "@/components/HowToJoinGame.vue";
import GameCreatorDash from "@/components/GameCreatorDash.vue";
import { useGetStringFromParam } from "@/composables/router-params";
import { useAmGameCreator } from "@/composables/game-roles";
import {
  useInitPlayer,
  usePlayerExistsInState,
  useUpdatePlayerInState,
} from "@/composables/game-setup";
import {
  useRemoveMe,
  useRemovePlayerFromState,
} from "@/composables/game-teardown";
import { useMoveMe, useAmMoving, GameEngine } from "@/composables/game-engine";
import { useGamesTable, usePlayersTable } from "@/rethinkid";
import { useRoute } from "vue-router";
import { NO_READ_PERMISSIONS, TIME_LIMIT } from "@/constants";
import { Game, Player } from "@/types";
import { getMyId } from "@/utils";

export default defineComponent({
  name: "GameView",
  components: {
    GameMoon,
    GamePlayer,
    EndGameButton,
    HowToJoinGame,
    GameCreatorDash,
  },
  setup() {
    const route = useRoute();

    const loading = ref(true);
    const error = ref(false);
    const amTeamMember = ref(false);
    const gameReady = ref(false);
    const me: any = reactive({});
    const game: Game = reactive({
      id: "",
      name: "",
      moon: {
        coordinates: {
          x: -1000,
          y: -1000,
        },
      },
      on: false,
      over: false,
      winner: "",
      paused: false,
      starting: false,
      timeRemaining: TIME_LIMIT,
    });
    const players: Ref<Player[]> = ref([]);

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    if (getMyId() === gameUserId) {
      console.log("I am the game owner");
    } else {
      console.log("I am a guest in this game");
    }

    const playersTable = usePlayersTable(gameId, gameUserId);
    const gamesTable = useGamesTable(gameUserId);

    const gameEngine = reactive(
      new GameEngine({
        gamesTable,
        game,
        playersTable,
        players: players.value,
      })
    );

    gamesTable
      .read({ rowId: gameId })
      .then((readGameResponse: any) => {
        if (!readGameResponse) return;

        Object.assign(game, readGameResponse.data);
        gameEngine.game = game;

        return playersTable.read();
      })
      .then((response: any) => {
        players.value = response.data;
        gameEngine.players = players.value;

        error.value = false;

        // I might not have created this game, but if I can read from it I've been
        // granted permissions, and so am a team member.
        amTeamMember.value = true;

        // Don't re-add me
        if (!usePlayerExistsInState(players.value, getMyId())) {
          // Add me as a player
          Object.assign(
            me,
            useInitPlayer(players.value, gameUserId, game.moon.coordinates)
          );

          // Add me to local state
          players.value.push(me);

          // Add me to database
          playersTable.insert(me).catch((e: any) => console.error(e.message));
        }
      })
      .catch((e) => {
        console.error(e.message);

        if (e.message === NO_READ_PERMISSIONS) {
          // User is a guest, not yet a team member, not an error
          amTeamMember.value = false;
        } else {
          error.value = true;
        }
      })
      .finally(() => {
        loading.value = false;
        gameReady.value = true;
      });

    // Stop and start game
    watch(
      game,
      (game) => {
        if (game.on) gameEngine.start();
        if (!game.on) gameEngine.stop();
      },
      { deep: true }
    );

    // Subscribe to game and players changes
    let gameUnsubscribe = () => console.log("Not subscribed to game doc");
    let playersUnsubscribe = () =>
      console.log("Not subscribed to players table");

    watch(amTeamMember, (amTeamMember, prevAmTeamMember) => {
      if (prevAmTeamMember === amTeamMember) return;

      if (amTeamMember) {
        // Subscribe to game changes
        gamesTable
          .subscribe({ rowId: gameId }, (changes: any) => {
            //  added
            if (changes.new_val && changes.old_val === null) {
              console.log("added game", changes.new_val);
            }
            // deleted
            if (changes.new_val === null && changes.old_val) {
              console.log("deleted game onChange", changes.old_val);
            }
            // updated
            if (changes.new_val && changes.old_val) {
              const updatedGame = changes.new_val;
              console.log("updated game", updatedGame);
              game.on = updatedGame.on;
              game.over = updatedGame.over;
              game.winner = updatedGame.winner;
              game.starting = updatedGame.starting;
              game.paused = updatedGame.paused;
            }
          })
          .then((unsubscribe: any) => (gameUnsubscribe = unsubscribe))
          .catch((e: any) => console.error(e.message));

        playersTable
          .subscribe({}, (changes: any) => {
            //  added
            if (changes.new_val && changes.old_val === null) {
              const player = changes.new_val;
              console.log("player added", player);
              if (usePlayerExistsInState(players.value, player.id)) {
                console.log("Player already exists");
              } else {
                players.value.push(player);
              }
            }
            // deleted
            if (changes.new_val === null && changes.old_val) {
              const player = changes.old_val;
              console.log("player deleted", player);
              useRemovePlayerFromState(players.value, player.id);
            }
            // updated
            if (changes.new_val && changes.old_val) {
              const player = changes.new_val;
              // console.log("player updated", player);
              useUpdatePlayerInState(players.value, player);
            }
          })
          .then((unsubscribe: any) => (playersUnsubscribe = unsubscribe))
          .catch((e: any) => console.error(e.message));
      }
    });

    // Handle navigating to different view within app only
    onUnmounted(() => {
      useRemoveMe(playersTable, players.value);
      gameEngine.stop();

      // Unsubscribe
      gameUnsubscribe();
      playersUnsubscribe();
    });

    function setGameOn(status: boolean) {
      game.starting = true;
      gamesTable.update(game).catch((e: any) => console.error(e.message));

      setTimeout(() => {
        game.on = status;
        game.paused = false;
        game.starting = false;
        gamesTable.update(game).catch((e: any) => console.error(e.message));
      }, 3000);
    }

    function togglePause() {
      game.paused = !game.paused;
      game.on = !game.paused;
      gamesTable.update(game).catch((e: any) => console.error(e.message));
    }

    return {
      loading,
      error,
      game,
      players,
      useAmGameCreator,
      amTeamMember,
      setGameOn,
      togglePause,
      useMoveMe,
      useAmMoving,
      me,
    };
  },
});
</script>

<style lang="scss">
.game {
  padding: 1em;
  overflow-y: auto;
  position: absolute;
  top: 17px;
  bottom: 37px;
}

.game-background {
  background-color: #333;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vh;
  z-index: -1;
}

.team {
  margin-top: 2em;
}

.move-button {
  position: fixed;
  bottom: 3px;
  left: 3px;
}

.timer {
  position: fixed;
  top: 3px;
  left: 3px;
}

.text-overlay {
  position: relative;
  z-index: 100;
}
</style>
