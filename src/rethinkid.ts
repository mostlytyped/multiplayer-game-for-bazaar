import RethinkID from "@mostlytyped/rethinkid-js-sdk";
import { GAMES_TABLE_NAME } from "@/constants";
import { getMyId } from "@/utils";

export const rid = new RethinkID({
  appId: process.env.VUE_APP_APP_ID,
  loginRedirectUri: window.location.origin,
  // Enable local dev
  oAuthUri: "http://localhost:4444",
  dataApiUri: "http://localhost:4000",
  dataAPIConnectErrorCallback: function (e: any) {
    // this = RethinkID
    // @ts-ignore
    // this.logOut();
    console.log("Data API connect error", e);
  },
});

export function usePlayersTableName(gameId: string): string {
  return `players_${gameId}`;
}

export const useGamesTable = (userId?: string) => {
  return rid.table(
    GAMES_TABLE_NAME,
    async () => console.log("onCreate games table"),
    {
      userId: userId || getMyId(),
    }
  );
};

export const usePlayersTable = (gameId: string, userId: string) => {
  return rid.table(
    usePlayersTableName(gameId),
    async () => console.log("onCreate players table"),
    {
      userId: userId || getMyId(),
    }
  );
};
