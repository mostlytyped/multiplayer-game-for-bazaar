import { PLAYER_SIZE, GRID_MAX, GRID_MIN, MOON_SIZE } from "@/constants";
import { NewGame, Player, Point, Rectangle, Moon, Direction } from "@/types";
import { getMyId } from "@/utils";
import getRandomProjectName from "project-name-generator";
import { useGamesTable } from "@/rethinkid";

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
    moon: useInitMoon(),
  };

  useGamesTable(myId)
    .insert(game)
    .then((response: any) => {
      router.push({
        name: "game",
        params: { userId: myId, gameId: response.data },
      });
    })
    .catch((e: any) => console.error(e.message));
}

function getRandomPlayerName(players: Player[]): string {
  const names = [
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
    "Starbuck",
    "Solo",
    "Maul",
    "Boba",
    "Thor",
    "Loki",
  ];

  // Remove already in use names
  for (const player of players) {
    const index = names.indexOf(player.name);
    if (index > -1) names.splice(index, 1);
  }

  const index = getRandomInt(names.length - 1);

  return names[index];
}

function getSpriteStartPoint(size: number = PLAYER_SIZE): Point {
  // Add padding to avoid touching viewport sides
  const max = GRID_MAX - size * 2;
  const min = GRID_MIN + size;
  const x = getRandomInt(max, min);
  const y = getRandomInt(max, min);

  return { x, y };
}

// Recursive
function getPlayerStartPoint(
  players: Player[],
  moonCoordinates: Point,
  gravityDirection: Direction
): Point {
  const point = getSpriteStartPoint();
  const myRectangle = useGetRectangleFromPoint(point);

  // Make sure my hit box does not overlap with an existing player
  for (const player of players) {
    const rectangle = useGetRectangleFromPoint(player.coordinates);

    // If rectangles overlaps, recursively try again with a new point
    if (useCheckDoRectanglesOverlap(myRectangle, rectangle)) {
      return getPlayerStartPoint(players, moonCoordinates, gravityDirection);
    }
  }

  // Check not on a collision course with the moon
  // (otherwise the player would just bump right into the moon and win)
  if (checkWillCollideWithMoon(point, moonCoordinates, gravityDirection)) {
    return getPlayerStartPoint(players, moonCoordinates, gravityDirection);
  }

  return point;
}

export function useInitMoon(): Moon {
  return {
    coordinates: getSpriteStartPoint(MOON_SIZE),
  };
}

export function useInitPlayer(
  players: Player[],
  gameUserId: string,
  moonCoordinates: Point
): Player {
  const gravityDirection = getGravityDirection(players);
  const coordinates = getPlayerStartPoint(
    players,
    moonCoordinates,
    gravityDirection
  );

  return {
    id: getMyId(),
    name: getRandomPlayerName(players),
    isCreator: getMyId() === gameUserId,
    coordinates,
    gravityDirection,
    combinedMomentum: {
      x: 0,
      y: 0,
    },
    stuckIds: [],
  };
}

function getGravityDirection(players: Player[]): Direction {
  if (players.length === 0) {
    return 0;
  }

  // Tuple: up, right, down, left
  const counts: number[] = [0, 0, 0, 0];

  for (const player of players) {
    counts[player.gravityDirection]++;
  }

  const min = Math.min(...counts);
  const leastUsedDirection = counts.indexOf(min);

  return leastUsedDirection;
}

export function useCheckDoRectanglesOverlap(
  a: Rectangle,
  b: Rectangle
): boolean {
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
  size: number = PLAYER_SIZE
): Rectangle {
  // Set square coordinates
  let x2 = x + size;
  let y2 = y + size;

  // Keep values on the grid
  if (x2 > GRID_MAX) x2 = GRID_MAX;
  if (y2 > GRID_MAX) y2 = GRID_MAX;

  return { x1: x, y1: y, x2, y2 };
}

function checkWillCollideWithMoon(
  playerCoordinates: Point,
  moonCoordinates: Point,
  gravityDirection: Direction
): boolean {
  const p = useGetRectangleFromPoint(playerCoordinates);
  const m = useGetRectangleFromPoint(moonCoordinates, MOON_SIZE);

  let axis = "x";
  if (gravityDirection === 0 || gravityDirection === 2) {
    axis = "y";
  }

  if (axis === "x") {
    if (p.y2 > m.y1 && p.y1 < m.y2) return true;
  } else {
    if (p.x2 > m.x1 && p.x1 < m.x2) return true;
  }

  return false;
}

export function usePlayerName(player: Player) {
  const { id, name } = player;
  return id === getMyId() ? `${name} (me)` : name;
}
