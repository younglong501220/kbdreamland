import React, { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { KirbyEngine } from '../game/engine';

interface RetroBezelProps {
  engine: KirbyEngine | null;
  mode: 'handheld' | 'screen-only';
  onToggleMute: () => void;
  isMuted: boolean;
  children: React.ReactNode;
}

export const RetroBezel: React.FC<RetroBezelProps> = ({
  engine,
  mode,
  onToggleMute,
  isMuted,
  children,
}) => {
  const [activeBtns, setActiveBtns] = useState<Record<string, boolean>>({});

  const handleButtonDown = (btn: 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'start' | 'select') => {
    setActiveBtns((prev) => ({ ...prev, [btn]: true }));
    engine?.setVirtualInput(btn, true);
  };

  const handleButtonUp = (btn: 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'start' | 'select') => {
    setActiveBtns((prev) => ({ ...prev, [btn]: false }));
    engine?.setVirtualInput(btn, false);
  };

  if (mode === 'screen-only') {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="relative p-2.5 sm:p-4 rounded-xl bg-neutral-900 border-2 sm:border-4 border-neutral-800 shadow-2xl">
          {children}
        </div>
      </div>
    );
  }

  // Authentic 1989/1992 Game Boy DMG-01 Handheld Chassis
  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[420px] bg-[#d5d2cb] text-neutral-800 rounded-t-[32px] rounded-b-[64px] p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-8px_14px_rgba(0,0,0,0.3)] border border-[#bcb8b0] select-none mx-auto transition-all">
      {/* Top Grooves */}
      <div className="absolute top-2.5 left-8 right-8 flex justify-between h-1.5 opacity-40">
        <div className="w-14 h-full bg-[#8c8880] rounded-full"></div>
        <div className="w-14 h-full bg-[#8c8880] rounded-full"></div>
      </div>

      {/* Screen Frame / Dark Gray Bezel */}
      <div className="relative bg-[#6b6f75] rounded-t-xl rounded-b-[38px] p-3.5 sm:p-5 pt-6 shadow-[inset_0_4px_8px_rgba(0,0,0,0.65),0_2px_3px_rgba(255,255,255,0.3)] border-2 border-[#54575c]">
        {/* Bezel Header Stripes & Text */}
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-sans font-bold tracking-wider mb-2 px-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="h-[2px] w-6 sm:w-10 bg-[#83265c]"></span>
            <span className="text-[#a4a8af] text-[7.5px] sm:text-[8.5px]">DOT MATRIX WITH STEREO SOUND</span>
            <span className="h-[2px] w-6 sm:w-10 bg-[#25427d]"></span>
          </div>
        </div>

        {/* Battery Indicator LED */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ff2222] border border-red-900 animate-pulse"></div>
          <span className="text-[6.5px] text-[#b4b8be] font-bold tracking-tighter">BATTERY</span>
        </div>

        {/* Game Screen Container */}
        <div className="flex justify-center items-center overflow-hidden rounded bg-[#8bac0f] shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] ml-3 sm:ml-4">
          {children}
        </div>
      </div>

      {/* Brand Wordmark */}
      <div className="flex items-center justify-between mt-3 px-1 sm:px-2">
        <span className="font-['Press_Start_2P',monospace] text-[9px] sm:text-[10px] font-bold text-[#1a233a] tracking-wider">
          HAL LABORATORY
        </span>
        <span className="text-[8px] sm:text-[9px] font-sans font-bold text-[#343d54] italic">
          GAME BOY™ 1992
        </span>
      </div>

      {/* Controls Section */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-4 items-center">
        {/* Cross D-PAD */}
        <div className="flex justify-center">
          <div className="relative w-26 h-26 sm:w-28 sm:h-28">
            {/* Horizontal Bar */}
            <div className="absolute top-8 sm:top-9 left-0 w-26 sm:w-28 h-10 bg-[#1e2024] rounded-sm shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
            {/* Vertical Bar */}
            <div className="absolute top-0 left-8 sm:left-9 w-10 h-26 sm:h-28 bg-[#1e2024] rounded-sm shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
            {/* Center Indent */}
            <div className="absolute top-10 sm:top-11 left-10 sm:left-11 w-6 h-6 rounded-full bg-[#131416] shadow-inner"></div>

            {/* D-Pad Buttons */}
            <button
              onMouseDown={() => handleButtonDown('up')}
              onMouseUp={() => handleButtonUp('up')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('up'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('up'); }}
              aria-label="Up / Jump / Fly"
              className={`absolute top-0 left-8 sm:left-9 w-10 h-9 flex items-center justify-center text-neutral-400 active:bg-neutral-800 transition-colors cursor-pointer ${
                activeBtns['up'] ? 'bg-neutral-800' : ''
              }`}
            >
              <ArrowUp className="w-4 h-4 opacity-60" />
            </button>

            <button
              onMouseDown={() => handleButtonDown('down')}
              onMouseUp={() => handleButtonUp('down')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('down'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('down'); }}
              aria-label="Down / Swallow"
              className={`absolute bottom-0 left-8 sm:left-9 w-10 h-9 flex items-center justify-center text-neutral-400 active:bg-neutral-800 transition-colors cursor-pointer ${
                activeBtns['down'] ? 'bg-neutral-800' : ''
              }`}
            >
              <ArrowDown className="w-4 h-4 opacity-60" />
            </button>

            <button
              onMouseDown={() => handleButtonDown('left')}
              onMouseUp={() => handleButtonUp('left')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('left'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('left'); }}
              aria-label="Left"
              className={`absolute top-8 sm:top-9 left-0 w-9 h-10 flex items-center justify-center text-neutral-400 active:bg-neutral-800 transition-colors cursor-pointer ${
                activeBtns['left'] ? 'bg-neutral-800' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4 opacity-60" />
            </button>

            <button
              onMouseDown={() => handleButtonDown('right')}
              onMouseUp={() => handleButtonUp('right')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('right'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('right'); }}
              aria-label="Right"
              className={`absolute top-8 sm:top-9 right-0 w-9 h-10 flex items-center justify-center text-neutral-400 active:bg-neutral-800 transition-colors cursor-pointer ${
                activeBtns['right'] ? 'bg-neutral-800' : ''
              }`}
            >
              <ArrowRight className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>

        {/* A & B Action Buttons (Angled) */}
        <div className="flex justify-center">
          <div className="flex gap-3 sm:gap-4 -rotate-25 items-center p-2 rounded-2xl bg-[#c5c2ba] shadow-inner border border-[#b4b1a8]">
            {/* B BUTTON */}
            <div className="flex flex-col items-center gap-1">
              <button
                onMouseDown={() => handleButtonDown('b')}
                onMouseUp={() => handleButtonUp('b')}
                onTouchStart={(e) => { e.preventDefault(); handleButtonDown('b'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('b'); }}
                aria-label="B: Inhale / Spit"
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#9e1b4b] border-2 border-[#7e143b] shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)] active:translate-y-0.5 transition-transform flex items-center justify-center text-white font-bold text-xs cursor-pointer ${
                  activeBtns['b'] ? 'translate-y-1 shadow-sm' : ''
                }`}
              >
                B
              </button>
              <span className="text-[8px] font-bold text-[#1f2942] tracking-wider rotate-25">
                吸入/吐星
              </span>
            </div>

            {/* A BUTTON */}
            <div className="flex flex-col items-center gap-1">
              <button
                onMouseDown={() => handleButtonDown('a')}
                onMouseUp={() => handleButtonUp('a')}
                onTouchStart={(e) => { e.preventDefault(); handleButtonDown('a'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('a'); }}
                aria-label="A: Jump / Fly"
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#9e1b4b] border-2 border-[#7e143b] shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)] active:translate-y-0.5 transition-transform flex items-center justify-center text-white font-bold text-xs cursor-pointer ${
                  activeBtns['a'] ? 'translate-y-1 shadow-sm' : ''
                }`}
              >
                A
              </button>
              <span className="text-[8px] font-bold text-[#1f2942] tracking-wider rotate-25">
                跳躍/飛行
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SELECT & START */}
      <div className="flex justify-center items-center gap-6 mt-6">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onToggleMute}
            aria-label="Select / Mute"
            className="w-11 h-3 sm:w-12 sm:h-3.5 bg-[#66686e] rounded-full -rotate-25 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 transition-transform cursor-pointer"
          ></button>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#343d54] tracking-widest mt-1">
            {isMuted ? 'MUTE ON' : 'SELECT'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onMouseDown={() => handleButtonDown('start')}
            onMouseUp={() => handleButtonUp('start')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonDown('start'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('start'); }}
            aria-label="Start / Pause"
            className="w-11 h-3 sm:w-12 sm:h-3.5 bg-[#66686e] rounded-full -rotate-25 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 transition-transform cursor-pointer"
          ></button>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-[#343d54] tracking-widest mt-1">
            START
          </span>
        </div>
      </div>

      {/* Speaker Grill Slits */}
      <div className="absolute bottom-5 right-6 flex gap-1.5 -rotate-25 opacity-60 pointer-events-none">
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
        <div className="w-1.5 h-12 bg-[#8c8880] rounded-full shadow-inner"></div>
      </div>

      {/* Headphone jack imprint */}
      <div className="text-center mt-3 text-[7px] text-[#73706b] font-bold tracking-widest">
        PHONES 🎧
      </div>
    </div>
  );
};
