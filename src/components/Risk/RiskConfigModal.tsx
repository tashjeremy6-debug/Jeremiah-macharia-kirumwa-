import React, { useState } from 'react';
import { BotConfig, RiskParameters, RiskProfile } from '../../types/trading';
import {
  SlidersHorizontal,
  Shield,
  AlertTriangle,
  RotateCcw,
  Check,
  Zap,
  Lock,
  Cpu,
} from 'lucide-react';
import { defaultRiskParameters } from '../../utils/defaultData';

interface RiskConfigModalProps {
  riskParameters: RiskParameters;
  botConfig: BotConfig;
  onSaveRiskParameters: (params: RiskParameters) => void;
  onSaveBotConfig: (config: BotConfig) => void;
}

export const RiskConfigModal: React.FC<RiskConfigModalProps> = ({
  riskParameters,
  botConfig,
  onSaveRiskParameters,
  onSaveBotConfig,
}) => {
  const [params, setParams] = useState<RiskParameters>(riskParameters);
  const [bot, setBot] = useState<BotConfig>(botConfig);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const applyPreset = (preset: RiskProfile) => {
    if (preset === 'Conservative') {
      setParams({
        ...params,
        riskProfile: 'Conservative',
        maxDrawdownLimitPct: 3.0,
        maxAllocationPerTradePct: 8.0,
        defaultStopLossPct: 1.8,
        defaultTakeProfitPct: 4.5,
        maxLeverage: 2,
        trailingStopEnabled: true,
        trailingStopDistancePct: 1.0,
        slippageTolerancePct: 0.1,
        dailyLossHaltPct: 2.5,
        maxOpenPositions: 2,
      });
    } else if (preset === 'Moderate') {
      setParams({
        ...defaultRiskParameters,
        riskProfile: 'Moderate',
      });
    } else if (preset === 'Aggressive') {
      setParams({
        ...params,
        riskProfile: 'Aggressive',
        maxDrawdownLimitPct: 8.0,
        maxAllocationPerTradePct: 25.0,
        defaultStopLossPct: 4.0,
        defaultTakeProfitPct: 10.0,
        maxLeverage: 5,
        trailingStopEnabled: true,
        trailingStopDistancePct: 2.5,
        slippageTolerancePct: 0.4,
        dailyLossHaltPct: 6.0,
        maxOpenPositions: 4,
      });
    } else {
      setParams({
        ...params,
        riskProfile: 'Custom',
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRiskParameters(params);
    onSaveBotConfig(bot);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Risk Parameters & Bot Governance</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure institutional safety boundaries, leverage caps, automated circuit breakers, and AI bot strategy execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setParams(defaultRiskParameters);
              applyPreset('Moderate');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
            1. Risk Profile Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Conservative', 'Moderate', 'Aggressive', 'Custom'] as RiskProfile[]).map((prof) => (
              <button
                key={prof}
                type="button"
                onClick={() => applyPreset(prof)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  params.riskProfile === prof
                    ? 'bg-neutral-900 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{prof}</span>
                  {params.riskProfile === prof && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 font-mono">
                  {prof === 'Conservative' && 'Max 2x · Tight Stops'}
                  {prof === 'Moderate' && 'Max 3x · Balanced'}
                  {prof === 'Aggressive' && 'Max 5x · Wider Bounds'}
                  {prof === 'Custom' && 'User Manual Overrides'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bot Autonomous Execution Settings */}
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              2. AI Bot Execution Engine & Strategy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bot Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Execution Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBot({ ...bot, mode: 'autonomous' })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    bot.mode === 'autonomous'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  Autonomous Auto-Trade
                </button>
                <button
                  type="button"
                  onClick={() => setBot({ ...bot, mode: 'signal_only' })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    bot.mode === 'signal_only'
                      ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  Signal Only (1-Click Confirm)
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight">
                {bot.mode === 'autonomous'
                  ? 'Bot automatically places orders within your risk bounds when confidence is verified.'
                  : 'Bot delivers actionable trade proposals and awaits your manual 1-click execution.'}
              </p>
            </div>

            {/* Active Strategy */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Quantitative Strategy</label>
              <select
                value={bot.strategy}
                onChange={(e) => setBot({ ...bot, strategy: e.target.value as any })}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
              >
                <option value="Adaptive Multi-Factor AI">Adaptive Multi-Factor AI (Gemini + Quant)</option>
                <option value="Trend Rider EMA Cross">Trend Rider EMA Cross (20/50 Golden Cross)</option>
                <option value="Mean Reversion Bands">Mean Reversion (Bollinger Bands + RSI Dip)</option>
                <option value="Momentum Scalper">Momentum Scalper (Order Book Imbalance + Breakout)</option>
              </select>
              <p className="text-[11px] text-neutral-500 leading-tight">
                AI dynamically optimizes indicator weighting based on live market volatility.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Risk Parameters Sliders & Inputs */}
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              3. Hard Risk Constraints & Protective Limits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
            {/* Max Allocation Per Trade */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Max Allocation per Trade:</span>
                <span className="font-bold text-white tabular-nums">{params.maxAllocationPerTradePct}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="35"
                step="1"
                value={params.maxAllocationPerTradePct}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    maxAllocationPerTradePct: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                Maximum percent of available cash committed to any single position margin.
              </div>
            </div>

            {/* Max Leverage Cap */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Max Allowed Leverage:</span>
                <span className="font-bold text-amber-400 tabular-nums">{params.maxLeverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.maxLeverage}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    maxLeverage: parseInt(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                Hard ceiling prevents the bot or manual trade from exceeding this multiplier.
              </div>
            </div>

            {/* Default Stop Loss */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Default Stop Loss:</span>
                <span className="font-bold text-rose-400 tabular-nums">-{params.defaultStopLossPct}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.5"
                value={params.defaultStopLossPct}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    defaultStopLossPct: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                Auto-calculated stop order placed on every automated entry.
              </div>
            </div>

            {/* Default Take Profit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Default Take Profit:</span>
                <span className="font-bold text-emerald-400 tabular-nums">+{params.defaultTakeProfitPct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="25.0"
                step="0.5"
                value={params.defaultTakeProfitPct}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    defaultTakeProfitPct: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                Recommended minimum 1:2 risk-to-reward target.
              </div>
            </div>

            {/* Daily Loss Halt Circuit Breaker */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Daily Loss Circuit Breaker:</span>
                <span className="font-bold text-rose-400 tabular-nums">{params.dailyLossHaltPct}%</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="10.0"
                step="0.5"
                value={params.dailyLossHaltPct}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    dailyLossHaltPct: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                If daily portfolio drawdown reaches this threshold, the bot immediately freezes trading.
              </div>
            </div>

            {/* Max Concurrent Positions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Max Concurrent Positions:</span>
                <span className="font-bold text-white tabular-nums">{params.maxOpenPositions}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={params.maxOpenPositions}
                onChange={(e) =>
                  setParams({
                    ...params,
                    riskProfile: 'Custom',
                    maxOpenPositions: parseInt(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500">
                Limits exposure to prevent over-diversification or correlated risk.
              </div>
            </div>
          </div>

          {/* Trailing Stop & Slippage Toggles */}
          <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={params.trailingStopEnabled}
                onChange={(e) =>
                  setParams({ ...params, riskProfile: 'Custom', trailingStopEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded accent-emerald-500 bg-neutral-950 border-neutral-700"
              />
              <span className="text-neutral-200">
                Arm Trailing Stop Loss ({params.trailingStopDistancePct}%)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Slippage Tolerance:</span>
              <span className="text-white font-bold">{params.slippageTolerancePct}%</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Parameters take effect immediately on next bot evaluation cycle.</span>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Parameters Applied Successfully!
              </span>
            )}
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Save Risk Parameters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
