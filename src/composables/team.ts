import { ref } from "vue";
import { rid } from "@/rethinkid";
import { GAMES_TABLE_NAME } from "@/constants";

export const useTeam: any = ref([]);

/**
 * Fetches team data from API and sets to the `useTeam` ref.
 */
export function useGetTeam(gameId: string) {
  useTeam.value = [];

  rid
    .permissionsGet({
      tableName: GAMES_TABLE_NAME,
      type: "read",
    })
    .then((response: any) => {
      for (const permission of response.data) {
        if (permission.condition.rowId === gameId) {
          useTeam.value.push(permission);
        }
      }
    })
    .catch((e: any) => console.error(e.message));
}
