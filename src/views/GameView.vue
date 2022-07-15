<template>
  <div class="game">
    <h1 v-show="!game.gameOn">Briefing room</h1>
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
      >Quit Game</router-link
    >
    <EndGameButton v-if="useAmGameCreator" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref, watch, onUnmounted } from "vue";
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
import { rid } from "@/rethinkid";
import { useRoute } from "vue-router";
import { NO_READ_PERMISSIONS, NO_TABLE_REGEX } from "@/constants";
import { Game, Player } from "@/types";
import { getMyId, getGameTableName, getPlayersTableName } from "@/utils";

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
      gameOn: false,
    });
    const players: Ref<Player[]> = ref([]);

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    const playersTableName = getPlayersTableName(gameId);
    const gameTableName = getGameTableName(gameId);

    // Get players, add me as player, get game...
    rid
      .tableRead(playersTableName, { userId: gameUserId })
      .then((response: any) => {
        error.value = false;

        // I might not have created this game, but if I can read from it I've been
        // granted permissions, and so am a team member.
        amTeamMember.value = true;

        players.value = response.data;
      })
      .catch((e) => {
        if (e.message.match(NO_TABLE_REGEX)) {
          console.log("Players table does not exist, create it");
          return rid.tablesCreate(playersTableName);
        }

        throw e;
      })
      .then(() => {
        // Don't re-add me
        if (usePlayerExistsInState(players.value, getMyId())) {
          console.log("I am already a player");
          return;
        }

        console.log("Add me as a player");

        // Add me as a player
        const me: Player = useInitPlayer(players.value);

        // Add me to local state
        players.value.push(me);

        // Add me to database
        return rid.tableInsert(playersTableName, me, { userId: gameUserId });
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
        if (!error.value) {
          console.log("Finished player setup");
          getGame();
        }
      });

    function getGame() {
      console.log("Get game");

      rid
        .tableRead(gameTableName, { rowId: gameId, userId: gameUserId })
        .then((response: any) => {
          error.value = false;
          Object.assign(game, response.data);
        })
        .catch((e) => console.error(e.message))
        .finally(() => {
          loading.value = false;
          gameReady.value = true;
        });
    }

    // Stop and start game
    watch(
      game,
      (game) => {
        if (game.gameOn) startGameEngine(players.value, gameId, gameUserId);
        else stopGameEngine();
      },
      { deep: true }
    );

    // Subscribe to game and players changes
    let gameUnsubscribe = () => console.log("Not subscribed to", gameTableName);
    let playersUnsubscribe = () =>
      console.log("Not subscribed to", playersTableName);

    watch(amTeamMember, (amTeamMember, prevAmTeamMember) => {
      if (prevAmTeamMember === amTeamMember) return;

      if (amTeamMember) {
        // Subscribe to game changes
        rid
          .tableSubscribe(
            gameTableName,
            { userId: gameUserId },
            (changes: any) => {
              //  added
              if (changes.new_val && changes.old_val === null) {
                console.log("added game", changes.new_val);
              }
              // deleted
              if (changes.new_val === null && changes.old_val) {
                console.log("deleted game", changes.old_val);
              }
              // updated
              if (changes.new_val && changes.old_val) {
                const updatedGame = changes.new_val;
                console.log("updated game", updatedGame);
                game.gameOn = updatedGame.gameOn;
              }
            }
          )
          .then((unsubscribe) => (gameUnsubscribe = unsubscribe))
          .catch((e) => console.error(e.message));

        rid
          .tableSubscribe(
            playersTableName,
            { userId: gameUserId },
            (changes: any) => {
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
            }
          )
          .then((unsubscribe) => (playersUnsubscribe = unsubscribe))
          .catch((e) => console.error(e.message));
      }
    });

    // Handle navigating to different view within app only
    onUnmounted(() => {
      useRemoveMe(players.value, gameId, gameUserId);
      stopGameEngine();

      // Unsubscribe
      gameUnsubscribe();
      playersUnsubscribe();
    });

    function setGameOn(status: boolean) {
      game.gameOn = status;

      rid
        .tableUpdate(gameTableName, game, { userId: gameUserId })
        .catch((e) => console.error(e.message));
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
