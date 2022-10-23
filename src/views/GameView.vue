<template>
  <div class="game">
    <h1 v-show="!game.gameOn">
      Briefing room <span v-show="game.name">({{ game.name }})</span>
    </h1>
    <p v-if="loading">Verifying security clearance...</p>
    <div v-else-if="error">Something went wrong...</div>
    <div v-else>
      <template v-if="!game.gameOn">
        <HowToJoinGame v-if="!useAmGameCreator && !amTeamMember" />
        <div v-if="!useAmGameCreator && amTeamMember">
          Waiting for creator to start game...
        </div>
        <GameCreatorDash
          v-if="useAmGameCreator"
          :players="players"
          @start-game="setGameOn(true)"
        />
      </template>

      <GamePlayer
        v-for="player of players"
        :key="player.id"
        :player="player"
        :class="{ 'is-semi-transparent': !game.gameOn }"
      />
    </div>
  </div>

  <button @click="useMoveMe" class="button move-button" v-if="game.gameOn">
    Move
  </button>

  <div class="nav">
    <button
      v-if="game.gameOn && useAmGameCreator"
      @click="setGameOn(false)"
      class="button is-small-text"
    >
      Pause Game
    </button>
    <router-link class="button is-small-text" :to="{ name: 'home' }"
      >Leave Game</router-link
    >
    <EndGameButton v-if="useAmGameCreator" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref, watch, onUnmounted } from "vue";
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
import {
  startGameEngine,
  stopGameEngine,
  useMoveMe,
} from "@/composables/game-engine";
import { useGamesTable, usePlayersTable } from "@/rethinkid";
import { useRoute } from "vue-router";
import { NO_READ_PERMISSIONS } from "@/constants";
import { Game, Player } from "@/types";
import { getMyId } from "@/utils";

export default defineComponent({
  name: "GameView",
  components: {
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
    const game: Game = reactive({
      id: "",
      name: "",
      gameOn: false,
    });
    const players: Ref<Player[]> = ref([]);

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    if (getMyId() === route.params.userId) {
      console.log("I am the game owner");
    } else {
      console.log("I am a guest in this game");
    }

    const playersTable = usePlayersTable(gameId, gameUserId);

    const gamesTable = useGamesTable(gameUserId);

    playersTable
      .read()
      .then((response: any) => {
        players.value = response.data;

        error.value = false;

        // I might not have created this game, but if I can read from it I've been
        // granted permissions, and so am a team member.
        amTeamMember.value = true;

        // Don't re-add me
        if (!usePlayerExistsInState(players.value, getMyId())) {
          // Add me as a player
          const me: Player = useInitPlayer(players.value);

          // Add me to local state
          players.value.push(me);

          // Add me to database
          playersTable.insert(me).catch((e) => console.error(e.message));
        }

        return gamesTable.read({ rowId: gameId });
      })
      .then((readGameResponse) => {
        if (!readGameResponse) return;

        Object.assign(game, readGameResponse.data);
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
        if (game.gameOn) startGameEngine(playersTable, players.value);
        else stopGameEngine();
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
              game.gameOn = updatedGame.gameOn;
            }
          })
          .then((unsubscribe) => (gameUnsubscribe = unsubscribe))
          .catch((e) => console.error(e.message));

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
              console.log("player updated", player);
              useUpdatePlayerInState(players.value, player);
            }
          })
          .then((unsubscribe) => (playersUnsubscribe = unsubscribe))
          .catch((e) => console.error(e.message));
      }
    });

    // Handle navigating to different view within app only
    onUnmounted(() => {
      useRemoveMe(playersTable, players.value);
      stopGameEngine();

      // Unsubscribe
      gameUnsubscribe();
      playersUnsubscribe();
    });

    function setGameOn(status: boolean) {
      game.gameOn = status;
      gamesTable.update(game).catch((e) => console.error(e.message));
    }

    return {
      loading,
      error,
      game,
      players,
      useAmGameCreator,
      amTeamMember,
      setGameOn,
      useMoveMe,
    };
  },
});
</script>

<style lang="scss">
.game {
  padding: 1em;
}

.team {
  margin-top: 2em;
}

.move-button {
  position: fixed;
  bottom: 3px;
  left: 3px;
}
</style>
