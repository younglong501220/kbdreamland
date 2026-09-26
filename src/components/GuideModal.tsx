import React from 'react';
import { BookOpen, X, Sparkles, Wind, ShieldAlert, Heart } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-neutral-900 border-2 border-neutral-700 rounded-xl p-6 text-neutral-100 shadow-2xl font-mono text-sm max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-['Press_Start_2P',monospace] text-xs text-amber-400 tracking-wider">
              1992 GB 初代卡比指南
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Mechanic Feature Note */}
        <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-lg text-amber-200/90 text-xs mb-5 leading-relaxed">
          <b>⭐ 歷史回顧：尚未具備複製能力的純粹初代！</b><br />
          1992 年 Game Boy 上的首款《星之卡比》（櫻井政博監督），卡比還沒有吸入敵人獲得變身或複製能力的設定（複製能力直到 1993 年 FC《夢之泉物語》才加入）。初代的魅力在於將吸入的怪物化為穿透星星砲彈，以及無限拍翅飛行的自由度！
        </div>

        {/* Moves Breakdown */}
        <div className="space-y-4">
          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/60">
            <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
              <Wind className="w-4 h-4" />
              1. 大口吸入 (Inhale)
            </div>
            <p className="text-xs text-neutral-300 leading-normal">
              長按 <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">X</span> 或 <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">J</span>（或實體 B 鍵）。卡比會張大嘴巴產生強烈風渦吸力，將面前的敵人或蘋果拉入嘴中。
            </p>
          </div>

          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/60">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              2. 含著狀態 (Mouth Full) & 吐出星星彈 (Star Spit)
            </div>
            <p className="text-xs text-neutral-300 leading-normal">
              含著物體時，卡比身體膨脹為大球，步伐較沉重且無法飛行。再次按下 <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">X</span> / <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">J</span> 即可噴出**高威力穿透星星彈**，能瞬間粉碎星星磚塊與多名敵人！
            </p>
          </div>

          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/60">
            <div className="flex items-center gap-2 font-bold text-pink-400 mb-1">
              <Heart className="w-4 h-4" />
              3. 大啖吞下肚 (Swallow)
            </div>
            <p className="text-xs text-neutral-300 leading-normal">
              嘴中含著物體時，按下方向鍵 <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">↓</span> 或 <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">S</span>，卡比會把敵人嚥下肚，獲得額外分數並少量回復 1 點 HP！
            </p>
          </div>

          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/60">
            <div className="flex items-center gap-2 font-bold text-sky-400 mb-1">
              <Wind className="w-4 h-4" />
              4. 吸氣膨脹無限飛行 (Fly) & 空氣彈 (Air Puff)
            </div>
            <p className="text-xs text-neutral-300 leading-normal">
              跳躍至半空中後，再次按下跳躍鍵（<span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">Space</span> / <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">W</span> / <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-white font-bold">↑</span> 或 A 鍵），卡比會吸飽空氣浮空，可無限次拍動翅膀飛行！在空中按下吐氣鍵會噴出**「空氣彈」**擊退小怪並結束飛行。
            </p>
          </div>

          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/60">
            <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              5. 第一關 Boss「風語之樹」Whispy Woods 攻略
            </div>
            <p className="text-xs text-neutral-300 leading-normal">
              前進到終點森林時會遇見巨大的風語之樹。他會吹出呼嘯旋風，並搖晃樹冠掉落紅蘋果。<b>吸入掉在地上的紅蘋果</b>，再朝著樹幹噴射星星彈，命中 3~4 次即可擊破風語之樹，使其哭出大眼淚，奪回閃爍之星！
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition-colors"
          >
            瞭解，開始冒險！
          </button>
        </div>
      </div>
    </div>
  );
};
