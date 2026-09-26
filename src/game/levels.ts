import { Block, Enemy, Item, LevelGoal } from './types';

export interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  solids: { x: number; y: number; w: number; h: number }[];
  blocks: Block[];
  enemies: Enemy[];
  items: Item[];
  goal: LevelGoal;
  bossArenaX: number; // Camera lock position
}

export function createGreenGreensLevel(): LevelData {
  const width = 1420;
  const height = 144;
  const groundY = 126;

  // Solid terrain platforms
  const solids: { x: number; y: number; w: number; h: number }[] = [
    // Main ground with a few gaps/hills
    { x: 0, y: groundY, w: 320, h: 20 },
    { x: 340, y: groundY, w: 260, h: 20 },
    { x: 620, y: groundY, w: 240, h: 20 },
    { x: 880, y: groundY, w: 540, h: 20 }, // Boss arena ground

    // Tier 1 platforms (gentle hills)
    { x: 80, y: 96, w: 48, h: 14 },
    { x: 180, y: 76, w: 48, h: 14 },
    { x: 250, y: 96, w: 32, h: 30 },

    // High tree trunks & cloud platforms (reward flying)
    { x: 420, y: 78, w: 48, h: 12 },
    { x: 500, y: 52, w: 40, h: 12 }, // Cloud with Maxim Tomato!
    { x: 550, y: 92, w: 32, h: 34 },

    // Ruin & Pillar zone
    { x: 690, y: 84, w: 36, h: 12 },
    { x: 770, y: 64, w: 36, h: 62 }, // Pillar wall

    // Arena boundary wall on right
    { x: 1400, y: 0, w: 20, h: 144 },
  ];

  // Destructible Star Blocks
  const blocks: Block[] = [
    // Stack 1 at x: 130
    { id: 'b1', x: 136, y: 110, w: 16, h: 16, type: 'star', destructible: true },
    { id: 'b2', x: 136, y: 94,  w: 16, h: 16, type: 'star', destructible: true },

    // Barrier at x: 300
    { id: 'b3', x: 296, y: 110, w: 16, h: 16, type: 'star', destructible: true },
    { id: 'b4', x: 296, y: 94,  w: 16, h: 16, type: 'star', destructible: true },

    // Bridge blocks across pit
    { id: 'b5', x: 320, y: 116, w: 16, h: 10, type: 'star', destructible: true },

    // Sky secret blocks
    { id: 'b6', x: 490, y: 52,  w: 10, h: 12, type: 'star', destructible: true },

    // Wall guarding the ruins
    { id: 'b7', x: 740, y: 110, w: 16, h: 16, type: 'star', destructible: true },
    { id: 'b8', x: 740, y: 94,  w: 16, h: 16, type: 'star', destructible: true },
    { id: 'b9', x: 740, y: 78,  w: 16, h: 16, type: 'star', destructible: true },

    // Boss arena pre-gate
    { id: 'b10', x: 910, y: 110, w: 16, h: 16, type: 'star', destructible: true },
    { id: 'b11', x: 910, y: 94,  w: 16, h: 16, type: 'star', destructible: true },
  ];

  // Enemies
  const enemies: Enemy[] = [
    // Section 1: Intro Waddle Dees
    {
      id: 'e1',
      type: 'waddle_dee',
      x: 100,
      y: 82,
      w: 12,
      h: 12,
      vx: -0.45,
      vy: 0,
      facing: -1,
      hp: 1,
      maxHp: 1,
      canInhale: true,
    },
    {
      id: 'e2',
      type: 'waddle_dee',
      x: 220,
      y: 114,
      w: 12,
      h: 12,
      vx: 0.5,
      vy: 0,
      facing: 1,
      hp: 1,
      maxHp: 1,
      canInhale: true,
    },

    // Flying Bronto Burt 1
    {
      id: 'e3',
      type: 'bronto_burt',
      x: 370,
      y: 45,
      w: 12,
      h: 12,
      vx: -0.65,
      vy: 0,
      facing: -1,
      baseY: 45,
      t: 0,
      hp: 1,
      maxHp: 1,
      canInhale: true,
    },

    // Poppy Bros Jr hopping with apples
    {
      id: 'e4',
      type: 'poppy_bros',
      x: 440,
      y: 64,
      w: 12,
      h: 14,
      vx: -0.4,
      vy: 0,
      facing: -1,
      hp: 1,
      maxHp: 1,
      canInhale: true,
      actionTimer: 60,
    },

    // Flying Bronto Burt 2
    {
      id: 'e5',
      type: 'bronto_burt',
      x: 580,
      y: 50,
      w: 12,
      h: 12,
      vx: -0.7,
      vy: 0,
      facing: -1,
      baseY: 50,
      t: 2.5,
      hp: 1,
      maxHp: 1,
      canInhale: true,
    },

    // Gordo (Invulnerable spike ball!)
    {
      id: 'e6',
      type: 'gordo',
      x: 710,
      y: 40,
      w: 14,
      h: 14,
      vx: 0,
      vy: 0.6,
      facing: 1,
      baseY: 60,
      t: 0,
      hp: 999,
      maxHp: 999,
      canInhale: false, // Cannot be inhaled!
    },

    // Ground patrol Waddle Dees
    {
      id: 'e7',
      type: 'waddle_dee',
      x: 820,
      y: 114,
      w: 12,
      h: 12,
      vx: 0.5,
      vy: 0,
      facing: 1,
      hp: 1,
      maxHp: 1,
      canInhale: true,
    },
    {
      id: 'e8',
      type: 'poppy_bros',
      x: 860,
      y: 114,
      w: 12,
      h: 14,
      vx: -0.4,
      vy: 0,
      facing: -1,
      hp: 1,
      maxHp: 1,
      canInhale: true,
      actionTimer: 90,
    },

    // BOSS: Whispy Woods!
    {
      id: 'boss_whispy',
      type: 'whispy_woods',
      x: 1330,
      y: 30,
      w: 48,
      h: 96,
      vx: 0,
      vy: 0,
      facing: -1,
      hp: 6,
      maxHp: 6,
      canInhale: false,
      state: 'idle',
      actionTimer: 80,
    },
  ];

  // Pickable Items
  const items: Item[] = [
    // Secret Maxim Tomato atop clouds
    { id: 'm1', type: 'maxim_tomato', x: 512, y: 38, w: 12, h: 12, collected: false },
    // Energy Apple
    { id: 'a1', type: 'apple', x: 260, y: 82, w: 10, h: 10, collected: false },
    { id: 'a2', type: 'apple', x: 840, y: 114, w: 10, h: 10, collected: false },
  ];

  const goal: LevelGoal = {
    x: 1380,
    y: 84,
    w: 24,
    h: 36,
    unlocked: false,
  };

  return {
    id: 'green_greens',
    name: 'STAGE 1: GREEN GREENS',
    width,
    height,
    solids,
    blocks,
    enemies,
    items,
    goal,
    bossArenaX: 1140, // Camera locks here during boss fight!
  };
}
