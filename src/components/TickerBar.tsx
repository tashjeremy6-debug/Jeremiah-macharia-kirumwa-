import React from 'react';
import { AssetClass, MarketData, TradingSymbol } from '../types/trading';
import { ArrowUpRight, ArrowDownRight, Globe, Coins } from 'lucide-react';

interface TickerBarProps {
  markets: Record<TradingSymbol, MarketData>;
  selectedSymbol: TradingSymbol;
  onSelectSymbol: (symbol: TradingSymbol) => void;
  priceFlashMap: Record<TradingSymbol, 'up' | 'down' | null>;
  selectedAssetClass: AssetClass;
  onSelectAssetClass: (ac: AssetClass) => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  markets,
  selectedSymbol,
  onSelectSymbol,
  priceFlashMap,
  selectedAssetClass,
  onSelectAssetClass,
}) => {
  const allSymbols = Object.keys(markets) as TradingSymbol[];
  const filteredSymbols = allSymbols.filter(
    (sym) => markets[sym]?.assetClass === selectedAssetClass
  );

  const formatPrice = (price: number, pipSize: number) => {
    const decimals = pipSize < 0.001 ? 5 : pipSize < 0.1 ? 3 : 2;
    return price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="flex items-center overflow-x-auto no-scrollbar border-b border-neutral-800 bg-neutral-950 px-4 py-2 gap-2">
      {/* Asset Class Switcher (Crypto vs Forex) */}
      <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 shrink-0 mr-2 text-xs font-semibold">
        <button
          onClick={() => onSelectAssetClass('crypto')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            selectedAssetClass === 'crypto'
              ? 'bg-neutral-800 text-white shadow-xs font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Crypto</span>
        </button>
        <button
          onClick={() => onSelectAssetClass('forex')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            selectedAssetClass === 'forex'
              ? 'bg-neutral-800 text-white shadow-xs font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Forex</span>
        </button>
      </div>

      {/* Pairs list */}
      {filteredSymbols.map((sym) => {
        const item = markets[sym];
        if (!item) return null;
        const isSelected = selectedSymbol === sym;
        const flash = priceFlashMap[sym];
        const isUp = item.change24h >= 0;

        return (
          <button
            key={sym}
            onClick={() => onSelectSymbol(sym)}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border text-left transition-all whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-neutral-900 border-neutral-700 shadow-sm ring-1 ring-neutral-700/60'
                : 'bg-neutral-950/70 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-200">{item.symbol}</span>
                <span className="text-[10px] text-neutral-500">{item.name}</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                RSI {item.rsi.toFixed(0)} · Vol {item.volume24h}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`font-mono text-xs font-semibold tabular-nums transition-colors duration-300 ${
                  flash === 'up'
                    ? 'text-emerald-400 bg-emerald-500/10 px-1 rounded'
                    : flash === 'down'
                    ? 'text-rose-400 bg-rose-500/10 px-1 rounded'
                    : 'text-neutral-100'
                }`}
              >
                {item.assetClass === 'crypto' || item.symbol.includes('USD') ? '$' : ''}
                {formatPrice(item.price, item.pipSize)}
              </span>

              <div
                className={`flex items-center text-[10px] font-mono tabular-nums ${
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
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
