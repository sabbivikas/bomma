
// Game asset types
export type GameAssetType = 'player' | 'enemy' | 'projectile' | 'powerup';

// Movement behavior types
export type MovementBehavior = 'straight' | 'zigzag' | 'seeking';

// Game asset definition
export interface GameAsset {
  id: string;
  name: string;
  type: GameAssetType;
  imageUrl: string;
  properties: {
    speed: number;
    health: number;
    damage: number;
    behavior: MovementBehavior;
  };
}

// Game configuration
export interface GameConfig {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  backgroundColor: string;
  gameSpeed: number;
  playerHealth: number;
}
