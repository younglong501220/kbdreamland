import { audio } from './audio';
import { GB_HEIGHT, GB_WIDTH, PALETTES, PHYSICS } from './constants';
import { createGreenGreensLevel, LevelData } from './levels';
import {
  Block,
  Enemy,
  GameScreenState,
  Item,
  PaletteColors,
  PaletteKey,
  Particle,
  Player,
  Projectile,
} from './types';

export class KirbyEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  state: GameScreenState = 'TITLE';
  paletteKey: PaletteKey = 'dmg';
  palette: PaletteColors = PALETTES.dmg;
  showScanlines: boolean = false;

  level!: LevelData;
  player!: Player;
  projectiles: Projectile[] = [];
  particles: Particle[] = [];

  camX: number = 0;
  bossActive: boolean = false;
  bossDefeated: boolean = false;
  highScore: number = 0;

  // Input states
  keys: Record<string, boolean> = {};
  jumpPressedPrev: boolean = false;
  actionPressedPrev: boolean = false;
  pausePressedPrev: boolean = false;

  // External state listener for React UI synchronization
  onStateChange?: (stats: {
    hp: number;
    score: number;
    lives: number;
    state: GameScreenState;
    bossHp?: number;
    bossActive: boolean;
  }) => void;

  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Load highscore
    try {
      const saved = localStorage.getItem('kirby_gb_high_score');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      // Ignored
    }

    this.initGame();
  }

  setPalette(key: PaletteKey) {
    this.paletteKey = key;
    this.palette = PALETTES[key] || PALETTES.dmg;
  }

  setScanlines(enabled: boolean) {
    this.showScanlines = enabled;
  }

  initGame() {
    this.level = createGreenGreensLevel();
    this.player = {
      x: 28,
      y: 104,
      w: 14,
      h: 14,
      vx: 0,
      vy: 0,
      facing: 1,
      state: 'normal',
      hp: 6,
      maxHp: 6,
      lives: 2,
      score: 0,
      grounded: true,
      invincibleTimer: 0,
      animTick: 0,
      mouthContent: null,
      danceTimer: 0,
      floatFlapTimer: 0,
    };
    this.projectiles = [];
    this.particles = [];
    this.camX = 0;
    this.bossActive = false;
    this.bossDefeated = false;
    this.state = 'TITLE';
    this.notifyState();
  }

  startPlay() {
    audio.init();
    audio.resume();
    audio.startBGM();
    this.state = 'PLAYING';
    this.notifyState();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      audio.stopBGM();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      audio.startBGM();
    }
    this.notifyState();
  }

  restart() {
    const score = this.player?.score || 0;
    if (score > this.highScore) {
      this.highScore = score;
      try {
        localStorage.setItem('kirby_gb_high_score', score.toString());
      } catch {
        // Ignored
      }
    }
    this.initGame();
    this.startPlay();
  }

  private notifyState() {
    if (this.onStateChange) {
      const boss = this.level?.enemies?.find((e) => e.type === 'whispy_woods');
      this.onStateChange({
        hp: this.player?.hp ?? 6,
        score: this.player?.score ?? 0,
        lives: this.player?.lives ?? 2,
        state: this.state,
        bossHp: boss ? boss.hp : undefined,
        bossActive: this.bossActive,
      });
    }
  }

  // --- Input handling ---
  handleKeyDown(key: string) {
    audio.init();
    const k = key.toLowerCase();
    this.keys[k] = true;
    this.keys[key] = true;
  }

  handleKeyUp(key: string) {
    const k = key.toLowerCase();
    this.keys[k] = false;
    this.keys[key] = false;
  }

  setVirtualInput(action: 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'start' | 'select', pressed: boolean) {
    audio.init();
    if (action === 'left') this.keys['arrowleft'] = pressed;
    if (action === 'right') this.keys['arrowright'] = pressed;
    if (action === 'up') this.keys['arrowup'] = pressed;
    if (action === 'down') this.keys['arrowdown'] = pressed;
    if (action === 'a') this.keys[' '] = pressed; // Jump / Fly
    if (action === 'b') this.keys['x'] = pressed; // Action: Inhale / Spit
    if (action === 'start') this.keys['enter'] = pressed;
  }

  // --- Main Update ---
  update() {
    if (this.state === 'PAUSED') return;

    if (this.state === 'TITLE') {
      const enter = this.keys['enter'] || this.keys[' '] || this.keys['x'] || this.keys['z'];
      if (enter && !this.pausePressedPrev) {
        this.startPlay();
      }
      this.pausePressedPrev = !!enter;
      return;
    }

    if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
      const enter = this.keys['enter'] || this.keys[' '] || this.keys['x'] || this.keys['z'];
      if (enter && !this.pausePressedPrev) {
        this.restart();
      }
      this.pausePressedPrev = !!enter;

      if (this.state === 'VICTORY' && this.player) {
        this.player.animTick++;
        this.player.danceTimer++;
        // Spawn victory confetti stars
        if (Math.random() < 0.2) {
          this.particles.push({
            x: this.player.x + Math.random() * 20 - 5,
            y: this.player.y - 10 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2,
            life: 25,
            maxLife: 25,
            char: '★',
          });
        }
      }
      return;
    }

    // Pause toggle
    const pauseKey = this.keys['enter'] || this.keys['p'] || this.keys['escape'];
    if (pauseKey && !this.pausePressedPrev) {
      this.togglePause();
      this.pausePressedPrev = true;
      return;
    }
    this.pausePressedPrev = !!pauseKey;

    const p = this.player;
    p.animTick++;
    if (p.invincibleTimer > 0) p.invincibleTimer--;

    // Read Movement Keys
    const left = this.keys['arrowleft'] || this.keys['a'];
    const right = this.keys['arrowright'] || this.keys['d'];
    const up = this.keys['arrowup'] || this.keys['w'] || this.keys[' '];
    const down = this.keys['arrowdown'] || this.keys['s'];
    const action = this.keys['x'] || this.keys['j'] || this.keys['z'];

    const jumpTrigger = up && !this.jumpPressedPrev;
    this.jumpPressedPrev = !!up;
    const actionTrigger = action && !this.actionPressedPrev;
    this.actionPressedPrev = !!action;

    // 1. Horizontal Movement
    const speed = p.state === 'full' ? PHYSICS.FULL_SPEED : PHYSICS.WALK_SPEED;
    if (left) {
      p.vx = -speed;
      p.facing = -1;
    } else if (right) {
      p.vx = speed;
      p.facing = 1;
    } else {
      p.vx = 0;
    }

    // 2. Action & State Machine
    if (p.state === 'normal') {
      // Inhaling (Hold Action)
      if (action) {
        p.state = 'inhaling';
        audio.startInhaleLoop();
      } else {
        audio.stopInhaleLoop();
      }

      // Jump or Fly
      if (jumpTrigger) {
        if (p.grounded) {
          p.vy = PHYSICS.JUMP_POWER;
          p.grounded = false;
          audio.playJump();
        } else {
          // Mid-air jump => Inhale air & take flight!
          p.state = 'flying';
          p.vy = PHYSICS.FLY_FLAP_POWER;
          audio.playFly();
        }
      }
    } else if (p.state === 'inhaling') {
      if (!action) {
        p.state = 'normal';
        audio.stopInhaleLoop();
      } else {
        // Suction hitbox in front of Kirby
        const suctionBox = {
          x: p.facing === 1 ? p.x + p.w : p.x - PHYSICS.INHALE_RANGE_X,
          y: p.y - 4,
          w: PHYSICS.INHALE_RANGE_X,
          h: p.h + 8,
        };

        // Suction Wind Particles
        if (Math.random() < 0.6) {
          this.particles.push({
            x: suctionBox.x + (p.facing === 1 ? suctionBox.w : 0),
            y: suctionBox.y + Math.random() * suctionBox.h,
            vx: p.facing * -2.8,
            vy: (Math.random() - 0.5) * 0.8,
            life: 14,
            maxLife: 14,
          });
        }

        // Pull and swallow enemies
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
          const e = this.level.enemies[i];
          if (!e.canInhale) continue;

          if (this.checkAABB(suctionBox, e)) {
            // Drag toward Kirby's mouth
            e.x += (p.x - e.x) * 0.28;
            e.y += (p.y - e.y) * 0.28;

            if (Math.abs(e.x - p.x) < 8) {
              this.level.enemies.splice(i, 1);
              p.state = 'full';
              p.mouthContent = 'enemy';
              audio.playSwallow();
              break;
            }
          }
        }

        // Pull and swallow projectile apples dropped by Whispy Woods or Poppy
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
          const proj = this.projectiles[i];
          if (proj.type === 'apple' && this.checkAABB(suctionBox, proj)) {
            proj.x += (p.x - proj.x) * 0.35;
            proj.y += (p.y - proj.y) * 0.35;
            if (Math.abs(proj.x - p.x) < 10) {
              this.projectiles.splice(i, 1);
              p.state = 'full';
              p.mouthContent = 'star';
              audio.playSwallow();
              break;
            }
          }
        }
      }
    } else if (p.state === 'full') {
      audio.stopInhaleLoop();

      // Jump while full is heavier
      if (jumpTrigger && p.grounded) {
        p.vy = PHYSICS.FULL_JUMP_POWER;
        p.grounded = false;
        audio.playJump();
      }

      // Spit out STAR projectile!
      if (actionTrigger) {
        p.state = 'normal';
        p.mouthContent = null;
        audio.playSpitStar();
        this.projectiles.push({
          id: `star_${Date.now()}_${Math.random()}`,
          type: 'star',
          x: p.facing === 1 ? p.x + p.w + 2 : p.x - 12,
          y: p.y + 1,
          w: 10,
          h: 10,
          vx: p.facing * PHYSICS.STAR_SPEED,
          vy: 0,
          life: 140,
          fromPlayer: true,
          rotation: 0,
        });

        // Spit recoil particles
        for (let k = 0; k < 4; k++) {
          this.particles.push({
            x: p.x + 7,
            y: p.y + 7,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 10,
            maxLife: 10,
          });
        }
      }

      // Press Down / S to swallow and digest!
      if (down) {
        p.state = 'normal';
        p.mouthContent = null;
        p.score += 200;
        if (p.hp < p.maxHp) p.hp++;
        audio.playSwallow();
        for (let k = 0; k < 5; k++) {
          this.particles.push({
            x: p.x + 7,
            y: p.y + 7,
            vx: (Math.random() - 0.5) * 1.8,
            vy: -Math.random() * 2,
            life: 15,
            maxLife: 15,
            char: '♥',
          });
        }
      }
    } else if (p.state === 'flying') {
      audio.stopInhaleLoop();

      // Flap wings to elevate
      if (jumpTrigger) {
        p.vy = PHYSICS.FLY_FLAP_POWER;
        p.floatFlapTimer = 12;
        audio.playFly();
      }

      // Spit out Air Puff and cancel flight
      if (actionTrigger) {
        p.state = 'normal';
        audio.playSpitPuff();
        this.projectiles.push({
          id: `puff_${Date.now()}_${Math.random()}`,
          type: 'puff',
          x: p.facing === 1 ? p.x + p.w + 1 : p.x - 9,
          y: p.y + 3,
          w: 8,
          h: 8,
          vx: p.facing * PHYSICS.PUFF_SPEED,
          vy: 0,
          life: 30,
          fromPlayer: true,
        });
      }
    }

    // 3. Gravity and Physics Integration
    const gravity = p.state === 'flying' ? PHYSICS.GRAVITY_FLYING : PHYSICS.GRAVITY_NORMAL;
    const maxFall = p.state === 'flying' ? PHYSICS.MAX_FALL_FLYING : PHYSICS.MAX_FALL_NORMAL;
    p.vy = Math.min(p.vy + gravity, maxFall);

    // X collision
    p.x += p.vx;
    this.resolveMapCollision(p);

    // Y collision
    p.grounded = false;
    p.y += p.vy;
    this.resolveMapCollision(p);

    // Land on ground stops flight
    if (p.grounded && p.state === 'flying') {
      p.state = 'normal';
    }

    // Boundary check
    if (p.x < 4) p.x = 4;
    if (p.x > this.level.width - 24) p.x = this.level.width - 24;

    // Pit Fall Death
    if (p.y > GB_HEIGHT + 10) {
      p.hp = 0;
      audio.playHit();
      this.handlePlayerDeath();
      return;
    }

    // 4. Camera Follow
    if (p.x >= this.level.bossArenaX) {
      this.bossActive = true;
      // Lock camera to boss arena
      const targetCamX = this.level.bossArenaX;
      this.camX += (targetCamX - this.camX) * 0.15;
    } else {
      const targetCamX = Math.max(0, Math.min(p.x - 72, this.level.width - GB_WIDTH));
      this.camX += (targetCamX - this.camX) * 0.18;
    }

    // 5. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      if (proj.rotation !== undefined) {
        proj.rotation += 0.3;
      }

      // Star / Puff vs Blocks
      if (proj.fromPlayer) {
        for (let b = this.level.blocks.length - 1; b >= 0; b--) {
          const block = this.level.blocks[b];
          if (block.destructible && this.checkAABB(proj, block)) {
            this.level.blocks.splice(b, 1);
            p.score += 100;
            audio.playBreakBlock();

            // Block explosion debris
            for (let d = 0; d < 6; d++) {
              this.particles.push({
                x: block.x + 8,
                y: block.y + 8,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                life: 14,
                maxLife: 14,
              });
            }

            if (proj.type === 'puff') proj.life = 0;
            break;
          }
        }
      }

      // Projectiles vs Enemies
      for (let eIdx = this.level.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = this.level.enemies[eIdx];
        if (proj.fromPlayer && this.checkAABB(proj, enemy)) {
          if (enemy.type === 'gordo') {
            // Gordo reflects or destroys projectile
            proj.life = 0;
            audio.playHit();
            break;
          }

          enemy.hp -= proj.type === 'star' ? 2 : 1;
          audio.playHit();

          if (enemy.hp <= 0) {
            if (enemy.type === 'whispy_woods') {
              this.defeatBoss(enemy);
            } else {
              this.level.enemies.splice(eIdx, 1);
              p.score += 400;
            }
          }

          // Stars pierce regular enemies; puffs vanish on hit
          if (proj.type === 'puff' || enemy.type === 'whispy_woods') {
            proj.life = 0;
          }
          break;
        }
      }

      // Enemy Projectiles vs Kirby (e.g. Whispy Puffs, dropped Apples)
      if (!proj.fromPlayer && p.invincibleTimer === 0 && this.checkAABB(proj, p)) {
        this.hurtPlayer();
        proj.life = 0;
      }

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // 6. Update Enemies
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      const enemy = this.level.enemies[i];

      if (enemy.type === 'waddle_dee') {
        enemy.x += enemy.vx;
        enemy.vy = Math.min(enemy.vy + 0.2, 3);
        enemy.y += enemy.vy;

        // Ground check
        if (enemy.y > 114) {
          enemy.y = 114;
          enemy.vy = 0;
        }
        // Patrol turnaround
        if (enemy.x < 10 || enemy.x > this.level.width - 20) {
          enemy.vx *= -1;
          enemy.facing = enemy.vx > 0 ? 1 : -1;
        }
      } else if (enemy.type === 'bronto_burt') {
        enemy.t = (enemy.t || 0) + 0.06;
        enemy.x += enemy.vx;
        enemy.y = (enemy.baseY || 40) + Math.sin(enemy.t) * 16;
        if (enemy.x < 20 || enemy.x > this.level.width - 30) enemy.vx *= -1;
      } else if (enemy.type === 'poppy_bros') {
        enemy.actionTimer = (enemy.actionTimer || 60) - 1;
        if (enemy.actionTimer <= 0) {
          enemy.actionTimer = 90;
          // Toss an apple towards player
          this.projectiles.push({
            id: `apple_${Date.now()}_${Math.random()}`,
            type: 'apple',
            x: enemy.x - 4,
            y: enemy.y - 2,
            w: 8,
            h: 8,
            vx: -1.2,
            vy: -1.8,
            life: 160,
            fromPlayer: false,
          });
        }
      } else if (enemy.type === 'gordo') {
        enemy.t = (enemy.t || 0) + 0.05;
        enemy.y = (enemy.baseY || 60) + Math.sin(enemy.t) * 28;
      } else if (enemy.type === 'whispy_woods') {
        this.updateWhispyWoods(enemy);
      }

      // Enemy Collision with Kirby
      if (p.invincibleTimer === 0 && this.checkAABB(p, enemy)) {
        this.hurtPlayer();
      }
    }

    // 7. Update Pickable Items
    for (const item of this.level.items) {
      if (!item.collected && this.checkAABB(p, item)) {
        item.collected = true;
        if (item.type === 'maxim_tomato') {
          p.hp = p.maxHp;
          p.score += 1000;
          audio.playItem();
        } else if (item.type === 'apple') {
          p.hp = Math.min(p.maxHp, p.hp + 2);
          p.score += 300;
          audio.playItem();
        } else if (item.type === 'sparkle_star') {
          this.triggerVictory();
        }
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
      if (part.life <= 0) this.particles.splice(i, 1);
    }

    this.notifyState();
  }

  // --- Boss: Whispy Woods AI ---
  private updateWhispyWoods(boss: Enemy) {
    if (!this.bossActive || this.bossDefeated) return;

    boss.actionTimer = (boss.actionTimer || 80) - 1;

    // Routine attack cycle: Puff air, or shake canopy to drop apples!
    if (boss.actionTimer <= 0) {
      boss.actionTimer = 85 + Math.floor(Math.random() * 30);
      const attackType = Math.random() < 0.5 ? 'puff' : 'apples';

      if (attackType === 'puff') {
        // Blow air puffs across arena
        audio.playWhispyGust();
        this.projectiles.push({
          id: `whispy_puff_${Date.now()}`,
          type: 'whispy_puff',
          x: boss.x - 8,
          y: boss.y + 40,
          w: 12,
          h: 12,
          vx: -2.3,
          vy: 0,
          life: 140,
          fromPlayer: false,
        });
      } else {
        // Shake canopy: drop 2 apples from above
        for (let i = 0; i < 2; i++) {
          const dropX = boss.x - 20 - i * 36 - Math.random() * 20;
          this.projectiles.push({
            id: `whispy_apple_${Date.now()}_${i}`,
            type: 'apple',
            x: dropX,
            y: boss.y + 10,
            w: 8,
            h: 8,
            vx: -0.3,
            vy: 1.8,
            life: 200,
            fromPlayer: false,
          });
        }
      }
    }
  }

  private defeatBoss(boss: Enemy) {
    this.bossDefeated = true;
    this.player.score += 5000;
    audio.playStageClear();

    // Drop comic tear particles from Whispy's eyes
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: boss.x + 8,
        y: boss.y + 35,
        vx: -Math.random() * 1.5,
        vy: Math.random() * 2,
        life: 40 + i * 4,
        maxLife: 40 + i * 4,
        color: this.palette.light,
      });
    }

    // Spawn the giant Sparkling Star at the center of the arena
    this.level.items.push({
      id: 'warp_star',
      type: 'sparkle_star',
      x: boss.x - 55,
      y: 92,
      w: 16,
      h: 16,
      collected: false,
    });
  }

  private triggerVictory() {
    this.state = 'VICTORY';
    this.player.state = 'dancing';
    audio.playStageClear();
    this.notifyState();
  }

  private hurtPlayer() {
    const p = this.player;
    p.hp--;
    p.invincibleTimer = 60; // 1 second of invulnerability
    p.vy = -2.6;
    p.vx = -p.facing * 2.2;
    audio.playHit();

    if (p.state === 'flying' || p.state === 'full') {
      p.state = 'normal';
      p.mouthContent = null;
    }

    if (p.hp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    const p = this.player;
    p.lives--;
    audio.playGameOver();

    if (p.lives < 0) {
      this.state = 'GAME_OVER';
    } else {
      // Respawn at section checkpoint
      p.hp = p.maxHp;
      p.x = Math.max(28, this.camX + 20);
      p.y = 80;
      p.vx = 0;
      p.vy = 0;
      p.state = 'normal';
      p.invincibleTimer = 90;
    }
    this.notifyState();
  }

  // --- Collision helper ---
  checkAABB(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private resolveMapCollision(entity: Player) {
    const allSolids = [...this.level.solids, ...this.level.blocks];

    for (const s of allSolids) {
      if (this.checkAABB(entity, s)) {
        // Vertical collision
        if (entity.vy > 0 && entity.y + entity.h - entity.vy <= s.y + 4) {
          entity.y = s.y - entity.h;
          entity.vy = 0;
          entity.grounded = true;
        } else if (entity.vy < 0 && entity.y - entity.vy >= s.y + s.h - 4) {
          entity.y = s.y + s.h;
          entity.vy = 0;
        }
        // Horizontal collision
        else if (entity.vx > 0 && entity.x + entity.w - entity.vx <= s.x + 4) {
          entity.x = s.x - entity.w;
          entity.vx = 0;
        } else if (entity.vx < 0 && entity.x - entity.vx >= s.x + s.w - 4) {
          entity.x = s.x + s.w;
          entity.vx = 0;
        }
      }
    }
  }

  // --- Rendering ---
  render() {
    const ctx = this.ctx;
    const pal = this.palette;

    // Fill screen with background
    ctx.fillStyle = pal.lightest;
    ctx.fillRect(0, 0, GB_WIDTH, GB_HEIGHT);

    if (this.state === 'TITLE') {
      this.renderTitleScreen();
      return;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.camX), 0);

    // 1. Parallax Distant Hills & Clouds
    this.renderBackground();

    // 2. Terrain & Blocks
    this.renderTerrain();

    // 3. Items
    this.renderItems();

    // 4. Projectiles
    this.renderProjectiles();

    // 5. Enemies & Whispy Woods
    this.renderEnemies();

    // 6. Kirby
    this.renderKirby();

    // 7. Particles
    this.renderParticles();

    ctx.restore();

    // 8. Game Boy HUD Bar (Bottom 16px)
    this.renderHUD();

    // 9. Overlay Screens (Victory / Game Over / Pause)
    if (this.state === 'PAUSED') {
      this.renderPauseOverlay();
    } else if (this.state === 'VICTORY') {
      this.renderVictoryOverlay();
    } else if (this.state === 'GAME_OVER') {
      this.renderGameOverOverlay();
    }

    // 10. Optional LCD Dot Matrix / Scanline shader simulation
    if (this.showScanlines) {
      this.renderScanlines();
    }
  }

  private renderBackground() {
    const ctx = this.ctx;
    const pal = this.palette;

    // Soft rolling hills (draw at 0.4x parallax)
    const hillParallax = this.camX * 0.4;
    ctx.fillStyle = pal.light;

    for (let x = -60; x < this.level.width + 100; x += 120) {
      ctx.beginPath();
      ctx.arc(x - hillParallax, 115, 40, Math.PI, 0);
      ctx.fill();
    }

    // Fluffy clouds
    ctx.fillStyle = pal.light;
    const clouds = [
      { x: 50, y: 25, r: 12 },
      { x: 190, y: 18, r: 16 },
      { x: 340, y: 28, r: 14 },
      { x: 520, y: 20, r: 15 },
      { x: 740, y: 24, r: 14 },
      { x: 920, y: 16, r: 18 },
      { x: 1100, y: 22, r: 14 },
      { x: 1280, y: 18, r: 16 },
    ];
    for (const c of clouds) {
      const cx = c.x - this.camX * 0.2;
      ctx.beginPath();
      ctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
      ctx.arc(cx + c.r * 0.7, c.y + 2, c.r * 0.8, 0, Math.PI * 2);
      ctx.arc(cx - c.r * 0.7, c.y + 2, c.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderTerrain() {
    const ctx = this.ctx;
    const pal = this.palette;

    // Solids
    ctx.fillStyle = pal.dark;
    ctx.strokeStyle = pal.darkest;
    ctx.lineWidth = 1;

    for (const s of this.level.solids) {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);

      // Light grassy top edge
      ctx.fillStyle = pal.lightest;
      ctx.fillRect(s.x, s.y, s.w, 2);
      // Small decorative grass tufts
      ctx.fillStyle = pal.darkest;
      for (let tx = s.x + 4; tx < s.x + s.w - 4; tx += 12) {
        ctx.fillRect(tx, s.y - 1, 1, 1);
        ctx.fillRect(tx + 1, s.y - 2, 1, 2);
      }
      ctx.fillStyle = pal.dark;
    }

    // Star Blocks
    for (const b of this.level.blocks) {
      ctx.fillStyle = pal.light;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = pal.darkest;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

      // 1992 Star Block Motif: Center 5-pointed star
      ctx.fillStyle = pal.darkest;
      // Cross
      ctx.fillRect(b.x + 6, b.y + 3, 4, 10);
      ctx.fillRect(b.x + 3, b.y + 6, 10, 4);
      // Corner pixels
      ctx.fillRect(b.x + 4, b.y + 4, 1, 1);
      ctx.fillRect(b.x + 11, b.y + 4, 1, 1);
      ctx.fillRect(b.x + 4, b.y + 11, 1, 1);
      ctx.fillRect(b.x + 11, b.y + 11, 1, 1);

      // Inner highlight
      ctx.fillStyle = pal.lightest;
      ctx.fillRect(b.x + 7, b.y + 7, 2, 2);
    }
  }

  private renderItems() {
    const ctx = this.ctx;
    const pal = this.palette;

    for (const item of this.level.items) {
      if (item.collected) continue;

      if (item.type === 'maxim_tomato') {
        // Iconic Maxim Tomato: Round red/dark tomato with 'M' letter
        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(item.x + 6, item.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.darkest;
        ctx.stroke();

        // Green leaves at top
        ctx.fillStyle = pal.light;
        ctx.fillRect(item.x + 5, item.y - 1, 2, 2);
        ctx.fillRect(item.x + 3, item.y, 6, 1);

        // 'M' imprint in center
        ctx.fillStyle = pal.lightest;
        ctx.font = '7px monospace';
        ctx.fillText('M', item.x + 3.5, item.y + 9);
      } else if (item.type === 'apple') {
        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(item.x + 5, item.y + 5, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(item.x + 4, item.y - 2, 1, 2);
        ctx.fillStyle = pal.lightest;
        ctx.fillRect(item.x + 3, item.y + 3, 2, 2);
      } else if (item.type === 'sparkle_star') {
        // Victory Warp Star: Sparkling 5-point star
        const floatY = item.y + Math.sin(this.player.animTick * 0.1) * 3;
        ctx.fillStyle = pal.darkest;
        ctx.beginPath();
        ctx.arc(item.x + 8, floatY + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = pal.lightest;
        ctx.fillRect(item.x + 6, floatY + 2, 4, 12);
        ctx.fillRect(item.x + 2, floatY + 6, 12, 4);

        ctx.fillStyle = pal.light;
        ctx.fillRect(item.x + 7, floatY + 7, 2, 2);
      }
    }
  }

  private renderProjectiles() {
    const ctx = this.ctx;
    const pal = this.palette;

    for (const p of this.projectiles) {
      if (p.type === 'star') {
        // Rotating Star Projectile
        ctx.save();
        ctx.translate(p.x + 5, p.y + 5);
        if (p.rotation) ctx.rotate(p.rotation);

        ctx.fillStyle = pal.darkest;
        ctx.fillRect(-5, -2, 10, 4);
        ctx.fillRect(-2, -5, 4, 10);
        ctx.fillStyle = pal.lightest;
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
      } else if (p.type === 'puff') {
        // Air Puff
        ctx.fillStyle = pal.lightest;
        ctx.strokeStyle = pal.darkest;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x + 4, p.y + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'apple') {
        // Dropped Apple
        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(p.x + 4, p.y + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(p.x + 3, p.y - 1, 1, 2);
      } else if (p.type === 'whispy_puff') {
        // Whispy Woods Wind Gust (Large spinning puff)
        ctx.fillStyle = pal.light;
        ctx.strokeStyle = pal.darkest;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x + 6, p.y + 6, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(p.x + 4, p.y + 4, 3, 3);
      }
    }
  }

  private renderEnemies() {
    const ctx = this.ctx;
    const pal = this.palette;

    for (const e of this.level.enemies) {
      if (e.type === 'waddle_dee') {
        // Waddle Dee
        const cx = e.x + e.w / 2;
        const cy = e.y + e.h / 2;

        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.darkest;
        ctx.stroke();

        // Face / Eyes
        ctx.fillStyle = pal.lightest;
        ctx.beginPath();
        ctx.ellipse(cx + e.facing * 1.5, cy, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = pal.darkest;
        ctx.fillRect(cx + e.facing * 2 - 0.5, cy - 2, 1.5, 3);

        // Waddling feet
        const step = Math.sin(this.player.animTick * 0.3) * 1.5;
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(e.x + 1, e.y + e.h - 2 + (step > 0 ? 1 : 0), 4, 2);
        ctx.fillRect(e.x + e.w - 5, e.y + e.h - 2 + (step <= 0 ? 1 : 0), 4, 2);
      } else if (e.type === 'bronto_burt') {
        // Flying Bronto Burt
        const cx = e.x + 6;
        const cy = e.y + 6;
        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.darkest;
        ctx.stroke();

        // Beak
        ctx.fillStyle = pal.lightest;
        ctx.fillRect(cx + (e.vx > 0 ? 3 : -5), cy - 1, 3, 2);

        // Flapping wings
        const wingOffset = Math.sin(this.player.animTick * 0.4) > 0 ? -4 : 2;
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(cx - 3, cy + wingOffset, 3, 2);
        ctx.fillRect(cx + 1, cy + wingOffset, 3, 2);
      } else if (e.type === 'poppy_bros') {
        // Poppy Bros Jr
        ctx.fillStyle = pal.light;
        ctx.fillRect(e.x + 2, e.y + 4, 8, 8);
        // Stocking hat
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(e.x + 3, e.y, 6, 4);
        ctx.fillRect(e.x + 1, e.y + 1, 2, 2);
        // Feet
        ctx.fillStyle = pal.dark;
        ctx.fillRect(e.x + 1, e.y + 12, 4, 2);
        ctx.fillRect(e.x + 7, e.y + 12, 4, 2);
      } else if (e.type === 'gordo') {
        // Gordo (Spike ball)
        const cx = e.x + 7;
        const cy = e.y + 7;
        ctx.fillStyle = pal.darkest;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        // 4 Spikes
        ctx.fillRect(cx - 7, cy - 1, 14, 2);
        ctx.fillRect(cx - 1, cy - 7, 2, 14);

        // Big Glaring Eyes
        ctx.fillStyle = pal.lightest;
        ctx.fillRect(cx - 3, cy - 2, 2, 3);
        ctx.fillRect(cx + 1, cy - 2, 2, 3);
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(cx - 2, cy - 1, 1, 2);
        ctx.fillRect(cx + 2, cy - 1, 1, 2);
      } else if (e.type === 'whispy_woods') {
        this.renderWhispyWoods(e);
      }
    }
  }

  private renderWhispyWoods(boss: Enemy) {
    const ctx = this.ctx;
    const pal = this.palette;

    // Foliage Canopy (Huge fluffy tree canopy)
    ctx.fillStyle = pal.dark;
    ctx.strokeStyle = pal.darkest;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(boss.x + 20, boss.y + 15, 24, 0, Math.PI * 2);
    ctx.arc(boss.x - 2, boss.y + 22, 16, 0, Math.PI * 2);
    ctx.arc(boss.x + 38, boss.y + 22, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Trunk
    ctx.fillStyle = pal.light;
    ctx.fillRect(boss.x + 4, boss.y + 30, 36, 66);
    ctx.strokeRect(boss.x + 4.5, boss.y + 30.5, 35, 65);

    // Bark texture lines
    ctx.fillStyle = pal.dark;
    ctx.fillRect(boss.x + 8, boss.y + 40, 2, 10);
    ctx.fillRect(boss.x + 18, boss.y + 60, 2, 16);
    ctx.fillRect(boss.x + 30, boss.y + 48, 2, 12);

    // Whispy Face (Nose & Eyes)
    // Long nose
    ctx.fillStyle = pal.darkest;
    ctx.fillRect(boss.x - 4, boss.y + 52, 12, 5);

    // Eyes
    if (this.bossDefeated) {
      // Crying face
      ctx.fillStyle = pal.darkest;
      ctx.fillRect(boss.x + 6, boss.y + 44, 4, 2);
      ctx.fillRect(boss.x + 18, boss.y + 44, 4, 2);

      // Tears streaming down!
      ctx.fillStyle = pal.lightest;
      ctx.fillRect(boss.x + 7, boss.y + 48, 2, 8);
      ctx.fillRect(boss.x + 19, boss.y + 48, 2, 8);
    } else {
      // Normal hollow eyes
      ctx.fillStyle = pal.darkest;
      ctx.fillRect(boss.x + 6, boss.y + 42, 4, 6);
      ctx.fillRect(boss.x + 18, boss.y + 42, 4, 6);
      ctx.fillStyle = pal.lightest;
      ctx.fillRect(boss.x + 7, boss.y + 44, 2, 2);
      ctx.fillRect(boss.x + 19, boss.y + 44, 2, 2);
    }

    // Mouth
    ctx.fillStyle = pal.darkest;
    if (boss.actionTimer && boss.actionTimer < 20 && !this.bossDefeated) {
      // Inhaling / blowing mouth open!
      ctx.beginPath();
      ctx.arc(boss.x + 2, boss.y + 68, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(boss.x + 4, boss.y + 68, 6, 3);
    }

    // Roots
    ctx.fillStyle = pal.darkest;
    ctx.fillRect(boss.x, boss.y + 92, 12, 4);
    ctx.fillRect(boss.x + 32, boss.y + 92, 14, 4);
  }

  private renderKirby() {
    const ctx = this.ctx;
    const pal = this.palette;
    const p = this.player;

    // Hurt flashing
    if (p.invincibleTimer % 4 >= 2) return;

    ctx.save();
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.translate(cx, cy);

    let radius = 6;
    if (p.state === 'full') radius = 8.5;
    if (p.state === 'flying') radius = 8.0;

    // Body
    ctx.fillStyle = pal.lightest;
    ctx.strokeStyle = pal.darkest;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheeks blushing dots
    ctx.fillStyle = pal.light;
    ctx.fillRect(p.facing * 4 - 1, 1, 2, 1);
    ctx.fillRect(-p.facing * 3 - 1, 1, 2, 1);

    // Eyes
    ctx.fillStyle = pal.darkest;
    const eyeX = p.facing === 1 ? 1 : -3;
    ctx.fillRect(eyeX, -3, 2, 4);
    ctx.fillStyle = pal.lightest;
    ctx.fillRect(eyeX, -3, 2, 1);

    // Mouth / Expression
    ctx.fillStyle = pal.darkest;
    if (p.state === 'inhaling') {
      // Big gaping black hole
      ctx.beginPath();
      ctx.arc(p.facing * 4, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.state === 'full' || p.state === 'flying') {
      // Puffed sealed cheeks
      ctx.fillRect(p.facing * 3, 0, 2, 1.5);
    } else if (p.state === 'dancing') {
      // Joyous open mouth :D
      ctx.beginPath();
      ctx.arc(0, 1, 2, 0, Math.PI);
      ctx.fill();
    } else {
      // Cute smile
      ctx.fillRect(eyeX + 1, 1, 2, 1);
    }

    // Feet (Iconic red/dark Kirby oval feet)
    ctx.fillStyle = pal.dark;
    ctx.strokeStyle = pal.darkest;
    ctx.lineWidth = 1;

    if (p.state === 'dancing') {
      // Victory dance foot twirl
      const spinAngle = (p.danceTimer * 0.15) % (Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(-3 + Math.sin(spinAngle) * 4, radius - 1, 3, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(3 - Math.sin(spinAngle) * 4, radius - 1, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.state === 'flying') {
      // Little nub arms flapping
      const flap = Math.sin(p.animTick * 0.5) * 2;
      ctx.fillRect(-radius - 1, flap, 2, 2);
      ctx.fillRect(radius - 1, flap, 2, 2);
      // Feet tucked in
      ctx.beginPath();
      ctx.arc(-2.5, radius - 1, 2, 0, Math.PI * 2);
      ctx.arc(2.5, radius - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Walking feet
      const footCycle = p.vx !== 0 ? Math.sin(p.animTick * 0.4) * 2 : 0;
      ctx.beginPath();
      ctx.ellipse(-3, radius - 1 + footCycle, 3, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(3, radius - 1 - footCycle, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderParticles() {
    const ctx = this.ctx;
    const pal = this.palette;

    for (const part of this.particles) {
      if (part.char) {
        ctx.fillStyle = pal.darkest;
        ctx.font = '8px monospace';
        ctx.fillText(part.char, part.x, part.y);
      } else {
        ctx.fillStyle = part.color || pal.darkest;
        ctx.fillRect(part.x, part.y, 2, 2);
      }
    }
  }

  private renderHUD() {
    const ctx = this.ctx;
    const pal = this.palette;

    // Bottom 16px UI banner
    ctx.fillStyle = pal.darkest;
    ctx.fillRect(0, 128, GB_WIDTH, 16);

    ctx.fillStyle = pal.lightest;
    ctx.font = '8px monospace';

    // Player HP
    ctx.fillText('HP', 4, 139);
    for (let i = 0; i < this.player.maxHp; i++) {
      if (i < this.player.hp) {
        ctx.fillStyle = pal.lightest;
        ctx.fillRect(18 + i * 5, 132, 4, 7);
      } else {
        ctx.strokeStyle = pal.light;
        ctx.strokeRect(18 + i * 5 + 0.5, 132.5, 3, 6);
      }
    }

    // Score
    const scoreStr = this.player.score.toString().padStart(6, '0');
    ctx.fillStyle = pal.lightest;
    ctx.fillText(`${scoreStr}`, 54, 139);

    // Lives
    ctx.fillText(`x${Math.max(0, this.player.lives)}`, 108, 139);
    // Little Kirby icon for lives
    ctx.fillStyle = pal.light;
    ctx.beginPath();
    ctx.arc(102, 136, 3, 0, Math.PI * 2);
    ctx.fill();

    // Stage tag
    ctx.fillStyle = pal.lightest;
    ctx.fillText('1-1', 134, 139);

    // If Whispy Woods is active, display Boss HP bar at top
    if (this.bossActive) {
      const boss = this.level.enemies.find((e) => e.type === 'whispy_woods');
      if (boss && boss.hp > 0) {
        ctx.fillStyle = pal.darkest;
        ctx.fillRect(94, 4, 62, 13);
        ctx.fillStyle = pal.lightest;
        ctx.font = '7px monospace';
        ctx.fillText('BOSS', 96, 13);
        for (let i = 0; i < boss.maxHp; i++) {
          if (i < boss.hp) {
            ctx.fillRect(122 + i * 5, 7, 4, 6);
          } else {
            ctx.strokeStyle = pal.light;
            ctx.strokeRect(122 + i * 5 + 0.5, 7.5, 3, 5);
          }
        }
      }
    }
  }

  private renderTitleScreen() {
    const ctx = this.ctx;
    const pal = this.palette;

    // Classic Title
    ctx.fillStyle = pal.darkest;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("★ KIRBY'S DREAM LAND ★", GB_WIDTH / 2, 38);

    ctx.font = '8px monospace';
    ctx.fillText('1992 RETRO GB TRIBUTE', GB_WIDTH / 2, 52);

    // Kirby Sprite in center
    const kx = GB_WIDTH / 2;
    const ky = 76;
    ctx.fillStyle = pal.light;
    ctx.strokeStyle = pal.darkest;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(kx, ky, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes & Smile
    ctx.fillStyle = pal.darkest;
    ctx.fillRect(kx - 3, ky - 4, 2, 4);
    ctx.fillRect(kx + 1, ky - 4, 2, 4);
    ctx.beginPath();
    ctx.arc(kx, ky + 1, 2, 0, Math.PI);
    ctx.fill();

    // Little feet
    ctx.fillStyle = pal.dark;
    ctx.beginPath();
    ctx.ellipse(kx - 6, ky + 9, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(kx + 6, ky + 9, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flashing Press Start
    const tick = Math.floor(Date.now() / 500) % 2;
    if (tick === 0) {
      ctx.fillStyle = pal.darkest;
      ctx.fillText('PRESS START / SPACE', GB_WIDTH / 2, 106);
    }

    ctx.font = '7px monospace';
    ctx.fillStyle = pal.dark;
    ctx.fillText('© 1992 HAL / WEB REMAKE', GB_WIDTH / 2, 126);
    ctx.textAlign = 'left';
  }

  private renderPauseOverlay() {
    const ctx = this.ctx;
    const pal = this.palette;

    ctx.fillStyle = pal.darkest;
    ctx.fillRect(40, 52, 80, 28);
    ctx.strokeStyle = pal.lightest;
    ctx.strokeRect(41.5, 53.5, 77, 25);

    ctx.fillStyle = pal.lightest;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', GB_WIDTH / 2, 69);
    ctx.textAlign = 'left';
  }

  private renderVictoryOverlay() {
    const ctx = this.ctx;
    const pal = this.palette;

    ctx.fillStyle = pal.darkest;
    ctx.fillRect(25, 42, 110, 48);
    ctx.strokeStyle = pal.lightest;
    ctx.strokeRect(26.5, 43.5, 107, 45);

    ctx.fillStyle = pal.lightest;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ STAGE CLEAR! ★', GB_WIDTH / 2, 57);
    ctx.fillText('CONGRATULATIONS!!', GB_WIDTH / 2, 69);
    ctx.font = '7px monospace';
    ctx.fillText('PRESS START TO RESTART', GB_WIDTH / 2, 81);
    ctx.textAlign = 'left';
  }

  private renderGameOverOverlay() {
    const ctx = this.ctx;
    const pal = this.palette;

    ctx.fillStyle = pal.darkest;
    ctx.fillRect(35, 48, 90, 38);
    ctx.strokeStyle = pal.lightest;
    ctx.strokeRect(36.5, 49.5, 87, 35);

    ctx.fillStyle = pal.lightest;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GB_WIDTH / 2, 64);
    ctx.font = '7px monospace';
    ctx.fillText('PRESS START TO RETRY', GB_WIDTH / 2, 76);
    ctx.textAlign = 'left';
  }

  private renderScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < GB_HEIGHT; y += 2) {
      ctx.fillRect(0, y, GB_WIDTH, 1);
    }
  }

  // --- Animation loop ---
  start() {
    const step = (time: number) => {
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(step);
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audio.stopBGM();
    audio.stopInhaleLoop();
  }
}
