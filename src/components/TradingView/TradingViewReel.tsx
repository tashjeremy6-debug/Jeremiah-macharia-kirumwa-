import React, { useState } from 'react';
import { MarketData, TradingSymbol } from '../../types/trading';
import { ArrowUpRight, ArrowDownRight, Radio, Flame } from 'lucide-react';

interface TradingViewReelProps {
  markets: Record<TradingSymbol, MarketData>;
  selectedSymbol: TradingSymbol;
  onSelectSymbol: (symbol: TradingSymbol) => void;
  breakingNewsHeadline?: string;
}

export const TradingViewReel: React.FC<TradingViewReelProps> = ({
  markets,
  selectedSymbol,
  onSelectSymbol,
  breakingNewsHeadline,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const symbols = Object.keys(markets) as TradingSymbol[];

  const formatPrice = (price: number, pipSize: number) => {
    const decimals = pipSize < 0.001 ? 5 : pipSize < 0.1 ? 3 : 2;
    return price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Duplicate items for seamless continuous looping reel
  const reelItems = [...symbols, ...symbols];

  return (
    <div
      className="relative w-full overflow-hidden bg-neutral-950/95 border-b border-neutral-850 py-1.5 flex items-center select-none z-30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* TradingView Tape Badge */}
      <div className="flex items-center gap-1.5 px-3 py-0.5 bg-neutral-900 border-r border-neutral-800 text-[10px] font-mono text-neutral-400 shrink-0 z-10 shadow-md">
        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
        <span className="font-bold text-neutral-200 uppercase tracking-wider">LIVE REEL</span>
      </div>

      {/* Breaking News Flash pill */}
      {breakingNewsHeadline && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-0.5 mx-2 bg-amber-950/40 border border-amber-800/40 rounded-full text-[10px] font-mono text-amber-300 shrink-0 z-10">
          <Flame className="w-3 h-3 fill-current text-amber-400" />
          <span className="font-semibold truncate max-w-xs">{breakingNewsHeadline}</span>
        </div>
      )}

      {/* Continuous Scrolling Marquee Track */}
      <div className="flex items-center overflow-x-hidden flex-1 relative mask-fade-edges">
        <div
          className={`flex items-center gap-6 whitespace-nowrap will-change-transform ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{ animationDuration: '45s' }}
        >
          {reelItems.map((sym, index) => {
            const item = markets[sym];
            if (!item) return null;
            const isUp = item.change24h >= 0;
            const isSelected = selectedSymbol === sym;

            return (
              <button
                key={`${sym}-${index}`}
                onClick={() => onSelectSymbol(sym)}
                className={`flex items-center gap-2.5 px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 group ${
                  isSelected
                    ? 'bg-neutral-850 border border-neutral-700 text-white'
                    : 'hover:bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <span className="font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors">
                  {item.symbol}
                </span>

                <span className="text-neutral-200 tabular-nums">
                  ${formatPrice(item.price, item.pipSize)}
                </span>

                <span
                  className={`flex items-center text-[11px] font-bold tabular-nums ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                  )}
                  {isUp ? '+' : ''}
                  {item.change24h.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
