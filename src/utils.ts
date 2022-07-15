import { rid } from "@/rethinkid";
import { GAME_TABLE_SUFFIX, PLAYERS_TABLE_SUFFIX } from "@/constants";

export function getMyId(): string {
  const me = rid.userInfo();
  return me && me.id ? me.id : "";
}

export function getGameTableName(gameId: string) {
  return `${gameId}${GAME_TABLE_SUFFIX}`;
}

export function getPlayersTableName(gameId: string) {
  return `${gameId}${PLAYERS_TABLE_SUFFIX}`;
}
