import { GAME_TABLE_NAME, PLAYER_SIZE, GRID_MAX, GRID_MIN } from "@/constants";
import { Direction, NewGame, Player, Point, Rectangle } from "@/types";
import { getMyId } from "@/utils";
import getRandomProjectName from "project-name-generator";
import { rid } from "@/rethinkid";

export function usePlayerExistsInState(players: Player[], playerId: string) {
  return players.some((p) => p.id === playerId);
}

export function useUpdatePlayerInState(players: Player[], player: Player) {
  const index = players.findIndex((p) => p.id === player.id);
  players[index] = player;
}

/**
 * Get a random integer between a max and min value. min default is 0
 */
function getRandomInt(max: number, min = 0) {
  const range = max - min + 1; // + 1 to include max as possible result
  return Math.floor(Math.random() * range + min);
}

export function useCreateAndGoToGame(router: any): void {
  const myId = getMyId();

  const game: NewGame = {
    name: getRandomProjectName().dashed,
  };

  const gamesTable = rid.table(GAME_TABLE_NAME, async () => {
    console.log("Table onCreate callback fired!");
  });

  // probably want to export the table from a module.
  // or maybe not, here this is my ID, on GameView, it's the gameUserId
  // maybe just use tableInsert. Or maybe we don't even use tables for games. Probably we have a 'games' table with 'game' objects
  // players should be in game doc
  // game object broadcasts group movements, is the game server effectively

  gamesTable
    .insert(game)
    .then((response) => {
      console.log("response", response);
      console.log("response.data", response.data);
      router.push({
        name: "game",
        params: { userId: myId, gameId: response.data },
      });
    })
    .catch((e: any) => console.error(e.message));
}

function getRandomPlayerName(): string {
  const playerNames = [
    "Luke",
    "C3PO",
    "R2D2",
    "Vader",
    "Leia",
    "Lars",
    "Beru",
    "R5D4",
    "Biggs",
    "Obi",
    "Ender",
    "Hiro",
    "YT",
    "Han",
    "Solo",
    "Maul",
    "Boba",
    "Thor",
    "Loki",
  ];

  const index = getRandomInt(playerNames.length - 1);

  return playerNames[index];
}

// Temp func, will delete
// function genQuickPlayer(players: Player[], index: number): Player {
//   return {
//     id: getRandomProjectName().dashed,
//     name: getRandomPlayerName(),
//     coordinates: getPlayerStartPointNoOverlap(players),
//     gravityDirection: getGravityDirection(index),
//   };
// }

function getPlayerStartPoint(): Point {
  // Add padding to avoid touching viewport sides
  const max = GRID_MAX - PLAYER_SIZE * 2;
  const min = GRID_MIN + PLAYER_SIZE;
  const x = getRandomInt(max, min);
  const y = getRandomInt(max, min);

  return { x, y };
}

// Recursive
function getPlayerStartPointNoOverlap(players: Player[]): Point {
  const point = getPlayerStartPoint();
  const myRectangle = useGetRectangleFromPoint(point, PLAYER_SIZE);

  // Make sure my hit box does not overlap with an existing player
  for (const id in players) {
    const rectangle = useGetRectangleFromPoint(
      players[id].coordinates,
      PLAYER_SIZE
    );

    // If rectangles overlaps, recursively try again with a new point
    if (checkDoRectanglesOverlap(myRectangle, rectangle)) {
      // console.log("overlap: ", player.id);
      return getPlayerStartPointNoOverlap(players);
    }
  }

  return point;
}

export function useInitPlayer(players: Player[]): Player {
  // Temp add extra players
  // for (let i = 0; i < 20; i++) {
  //   players.push(genQuickPlayer(players, i));
  // }

  const coordinates = getPlayerStartPointNoOverlap(players);

  const index = Object.keys(players).length;

  return {
    id: getMyId(),
    name: getRandomPlayerName(),
    coordinates,
    gravityDirection: getGravityDirection(index),
  };
}

function getGravityDirection(index: number): number {
  // Numeric enum has keys for numbers and member names,
  // so two keys per direction, hence we want half of the
  // keys to get the number of directions
  const numberOfDirections = Object.keys(Direction).length / 2;

  // Assign index evenly according to player index
  return index % numberOfDirections;
}

function checkDoRectanglesOverlap(a: Rectangle, b: Rectangle): boolean {
  // if beside each other
  if (a.x2 < b.x1 || b.x2 < a.x1) return false;

  // if on top of each other
  if (a.y2 < b.y1 || b.y2 < a.y1) return false;

  return true;
}

/**
 * Get a square from a bottom-left origin point
 * If x2 or y2 are greater than grid max, shape will be a rectangle
 * @param param0 point. Values should be on the grid
 * @param size height and width of square
 */
export function useGetRectangleFromPoint(
  { x, y }: Point,
  size: number
): Rectangle {
  // Set square coordinates
  let x2 = x + size;
  let y2 = y + size;

  // Keep values on the grid
  if (x2 > GRID_MAX) x2 = GRID_MAX;
  if (y2 > GRID_MAX) y2 = GRID_MAX;

  return { x1: x, y1: y, x2, y2 };
}

export function usePlayerName(player: Player) {
  const { id, name } = player;
  return id === getMyId() ? `${name} (me)` : name;
}
