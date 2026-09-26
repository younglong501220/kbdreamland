export type PaletteKey = 'dmg' | 'pocket' | 'sgb' | 'light' | 'gbc';

export interface PaletteColors {
  name: string;
  lightest: string; // Background / Highlights
  light: string;    // Mid-light
  dark: string;     // Mid-dark
  darkest: string;  // Outlines / Text / Shadows
}

export type PlayerState = 'normal' | 'inhaling' | 'full' | 'flying' | 'dancing' | 'hurt';

export type GameScreenState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
}

export interface Player extends Entity {
  facing: 1 | -1;
  state: PlayerState;
  hp: number;
  maxHp: number;
  lives: number;
  score: number;
  grounded: boolean;
  invincibleTimer: number;
  animTick: number;
  mouthContent: 'enemy' | 'star' | null;
  danceTimer: number;
  floatFlapTimer: number;
}

export type EnemyType = 'waddle_dee' | 'bronto_burt' | 'poppy_bros' | 'gordo' | 'whispy_woods';

export interface Enemy extends Entity {
  id: string;
  type: EnemyType;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  baseY?: number;
  t?: number;
  state?: 'idle' | 'walk' | 'attack' | 'hurt' | 'defeated';
  actionTimer?: number;
  canInhale: boolean;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'star' | 'solid';
  destructible: boolean;
}

export interface Projectile {
  id: string;
  type: 'star' | 'puff' | 'apple' | 'whispy_puff' | 'tear';
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  life: number;
  fromPlayer: boolean;
  rotation?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color?: string;
  char?: string;
  size?: number;
}

export interface Item {
  id: string;
  type: 'maxim_tomato' | 'apple' | 'sparkle_star';
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
}

export interface LevelGoal {
  x: number;
  y: number;
  w: number;
  h: number;
  unlocked: boolean;
}
