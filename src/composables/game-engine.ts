import { ref } from "vue";
import { Player, GameEngineOptions, Direction } from "@/types";
import {
  PLAYER_SIZE,
  GRID_MAX,
  GRID_MIN,
  MOVE_DISTANCE,
  FRAME_RATE,
  GRAVITY_SPEED,
  MOON_SIZE,
} from "@/constants";
import { getMyId } from "@/utils";
import {
  useCheckDoRectanglesOverlap,
  useGetRectangleFromPoint,
} from "@/composables/game-setup";

export const useAmMoving = ref(false);

const msPerFrame = 1000 / FRAME_RATE;

export class GameEngine {
  id = 0;
  msPerFrame = 1000 / FRAME_RATE;

  gamesTable;
  game;
  playersTable;
  players;

  constructor(options: GameEngineOptions) {
    this.gamesTable = options.gamesTable;
    this.game = options.game;
    this.playersTable = options.playersTable;
    this.players = options.players;
  }

  me(): Player {
    return this.getPlayerById(getMyId());
  }

  start(): void {
    clearInterval(this.id);

    this.id = setInterval(() => this.tick(), this.msPerFrame);
  }

  stop(): void {
    clearInterval(this.id);
  }

  checkPlayersMadeContact(): void {
    const me = this.me();

    const myRectangle = useGetRectangleFromPoint(me.coordinates);

    for (const player of this.players) {
      // Don't make contact with myself
      if (me.id === player.id) continue;

      // Don't stick to a player I'm already stuck to
      if (me.stuckIds.includes(player.id)) continue;

      const rectangle = useGetRectangleFromPoint(player.coordinates);

      if (useCheckDoRectanglesOverlap(myRectangle, rectangle)) {
        me.stuckIds.push(player.id);

        // Add the other player's gravity to my momentum
        const { x, y } = this.gravityDirectionToXY(player.gravityDirection);
        // will only ever add x or y, if x, y is always 0 and vice versa
        me.combinedMomentum.x = me.combinedMomentum.x + x;
        me.combinedMomentum.y = me.combinedMomentum.y + y;

        // Add me to other player as well
        if (!player.stuckIds.includes(me.id)) {
          player.stuckIds.push(me.id);

          // Add my gravity to the player's momentum I just stuck to
          const { x: pX, y: pY } = this.gravityDirectionToXY(
            me.gravityDirection
          );
          player.combinedMomentum.x = player.combinedMomentum.x + pX;
          player.combinedMomentum.y = player.combinedMomentum.y + pY;
        }

        // Update player I touched. My player will update at end of tick
        this.playersTable
          .update(player)
          .catch((e: any) => console.error(e.message));
      }
    }
  }

  updateGame(): void {
    this.gamesTable
      .update(this.game)
      .catch((e: any) => console.error(e.message));
  }

  checkLandedOnMoon(): void {
    const me = this.me();

    const myRectangle = useGetRectangleFromPoint(me.coordinates);
    const moonRectangle = useGetRectangleFromPoint(
      this.game.moon.coordinates,
      MOON_SIZE
    );

    if (useCheckDoRectanglesOverlap(myRectangle, moonRectangle)) {
      this.game.winner = me.name;
      this.game.on = false;
      this.updateGame();
    }
  }

  tick(): void {
    console.log("-- tick");
    const me = this.me();

    this.checkLandedOnMoon();

    this.timer();

    this.checkPlayersMadeContact();

    if (useAmMoving.value) {
      this.move();
    } else {
      this.gravity();
    }

    this.outOfBounds();

    this.playersTable.update(me).catch((e: any) => console.error(e.message));
  }

  timer(): void {
    const me = this.me();

    if (this.game.timeRemaining > 0) this.game.timeRemaining--;

    if (me.isCreator && this.game.timeRemaining < 1) {
      this.game.on = false;
      this.game.over = true;

      this.updateGame();
    }
  }

  gravity(): void {
    const me = this.me();

    const c = me.coordinates;
    const m = me.combinedMomentum;

    const { x, y } = this.gravityDirectionToXY(me.gravityDirection);

    c.y = c.y + (m.y + y) * GRAVITY_SPEED;
    c.x = c.x + (m.x + x) * GRAVITY_SPEED;
  }

  /**
   * Move space ship in the direction opposite their gravity
   */
  move(): void {
    const me = this.me();

    const c = me.coordinates;

    switch (me.gravityDirection) {
      case 0:
        c.y = c.y - MOVE_DISTANCE;
        break;
      case 1:
        c.x = c.x - MOVE_DISTANCE;
        break;
      case 2:
        c.y = c.y + MOVE_DISTANCE;
        break;
      case 3:
        c.x = c.x + MOVE_DISTANCE;
    }
  }

  /**
   * When out of bounds, move to opposite side of screen
   */
  outOfBounds(): void {
    const me = this.me();

    const min = GRID_MIN;
    const max = GRID_MAX;
    const size = PLAYER_SIZE;

    const c = me.coordinates;

    if (c.x <= min - size) c.x = max + size;
    else if (c.x >= max + size) c.x = min - size;
    else if (c.y <= min - size) c.y = max + size;
    else if (c.y >= max + size) c.y = min - size;
  }

  gravityDirectionToXY(direction: Direction): { x: number; y: number } {
    const xy = { x: 0, y: 0 };
    switch (direction) {
      case 0:
        xy.y = 1;
        break;
      case 1:
        xy.x = 1;
        break;
      case 2:
        xy.y = -1;
        break;
      case 3:
        xy.x = -1;
    }
    return xy;
  }

  getPlayerById(id: string): Player {
    const index = this.players.findIndex((p) => p.id === id);
    return this.players[index];
  }
}

export function useMoveMe() {
  useAmMoving.value = true;
  setTimeout(() => (useAmMoving.value = false), msPerFrame);
}
