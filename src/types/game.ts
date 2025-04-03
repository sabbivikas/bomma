
// Game asset types
export type GameAssetType = 'player' | 'enemy' | 'projectile' | 'powerup';

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
    behavior: 'straight' | 'zigzag' | 'seeking';
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
