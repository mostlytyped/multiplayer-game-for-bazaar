import { ref } from "vue";
import { Player, Point } from "@/types";
import { PLAYER_SIZE, GRID_MAX, GRID_MIN, GAME_TABLE_NAME } from "@/constants";
import { rid } from "@/rethinkid";
import { getMyId } from "@/utils";

export const useAmMoving = ref(false);

const gameEngineId = ref(0);

export function startGameEngine(
  players: Player[],
  gameId: string,
  gameUserId: string
) {
  clearInterval(gameEngineId.value);

  gameEngineId.value = gameEngine(players, gameId, gameUserId);
}

export function stopGameEngine() {
  clearInterval(gameEngineId.value);
}

const frameRate = 1;
const msPerFrame = 3000 / frameRate;

function gameEngine(players: Player[], gameId: string, gameUserId: string) {
  const createOn = async () => console.log("createOn fired");
  const gamesTable = rid.table(GAME_TABLE_NAME, createOn, {
    userId: gameUserId,
  });

  const myIndex = players.findIndex((p) => p.id === getMyId());
  const me = players[myIndex];

  const c = me.coordinates;

  return setInterval(() => {
    console.log("-- tick");

    if (useAmMoving.value) {
      move(me);
    } else {
      gravity(me);
    }

    outOfBounds(c);

    // Commit current, try do players by ID, if not revert and fetch and update

    gamesTable.update({ id: gameId, players: { `${playerId}`: value }}).catch((e: any) => console.error(e.message));
  }, msPerFrame);
}

function gravity(player: Player) {
  const c = player.coordinates;

  switch (player.gravityDirection) {
    case 0:
      c.y++;
      break;
    case 1:
      c.x++;
      break;
    case 2:
      c.y--;
      break;
    case 3:
      c.x--;
  }
}

export function useMoveMe() {
  useAmMoving.value = true;
  setTimeout(() => (useAmMoving.value = false), msPerFrame);
}

function move(player: Player) {
  const c = player.coordinates;

  const step = 10;
  switch (player.gravityDirection) {
    case 0:
      c.y = c.y - step;
      break;
    case 1:
      c.x = c.x - step;
      break;
    case 2:
      c.y = c.y + step;
      break;
    case 3:
      c.x = c.x + step;
  }
}

/**
 * When out of bounds, move to opposite side of screen
 * @param c coordinates
 */
function outOfBounds(c: Point) {
  const min = GRID_MIN;
  const max = GRID_MAX;
  const size = PLAYER_SIZE;

  if (c.x <= min - size) c.x = max + size;
  else if (c.x >= max + size) c.x = min - size;
  else if (c.y <= min - size) c.y = max + size;
  else if (c.y >= max + size) c.y = min - size;
}
