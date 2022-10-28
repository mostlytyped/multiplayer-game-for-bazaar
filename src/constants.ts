export const GAMES_TABLE_NAME = "games";

// API error messages
export const NO_READ_PERMISSIONS =
  "No (read) permissions set for this user and this table";

// API error messages regex
export const NO_TABLE_REGEX =
  /Error getting table: Table `.*` does not exist in:/;

// Game
export const PLAYER_SIZE = 2;
export const MOON_SIZE = 20;
export const MIN_PLAYERS = 2;
/**
 * Ticks per second
 */
export const FRAME_RATE = 1;
/**
 * Distance to move per tick
 */
export const GRAVITY_SPEED = 6;
/**
 * Distance to move per 'move' action
 */
export const MOVE_DISTANCE = 2 * GRAVITY_SPEED;
/**
 * Time limit is in ticks
 */
export const TIME_LIMIT = 120;

export const X_UNIT = "vh";
export const Y_UNIT = "vh";

// Grid has bottom-left origin
export const GRID_MIN = 0;
export const GRID_MAX = 100;
