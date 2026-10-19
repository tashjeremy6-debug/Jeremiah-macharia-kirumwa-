import React from 'react';
import {
  Compass,
  CheckCircle2,
  Shield,
  Zap,
  ArrowRight,
  X,
  HelpCircle,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { RiskProfile } from '../../types/trading';

interface BeginnerGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBeginnerPreset: () => void;
  onActivateAutonomousMode: () => void;
}

export const BeginnerGuide: React.FC<BeginnerGuideProps> = ({
  isOpen,
  onClose,
  onApplyBeginnerPreset,
  onActivateAutonomousMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-neutral-900/90 border-b border-neutral-800 p-4 sm:p-5 relative animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Beginner Fast-Track · How to Start Trading in 3 Simple Steps</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Zero Experience Required
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                AetherTrade combines AI quantitative algorithms and automated risk rules so beginners can trade without emotional errors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Visual Path */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>Pick Your Asset</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Use the top asset switcher to choose between <strong className="text-neutral-200">Crypto</strong> (Bitcoin, Ethereum, Solana) or <strong className="text-neutral-200">Forex</strong> (EUR/USD, GBP/USD, Gold).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Check "Optimal Timing"</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Look at the <strong className="text-emerald-400">Optimal Entry Timing Radar</strong>. Wait until it displays <strong className="text-emerald-400">"OPTIMAL NOW"</strong> with green confluence checks before entering.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Let Bot Trade or 1-Click</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Click <strong className="text-white">"Execute AI Trade"</strong> or turn on <strong className="text-emerald-400">"Bot: Active"</strong>. Your Stop-Loss is pre-set automatically so you never lose more than 2%!
            </p>
          </div>
        </div>

        {/* 1-Click Actions & Jargon Buster */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="text-white font-bold">Quick Presets:</span>
            <button
              onClick={onApplyBeginnerPreset}
              className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Apply Beginner Safe Risk (2% Max Risk · 2x Leverage)
            </button>
            <button
              onClick={onActivateAutonomousMode}
              className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Start Automated AI Bot
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-3 font-mono">
            <span>🛡️ Stop Loss: Protects from big drops</span>
            <span>🎯 Take Profit: Locks in gains</span>
            <span>🚨 Panic Button: Instant emergency exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
