import RethinkID from "@mostlytyped/rethinkid-js-sdk";
import { GAMES_TABLE_NAME } from "@/constants";
import { getMyId } from "@/utils";
import { Options } from "@mostlytyped/rethinkid-js-sdk/dist/types/types";

const config: Options = {
  appId: process.env.VUE_APP_APP_ID,
  loginRedirectUri: window.location.origin,
  dataAPIConnectErrorCallback: function (e: any) {
    // this = RethinkID
    // @ts-ignore
    // this.logOut();
    console.log("Data API connect error", e);
  },
};

// Enable local dev
if (process.env.NODE_ENV === "development") {
  config.oAuthUri = "http://localhost:4444";
  config.dataApiUri = "http://localhost:4000";
}

export const rid = new RethinkID(config);

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
