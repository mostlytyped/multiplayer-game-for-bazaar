import { BazaarApp, BazaarOptions } from "@bzr/bazaar";
import { GAMES_COLLECTION_NAME } from "@/constants";
import { CollectionOptions } from "@bzr/bazaar/dist/types";
import { Game, Player } from "./types";

const options: BazaarOptions = {
  appId: process.env.VUE_APP_APP_ID || "test",
  loginRedirectUri: window.location.origin,
  onApiConnectError: async function (bzr, message) {
    bzr.logOut();
    console.log("Data API connect error", message);
  },
};

// Enable local dev
if (process.env.NODE_ENV === "development") {
  options.bazaarUri = "http://localhost:3377";
}

export const bzr = new BazaarApp(options);

export function usePlayersCollectionName(gameId: string): string {
  return `players_${gameId}`;
}

export const useGamesCollection = (ownerId?: string) => {
  const gamesCollectionOptions: CollectionOptions = {
    onCreate: async () => {
      console.log("onCreate games table");
    },
  };
  return bzr
    .createContext({ ownerId })
    .collection<Game>(GAMES_COLLECTION_NAME, gamesCollectionOptions);
};

export const usePlayersCollection = (gameId: string, ownerId?: string) => {
  const playersCollectionOptions: CollectionOptions = {
    onCreate: async () => console.log("onCreate players table"),
  };
  return bzr
    .createContext({ ownerId })
    .collection<Player>(
      usePlayersCollectionName(gameId),
      playersCollectionOptions
    );
};
