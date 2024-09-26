import { Player } from "@/types";
import { getMyId } from "@/utils";
import { CollectionAPI } from "@bzr/bazaar";

/**
 * Remove player when they navigate away from the game view (to another view in the app)
 * e.g. used in onUnmounted in setup()
 *
 * To handle page refresh and navigating to a different site, `window.addEventListener("beforeunload", removePlayer)` doesn't work
 */
export function useRemoveMe(
  playersCollection: CollectionAPI<Player>,
  players: Player[]
) {
  const myId = getMyId();

  useRemovePlayerFromState(players, myId);

  playersCollection.deleteOne(myId).catch((e: any) => console.error(e.message));
}

export function useRemovePlayerFromState(
  players: Player[],
  playerId: string
): void {
  const index = players.findIndex((p) => p.id === playerId);
  players.splice(index, 1);
}
