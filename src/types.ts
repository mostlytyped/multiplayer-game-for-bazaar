export interface Game {
  id: string;
  gameOn: boolean;
}

export interface Player {
  id: string;
  name: string;
  coordinates: Point;
  gravityDirection: Direction;
}

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
