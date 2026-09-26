import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Music,
  Gamepad2,
  Monitor,
  Sparkles,
  Trophy,
  Layers,
} from 'lucide-react';
import { audio } from './game/audio';
import { GB_HEIGHT, GB_WIDTH, PALETTES } from './game/constants';
import { KirbyEngine } from './game/engine';
import { GameScreenState, PaletteKey } from './game/types';
import { RetroBezel } from './components/RetroBezel';
import { SoundTestModal } from './components/SoundTestModal';
import { GuideModal } from './components/GuideModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<KirbyEngine | null>(null);

  const [gameState, setGameState] = useState<GameScreenState>('TITLE');
  const [hp, setHp] = useState(6);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [bossHp, setBossHp] = useState<number | undefined>(undefined);
  const [bossActive, setBossActive] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const [paletteKey, setPaletteKey] = useState<PaletteKey>('dmg');
  const [viewMode, setViewMode] = useState<'handheld' | 'screen-only'>('handheld');
  const [showScanlines, setShowScanlines] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const [isSoundTestOpen, setIsSoundTestOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Initialize Kirby engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new KirbyEngine(canvasRef.current);
    engineRef.current = engine;
    engine.setPalette(paletteKey);
    engine.setScanlines(showScanlines);
    setHighScore(engine.highScore);

    engine.onStateChange = (stats) => {
      setHp(stats.hp);
      setScore(stats.score);
      setLives(stats.lives);
      setGameState(stats.state);
      setBossHp(stats.bossHp);
      setBossActive(stats.bossActive);
      if (stats.score > engine.highScore) {
        setHighScore(stats.score);
      }
    };

    engine.start();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on space / arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.handleKeyDown(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.stop();
    };
  }, []);

  // Update palette changes
  useEffect(() => {
    engineRef.current?.setPalette(paletteKey);
  }, [paletteKey]);

  // Update scanline settings
  useEffect(() => {
    engineRef.current?.setScanlines(showScanlines);
  }, [showScanlines]);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleRestart = () => {
    engineRef.current?.restart();
  };

  const handleStartGame = () => {
    if (gameState === 'TITLE') {
      engineRef.current?.startPlay();
    } else if (gameState === 'PAUSED') {
      engineRef.current?.togglePause();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans selection:bg-emerald-900 selection:text-white">
      {/* 1. Header conforming to universal 3-zone contract */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-['Press_Start_2P',monospace] text-xs sm:text-sm font-bold tracking-wider text-emerald-400">
            ★ DREAM LAND 1992
          </span>
          <span className="hidden md:inline text-xs text-neutral-400 font-mono">
            GB 初代復刻
          </span>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-neutral-300">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            初代玩法指南
          </button>
          <button
            onClick={() => setIsSoundTestOpen(true)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Music className="w-3.5 h-3.5" />
            8-Bit 音效試聽
          </button>
          <button
            onClick={() => setShowScanlines((prev) => !prev)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            {showScanlines ? 'LCD 像素網格: 開' : 'LCD 像素網格: 關'}
          </button>
          <button
            onClick={() => setViewMode((prev) => (prev === 'handheld' ? 'screen-only' : 'handheld'))}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {viewMode === 'handheld' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                純螢幕模式
              </>
            ) : (
              <>
                <Gamepad2 className="w-3.5 h-3.5" />
                經典掌機外殼
              </>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? '取消靜音' : '靜音'}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={handleRestart}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重新開始
          </button>
        </div>
      </header>

      {/* 2. Main Game Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-6xl mx-auto w-full">
        {/* Status & Dashboard Bar */}
        <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-3 mb-4 px-2 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              HIGH: {highScore.toString().padStart(6, '0')}
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-200">
              SCORE: <span className="text-white font-bold">{score.toString().padStart(6, '0')}</span>
            </span>
          </div>

          {/* Palette Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-500">調色盤:</span>
            <div className="flex rounded-md bg-neutral-900 p-0.5 border border-neutral-800">
              {(Object.keys(PALETTES) as PaletteKey[]).map((key) => {
                const p = PALETTES[key];
                return (
                  <button
                    key={key}
                    onClick={() => setPaletteKey(key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      paletteKey === key
                        ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {key.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Boss HP Callout when Whispy Woods enters */}
        {bossActive && bossHp !== undefined && (
          <div className="w-full max-w-md mb-3 py-1.5 px-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center justify-between text-xs font-mono animate-fade-in">
            <span className="text-red-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              BOSS: 風語之樹 WHISPY WOODS
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3 rounded-xs border border-red-900 ${
                    i < bossHp ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-neutral-900'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Game Boy Case / Screen */}
        <RetroBezel
          engine={engineRef.current}
          mode={viewMode}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
        >
          <canvas
            ref={canvasRef}
            width={GB_WIDTH}
            height={GB_HEIGHT}
            onClick={handleStartGame}
            className="block cursor-pointer select-none"
            style={{
              width: viewMode === 'screen-only' ? 'min(90vw, 480px)' : '280px',
              height: viewMode === 'screen-only' ? 'min(81vw, 432px)' : '252px',
              imageRendering: 'pixelated',
            }}
          />
        </RetroBezel>

        {/* Mobile / Screen-only virtual floating helper controls */}
        {viewMode === 'screen-only' && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => engineRef.current?.setVirtualInput('a', true)}
              onMouseUp={() => engineRef.current?.setVirtualInput('a', false)}
              className="px-4 py-2 bg-neutral-800 active:bg-neutral-700 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-700"
            >
              [A] 跳躍 / 飛行
            </button>
            <button
              onClick={() => engineRef.current?.setVirtualInput('b', true)}
              onMouseUp={() => engineRef.current?.setVirtualInput('b', false)}
              className="px-4 py-2 bg-neutral-800 active:bg-neutral-700 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-700"
            >
              [B] 吸入 / 吐星
            </button>
            <button
              onClick={() => engineRef.current?.setVirtualInput('down', true)}
              onMouseUp={() => engineRef.current?.setVirtualInput('down', false)}
              className="px-4 py-2 bg-neutral-800 active:bg-neutral-700 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-700"
            >
              [↓] 吞下肚子
            </button>
          </div>
        )}

        {/* 4. Controls & Legend */}
        <div className="mt-6 w-full max-w-xl bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 font-mono text-xs text-neutral-400">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-800">
            <span className="font-semibold text-neutral-300">🎮 鍵盤操作說明</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-emerald-400 hover:underline text-[11px] cursor-pointer"
            >
              查看詳細初代機制攻略 →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                ← → / A D
              </span>
              <span>左右平移走動</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                W / ↑ / 空白鍵
              </span>
              <span>跳躍；空中再按即可<b>拍翅飛行</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                長按 J / X
              </span>
              <span><b>大口吸入</b>前方怪物或道具</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                含物按 J / X
              </span>
              <span>噴出<b>穿透星星彈</b>破壞障礙</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                含物按 S / ↓
              </span>
              <span>吞嚥下肚（獲得分數並回復生命）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-bold">
                Enter / P
              </span>
              <span>暫停遊戲 / 開始遊戲</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-3 text-center text-neutral-500 font-mono text-[11px]">
        <span>Kirby's Dream Land 1992 Tribute · Original game by HAL Laboratory & Masahiro Sakurai</span>
      </footer>

      {/* Modals */}
      <SoundTestModal isOpen={isSoundTestOpen} onClose={() => setIsSoundTestOpen(false)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
