import React, { useState, useEffect } from 'react';
import { MarketData, RiskParameters, TradingSymbol } from '../../types/trading';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface ManualTradeTerminalProps {
  symbol: TradingSymbol;
  marketData: MarketData;
  availableCash: number;
  riskParameters: RiskParameters;
  onExecuteManualTrade: (trade: {
    symbol: TradingSymbol;
    side: 'LONG' | 'SHORT';
    orderType: 'MARKET' | 'LIMIT';
    price: number;
    amountUsd: number;
    leverage: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
  }) => void;
}

export const ManualTradeTerminal: React.FC<ManualTradeTerminalProps> = ({
  symbol,
  marketData,
  availableCash,
  riskParameters,
  onExecuteManualTrade,
}) => {
  const isForex = marketData.assetClass === 'forex';
  const decimals = marketData.pipSize < 0.001 ? 5 : marketData.pipSize < 0.1 ? 3 : 2;

  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [limitPrice, setLimitPrice] = useState<number>(marketData.price);
  const [amountUsd, setAmountUsd] = useState<string>(isForex ? '10000' : '2500');
  const [forexLotSize, setForexLotSize] = useState<string>('0.10'); // 0.1 standard lot = $10,000
  const [leverage, setLeverage] = useState<number>(
    isForex ? Math.min(20, riskParameters.maxLeverage * 5) : Math.min(3, riskParameters.maxLeverage)
  );

  useEffect(() => {
    setLimitPrice(marketData.price);
  }, [marketData.price]);

  // Default SL and TP
  const defaultSlPrice =
    side === 'LONG'
      ? Number((marketData.price * (1 - riskParameters.defaultStopLossPct / 100)).toFixed(decimals))
      : Number((marketData.price * (1 + riskParameters.defaultStopLossPct / 100)).toFixed(decimals));

  const defaultTpPrice =
    side === 'LONG'
      ? Number((marketData.price * (1 + riskParameters.defaultTakeProfitPct / 100)).toFixed(decimals))
      : Number((marketData.price * (1 - riskParameters.defaultTakeProfitPct / 100)).toFixed(decimals));

  const [slPrice, setSlPrice] = useState<string>(defaultSlPrice.toString());
  const [tpPrice, setTpPrice] = useState<string>(defaultTpPrice.toString());

  // Update SL/TP defaults when symbol changes
  useEffect(() => {
    setSlPrice(defaultSlPrice.toString());
    setTpPrice(defaultTpPrice.toString());
  }, [symbol, marketData.price, side]);

  const numAmountUsd = parseFloat(amountUsd) || 0;
  const executionPrice = orderType === 'MARKET' ? marketData.price : limitPrice;
  const marginRequired = numAmountUsd / (leverage || 1);

  // Quick percent buttons
  const handlePercentClick = (pct: number) => {
    const maxAllowedByRisk =
      availableCash * (riskParameters.maxAllocationPerTradePct / 100) * leverage;
    const calculated = availableCash * (pct / 100) * leverage;
    const finalAmount = Math.min(calculated, maxAllowedByRisk);
    setAmountUsd(Math.floor(finalAmount).toString());
    if (isForex) {
      setForexLotSize((finalAmount / 100000).toFixed(2));
    }
  };

  const handleLotChange = (val: string) => {
    setForexLotSize(val);
    const lots = parseFloat(val) || 0;
    setAmountUsd((lots * 100000).toFixed(0));
  };

  // Liquidation Price calculation
  const estLiquidationPrice =
    side === 'LONG'
      ? executionPrice * (1 - 0.9 / leverage)
      : executionPrice * (1 + 0.9 / leverage);

  // Risk Reward calculation
  const numSl = parseFloat(slPrice);
  const numTp = parseFloat(tpPrice);
  let rrRatio = '1:2.0';
  let pipsSl = 0;
  let pipsTp = 0;
  if (numSl && numTp && executionPrice) {
    const slDist = Math.abs(executionPrice - numSl);
    const tpDist = Math.abs(executionPrice - numTp);
    if (slDist > 0) {
      rrRatio = `1:${(tpDist / slDist).toFixed(1)}`;
      pipsSl = Math.round(slDist / marketData.pipSize);
      pipsTp = Math.round(tpDist / marketData.pipSize);
    }
  }

  // Risk warning checks
  const allocationPct = availableCash > 0 ? (marginRequired / availableCash) * 100 : 0;
  const isOverAllocation = allocationPct > riskParameters.maxAllocationPerTradePct;
  const isInsufficientFunds = marginRequired > availableCash;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmountUsd <= 0 || isInsufficientFunds) return;

    onExecuteManualTrade({
      symbol,
      side,
      orderType,
      price: executionPrice,
      amountUsd: numAmountUsd,
      leverage,
      stopLossPrice: numSl || undefined,
      takeProfitPrice: numTp || undefined,
    });
  };

  return (
    <div className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>Manual Trade Override</span>
          <span className="text-[10px] text-neutral-400 font-mono">[{symbol}]</span>
        </span>

        {/* Order Type Tabs */}
        <div className="flex items-center bg-neutral-900 p-0.5 rounded-md border border-neutral-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              orderType === 'MARKET'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              orderType === 'LIMIT'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
        {/* Long / Short Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950/80 border border-neutral-800 rounded-lg">
          <button
            type="button"
            onClick={() => setSide('LONG')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-bold text-xs transition-all ${
              side === 'LONG'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setSide('SHORT')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-bold text-xs transition-all ${
              side === 'SHORT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
            SELL / SHORT
          </button>
        </div>

        {/* Limit Price Input */}
        {orderType === 'LIMIT' && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Limit Price</span>
              <button
                type="button"
                onClick={() => setLimitPrice(marketData.price)}
                className="text-cyan-400 hover:underline"
              >
                Use Last ({marketData.price.toFixed(decimals)})
              </button>
            </div>
            <input
              type="number"
              step="any"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>
        )}

        {/* Forex Lot Size or Crypto Notional */}
        {isForex ? (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Position Size (Lots)</span>
              <span>1 Standard Lot = $100k</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLotChange('0.01')}
                className={`py-1 rounded text-xs font-mono border ${
                  forexLotSize === '0.01'
                    ? 'bg-neutral-800 text-white border-neutral-600'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                0.01 (Micro)
              </button>
              <button
                type="button"
                onClick={() => handleLotChange('0.10')}
                className={`py-1 rounded text-xs font-mono border ${
                  forexLotSize === '0.10'
                    ? 'bg-neutral-800 text-white border-neutral-600'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                0.10 (Mini)
              </button>
              <button
                type="button"
                onClick={() => handleLotChange('1.00')}
                className={`py-1 rounded text-xs font-mono border ${
                  forexLotSize === '1.00'
                    ? 'bg-neutral-800 text-white border-neutral-600'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                1.00 (Standard)
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={forexLotSize}
              onChange={(e) => handleLotChange(e.target.value)}
              className="w-full mt-1 bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
              placeholder="e.g. 0.25"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Order Value (USDT)</span>
              <span>Avail: ${availableCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <input
              type="number"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
              placeholder="e.g. 2500"
            />
          </div>
        )}

        {/* Quick Percent Buttons */}
        <div className="flex items-center gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentClick(pct)}
              className="flex-1 py-1 bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 text-neutral-400 hover:text-white text-[10px] font-mono rounded transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Take Profit & Stop Loss inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-rose-400">
              <span>Stop Loss</span>
              <span>{pipsSl ? `-${pipsSl} pips` : `-${riskParameters.defaultStopLossPct}%`}</span>
            </div>
            <input
              type="number"
              step="any"
              value={slPrice}
              onChange={(e) => setSlPrice(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-400">
              <span>Take Profit</span>
              <span>{pipsTp ? `+${pipsTp} pips` : `+${riskParameters.defaultTakeProfitPct}%`}</span>
            </div>
            <input
              type="number"
              step="any"
              value={tpPrice}
              onChange={(e) => setTpPrice(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        {/* Order Details Matrix */}
        <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg space-y-1 text-[11px] font-mono text-neutral-400">
          <div className="flex justify-between">
            <span>Notional Value:</span>
            <span className="text-white font-semibold tabular-nums">
              ${numAmountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Margin Required:</span>
            <span className="text-neutral-200 font-semibold tabular-nums">
              ${marginRequired.toFixed(2)} ({allocationPct.toFixed(1)}% cash)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Risk-to-Reward Ratio:</span>
            <span className="text-cyan-400 font-semibold">{rrRatio}</span>
          </div>
        </div>

        {/* Risk Warning Banners */}
        {isOverAllocation && (
          <div className="flex items-center gap-1.5 p-2 bg-amber-950/20 border border-amber-800/40 rounded text-[10px] text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Exceeds max allocation parameter ({riskParameters.maxAllocationPerTradePct}% cap).</span>
          </div>
        )}
        {isInsufficientFunds && (
          <div className="flex items-center gap-1.5 p-2 bg-rose-950/20 border border-rose-800/40 rounded text-[10px] text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>Insufficient available margin balance.</span>
          </div>
        )}

        {/* Execution Button */}
        <button
          type="submit"
          disabled={isInsufficientFunds || numAmountUsd <= 0}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isInsufficientFunds || numAmountUsd <= 0
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : side === 'LONG'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99]'
              : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.99]'
          }`}
        >
          {side === 'LONG' ? (
            <>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              Execute Manual Buy / Long ({isForex ? `${forexLotSize} Lots` : `$${numAmountUsd.toLocaleString()}`})
            </>
          ) : (
            <>
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              Execute Manual Sell / Short ({isForex ? `${forexLotSize} Lots` : `$${numAmountUsd.toLocaleString()}`})
            </>
          )}
        </button>
      </form>
    </div>
  );
};
