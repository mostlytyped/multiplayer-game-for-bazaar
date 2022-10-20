import { rid } from "@/rethinkid";
import { Player } from "@/types";
import { getMyId } from "@/utils";
import { GAME_TABLE_NAME } from "@/constants";

/**
 * Remove player when they navigate away from the game view (to another view in the app)
 * e.g. used in onUnmounted in setup()
 *
 * To handle page refresh and navigating to a different site, `window.addEventListener("beforeunload", removePlayer)` doesn't work
 */
export function useRemoveMe(
  players: Player[],
  gameId: string,
  gameUserId: string
) {
  const myId = getMyId();

  useRemovePlayerFromState(players, myId);

  const onCreate = async () => console.log("on create fired");
  const gameTable = rid.table(GAME_TABLE_NAME, onCreate, {
    userId: gameUserId,
  });

  gameTable
    .update({ id: gameId, players })
    .then(() => {
      console.log("deleted my user from the game", gameId);
    })
    .catch((e) => console.error(e.message));
}

export function useRemovePlayerFromState(
  players: Player[],
  playerId: string
): void {
  const index = players.findIndex((p) => p.id === playerId);
  players.splice(index, 1);
}
