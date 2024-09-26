import { ref } from "vue";
import { useGamesCollection } from "@/bzr";
import { getMyId } from "@/utils";

export const useTeam: any = ref([]);

/**
 * Fetches team data from API and sets to the `useTeam` ref.
 */
export function useGetTeam(gameId: string) {
  useTeam.value = [];

  // TODO Get teamIDs from games doc
  const myId = getMyId();

  useGamesCollection(myId)
    .getOne(gameId)
    .then((response: any) => {
      console.log("read game res (check for team Ids)", response);
      if (response.teamIds) useTeam.value = response.teamIds;
    });
}
