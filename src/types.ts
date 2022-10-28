import { Table } from "@mostlytyped/rethinkid-js-sdk/dist/types/table";

export interface NewGame {
  name: string;
  moon: Moon;
}

export interface Game {
  id: string;
  name: string;
  moon: Moon;
  on: boolean;
  over: boolean;
  /**
   * Winning player's name
   */
  winner: string;
  paused: boolean;
  starting: boolean;
  timeRemaining: number;
}

export interface Moon {
  coordinates: Point;
}

export interface GameEngineOptions {
  gamesTable: Table;
  game: Game;
  playersTable: Table;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  isCreator: boolean;
  coordinates: Point;
  gravityDirection: Direction;
  combinedMomentum: {
    x: number;
    y: number;
  };
  /**
   * IDs of players this player is stuck to (came into contact with and stuck to)
   */
  stuckIds: string[];
}

/**
 * 0=up, 1=right, 2=down, 3=left
 */
export enum Direction {
  Up, // 0
  Right, // 1
  Down, // 2
  Left, // 3
}

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
