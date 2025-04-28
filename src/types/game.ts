
export interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  type: string;
  size: number;
}

export interface PlayerPosition {
  x: number;
  y: number;
}
