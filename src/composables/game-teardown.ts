import { Player } from "@/types";
import { getMyId } from "@/utils";
import { Table } from "@mostlytyped/rethinkid-js-sdk/dist/types/table";

/**
 * Remove player when they navigate away from the game view (to another view in the app)
 * e.g. used in onUnmounted in setup()
 *
 * To handle page refresh and navigating to a different site, `window.addEventListener("beforeunload", removePlayer)` doesn't work
 */
export function useRemoveMe(playersTable: Table, players: Player[]) {
  const myId = getMyId();

  useRemovePlayerFromState(players, myId);

  playersTable.delete({ rowId: myId }).catch((e) => console.error(e.message));
}

export function useRemovePlayerFromState(
  players: Player[],
  playerId: string
): void {
  const index = players.findIndex((p) => p.id === playerId);
  players.splice(index, 1);
}
