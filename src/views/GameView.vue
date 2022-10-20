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
          :players="game.players"
          @start-game="setGameOn(true)"
        />
      </template>

      <GamePlayer
        v-for="player of game.players"
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
import { defineComponent, reactive, ref, watch, onUnmounted } from "vue";
import GamePlayer from "@/components/GamePlayer.vue";
import EndGameButton from "@/components/EndGameButton.vue";
import HowToJoinGame from "@/components/HowToJoinGame.vue";
import GameCreatorDash from "@/components/GameCreatorDash.vue";
import { useGetStringFromParam } from "@/composables/router-params";
import { useAmGameCreator } from "@/composables/game-roles";
import {
  useInitPlayer,
  usePlayerExistsInState,
} from "@/composables/game-setup";
import { useRemoveMe } from "@/composables/game-teardown";
import {
  startGameEngine,
  stopGameEngine,
  useMoveMe,
} from "@/composables/game-engine";
import { rid } from "@/rethinkid";
import { useRoute } from "vue-router";
import { GAME_TABLE_NAME, NO_READ_PERMISSIONS } from "@/constants";
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
      players: [],
    });

    const gameId = useGetStringFromParam(route.params.gameId);
    const gameUserId = useGetStringFromParam(route.params.userId);

    if (getMyId() === route.params.userId) {
      console.log("I am the game owner");
    } else {
      console.log("I am a guest in this game");
    }

    const onCreateGame = async () => {
      console.log("onCreate game table in GameView fired");
    };
    const gameTable = rid.table(GAME_TABLE_NAME, onCreateGame, {
      userId: gameUserId,
    });

    console.log("Get game");

    gameTable
      .read({ rowId: gameId })
      .then((response: any) => {
        console.log("got game", response);

        error.value = false;

        // I might not have created this game, but if I can read from it I've been
        // granted permissions, and so am a team member.
        amTeamMember.value = true;

        console.log("game before", game);
        Object.assign(game, response.data);
        console.log("game after", game);

        // if (response.data.players) {
        //   game.players = response.data.players;
        // }

        // Don't re-add me
        if (!usePlayerExistsInState(game.players, getMyId())) {
          console.log("I'm not a player, so add me as a player");

          // Add me as a player
          const me: Player = useInitPlayer(game.players);

          // Add me to local state
          game.players.push(me);

          // Add me to database
          gameTable
            .update({ id: gameId, players: game.players })
            .then((response) => {
              console.log("update response", response);

              gameTable.read({ rowId: gameId }).then((response: any) => {
                console.log("read after update", response);
              });
              //
            });
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
        if (game.gameOn) startGameEngine(game.players, gameId, gameUserId);
        else stopGameEngine();
      },
      { deep: true }
    );

    // Subscribe to game and players changes
    let gameUnsubscribe = () =>
      console.log("Not subscribed to", GAME_TABLE_NAME); // TODO subscribe to doc, not table

    watch(amTeamMember, (amTeamMember, prevAmTeamMember) => {
      if (prevAmTeamMember === amTeamMember) return;

      if (amTeamMember) {
        // Subscribe to game changes
        gameTable
          .subscribe({}, (changes: any) => {
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

        // playersTable
        //   .subscribe({}, (changes: any) => {
        //     //  added
        //     if (changes.new_val && changes.old_val === null) {
        //       const player = changes.new_val;
        //       console.log("player added", player);
        //       if (usePlayerExistsInState(game.players, player.id)) {
        //         console.log("Player already exists");
        //       } else {
        //         game.players.push(player);
        //       }
        //     }
        //     // deleted
        //     if (changes.new_val === null && changes.old_val) {
        //       const player = changes.old_val;
        //       console.log("player deleted", player);
        //       useRemovePlayerFromState(game.players, player.id);
        //     }
        //     // updated
        //     if (changes.new_val && changes.old_val) {
        //       const player = changes.new_val;
        //       // console.log("player updated", player);
        //       useUpdatePlayerInState(game.players, player);
        //     }
        //   })
        //   .then((unsubscribe) => (playersUnsubscribe = unsubscribe))
        //   .catch((e) => console.error(e.message));
      }
    });

    // Handle navigating to different view within app only
    onUnmounted(() => {
      useRemoveMe(game.players, gameId, gameUserId);
      stopGameEngine();

      // Unsubscribe
      gameUnsubscribe();
    });

    function setGameOn(status: boolean) {
      game.gameOn = status;

      gameTable.update(game).catch((e) => console.error(e.message));
    }

    return {
      loading,
      error,
      game,
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
