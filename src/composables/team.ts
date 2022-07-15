import { ref } from "vue";
import { rid } from "@/rethinkid";
import { getGameTableName } from "@/utils";

export const useTeam: any = ref([]);

/**
 * Fetches team data from API and sets to the `useTeam` ref.
 */
export function useGetTeam(gameId: string) {
  rid
    .permissionsGet({ tableName: getGameTableName(gameId), type: "read" })
    .then((response) => (useTeam.value = response.data))
    .catch((e) => console.error(e.message));
}
