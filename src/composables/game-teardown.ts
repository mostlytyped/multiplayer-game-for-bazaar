import { rid } from "@/rethinkid";
import { Player } from "@/types";
import { getMyId, getPlayersTableName } from "@/utils";

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

  rid
    .tableDelete(getPlayersTableName(gameId), {
      rowId: myId,
      userId: gameUserId,
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
