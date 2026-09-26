import React from 'react';
import { Volume2, Music, X, Play } from 'lucide-react';
import { audio } from '../game/audio';

interface SoundTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundTestModal: React.FC<SoundTestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sfxList = [
    { name: '跳躍音效 (Jump)', fn: () => audio.playJump(), desc: '卡比正常起跳上升音' },
    { name: '飛行拍翅 (Fly Flap)', fn: () => audio.playFly(), desc: '吸氣膨脹後的輕盈拍翅' },
    { name: '吐出星星彈 (Star Spit)', fn: () => audio.playSpitStar(), desc: '含著敵人發射貫穿星星' },
    { name: '吐出空氣彈 (Air Puff)', fn: () => audio.playSpitPuff(), desc: '空中釋放氣流並下降' },
    { name: '吞下肚 (Swallow Gulp)', fn: () => audio.playSwallow(), desc: '將含著的敵人消化得分' },
    { name: '受傷打擊 (Hit)', fn: () => audio.playHit(), desc: '撞到怪物或受擊音效' },
    { name: '磚塊粉碎 (Break Block)', fn: () => audio.playBreakBlock(), desc: '星星彈擊碎星星磚塊' },
    { name: '拾取道具 (Maxim Tomato)', fn: () => audio.playItem(), desc: '吃到番茄或蘋果補血' },
    { name: '風語之樹風暴 (Whispy Gust)', fn: () => audio.playWhispyGust(), desc: '第一關 Boss 吹出氣流' },
    { name: '關卡過關慶祝 (Stage Clear)', fn: () => audio.playStageClear(), desc: '初代卡比勝利之舞音樂' },
    { name: '遊戲結束 (Game Over)', fn: () => audio.playGameOver(), desc: '生命的下行悲歌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-neutral-700 rounded-xl p-5 text-neutral-100 shadow-2xl font-mono text-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            <h2 className="font-['Press_Start_2P',monospace] text-xs text-emerald-400 tracking-wider">
              SOUND TEST 8-BIT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-neutral-800/60 rounded-lg flex items-center justify-between border border-neutral-700/60">
          <div>
            <div className="font-semibold text-neutral-200">Green Greens 主題背景音樂</div>
            <div className="text-xs text-neutral-400">Web Audio 即時合成方波與三角波旋律</div>
          </div>
          <button
            onClick={() => audio.toggleMusic()}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1.5 transition-colors font-medium"
          >
            <Volume2 className="w-3.5 h-3.5" />
            BGM 開關
          </button>
        </div>

        <div className="space-y-2">
          {sfxList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-neutral-800/40 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
            >
              <div>
                <div className="font-medium text-neutral-200">{item.name}</div>
                <div className="text-xs text-neutral-400">{item.desc}</div>
              </div>
              <button
                onClick={item.fn}
                className="px-2.5 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                播放
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-xs transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
