import { ref } from "vue";
import { rid } from "@/rethinkid";
import { GAME_TABLE_NAME } from "@/constants";

export const useTeam: any = ref([]);

/**
 * Fetches team data from API and sets to the `useTeam` ref.
 */
export function useGetTeam(gameId: string) {
  // TODO need to get team, match ID on players doc.
  rid
    .permissionsGet({ tableName: GAME_TABLE_NAME, type: "read" })
    .then((response) => (useTeam.value = response.data))
    .catch((e) => console.error(e.message));
}
