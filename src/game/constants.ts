import { PaletteColors, PaletteKey } from './types';

// Game Boy Native Resolution
export const GB_WIDTH = 160;
export const GB_HEIGHT = 144;

export const PALETTES: Record<PaletteKey, PaletteColors> = {
  dmg: {
    name: '1992 DMG-01 (Pea Soup)',
    lightest: '#9bbc0f',
    light: '#8bac0f',
    dark: '#306230',
    darkest: '#0f380f',
  },
  pocket: {
    name: '1996 Pocket (Monochrome)',
    lightest: '#e0f8d0',
    light: '#88c070',
    dark: '#346856',
    darkest: '#081820',
  },
  sgb: {
    name: 'Super Game Boy (Dream Pastel)',
    lightest: '#fff1e8',
    light: '#ff77a8',
    dark: '#7e2553',
    darkest: '#1d2b53',
  },
  light: {
    name: 'Game Boy Light (Teal Indiglo)',
    lightest: '#5ce6c9',
    light: '#2ea094',
    dark: '#125656',
    darkest: '#062527',
  },
  gbc: {
    name: 'Game Boy Color (Vibrant Retro)',
    lightest: '#fcedbd',
    light: '#61c573',
    dark: '#df4d4d',
    darkest: '#16192e',
  },
};

export const PHYSICS = {
  WALK_SPEED: 1.25,
  FULL_SPEED: 0.85,
  JUMP_POWER: -3.6,
  FULL_JUMP_POWER: -2.9,
  FLY_FLAP_POWER: -1.75,
  GRAVITY_NORMAL: 0.22,
  GRAVITY_FLYING: 0.08,
  MAX_FALL_NORMAL: 3.8,
  MAX_FALL_FLYING: 0.95,
  INHALE_RANGE_X: 38,
  INHALE_RANGE_Y: 20,
  STAR_SPEED: 3.8,
  PUFF_SPEED: 2.2,
};
