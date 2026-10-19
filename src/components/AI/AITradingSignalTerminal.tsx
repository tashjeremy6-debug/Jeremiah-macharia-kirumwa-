import React from 'react';
import {
  AIAnalysisResult,
  AILogEntry,
  MarketData,
  RiskParameters,
  TradingSymbol,
} from '../../types/trading';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Shield,
  Zap,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
} from 'lucide-react';

interface AITradingSignalTerminalProps {
  symbol: TradingSymbol;
  marketData: MarketData;
  analysis: AIAnalysisResult | null;
  isLoadingAnalysis: boolean;
  onRefreshAnalysis: () => void;
  onExecuteProposal: (analysis: AIAnalysisResult) => void;
  aiLogs: AILogEntry[];
  riskParameters: RiskParameters;
  isBotActive: boolean;
}

export const AITradingSignalTerminal: React.FC<AITradingSignalTerminalProps> = ({
  symbol,
  marketData,
  analysis,
  isLoadingAnalysis,
  onRefreshAnalysis,
  onExecuteProposal,
  aiLogs,
  riskParameters,
  isBotActive,
}) => {
  const decimals = marketData.pipSize < 0.001 ? 5 : marketData.pipSize < 0.1 ? 3 : 2;

  const formatPrice = (val?: number) => {
    if (val === undefined || isNaN(val)) return '0.00';
    return val.toFixed(decimals);
  };

  const getActionBadge = () => {
    if (!analysis) return null;
    if (analysis.action === 'BUY') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          LONG (BUY)
        </div>
      );
    }
    if (analysis.action === 'SELL') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs">
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          SHORT (SELL)
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs">
        <Minus className="w-4 h-4 stroke-[2.5]" />
        HOLD / WAIT
      </div>
    );
  };

  const getTimingBanner = () => {
    if (!analysis) return null;
    const grade = analysis.timingGrade || 'OPTIMAL_NOW';

    if (grade === 'OPTIMAL_NOW') {
      return (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Optimal Entry Timing Confirmed
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                GRADE A SETUP
              </span>
            </div>
            <p className="text-xs text-neutral-200 font-medium leading-snug">
              {analysis.timingHeadline || 'High-probability technical confluence reached. Optimal trade entry window is active.'}
            </p>
          </div>
        </div>
      );
    }

    if (grade === 'WAIT_FOR_PULLBACK') {
      return (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Patience Advised: Wait for Pullback
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                RETEST PENDING
              </span>
            </div>
            <p className="text-xs text-neutral-200 font-medium leading-snug">
              {analysis.timingHeadline || 'Price is currently extended. Wait for retest of key EMA support to minimize risk.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300">
        <Clock className="w-4 h-4 text-neutral-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-neutral-200">Consolidation Phase</span>
          <p className="text-xs text-neutral-400">
            {analysis.timingHeadline || 'Market is ranging. Awaiting momentum volume expansion before entering.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AI Market Timing & Signal Engine</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                Gemini 3.8
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Target: <span className="font-semibold text-neutral-200">{symbol}</span> ({marketData.assetClass.toUpperCase()}) · Mode:{' '}
              <span className="text-emerald-400">{isBotActive ? 'Autonomous' : 'Semi-Auto'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRefreshAnalysis}
          disabled={isLoadingAnalysis}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingAnalysis ? 'animate-spin text-cyan-400' : ''}`} />
          {isLoadingAnalysis ? 'Evaluating...' : 'Rescan Timing'}
        </button>
      </div>

      {/* Main Signal Body */}
      <div className="p-4 space-y-4">
        {analysis ? (
          <>
            {/* Timing Banner */}
            {getTimingBanner()}

            {/* Decision Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
              <div className="flex items-center gap-3">
                {getActionBadge()}
                <div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Sentiment: <span className="text-neutral-200 font-semibold">{analysis.sentiment}</span>
                  </div>
                  <div className="text-xs text-neutral-300 font-medium">
                    {analysis.primaryTrigger}
                  </div>
                </div>
              </div>

              {/* Confidence & RR */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Confidence</div>
                  <div className="text-sm font-mono font-bold text-cyan-400 tabular-nums">
                    {analysis.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">Risk/Reward</div>
                  <div className="text-sm font-mono font-bold text-neutral-200 tabular-nums">
                    {analysis.riskRewardRatio}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Entry / SL / TP matrix with Pips info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-neutral-950/50 border border-neutral-800/80 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                  <Target className="w-3 h-3 text-cyan-400" />
                  Recommended Entry
                </div>
                <div className="text-xs font-mono font-bold text-white tabular-nums mt-1">
                  ${formatPrice(analysis.recommendedEntry)}
                </div>
              </div>

              <div className="p-2.5 bg-neutral-950/50 border border-neutral-800/80 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] font-mono text-rose-400">
                  <Shield className="w-3 h-3" />
                  Stop Loss ({riskParameters.defaultStopLossPct}%)
                </div>
                <div className="text-xs font-mono font-bold text-rose-400 tabular-nums mt-1">
                  ${formatPrice(analysis.stopLossPrice)}
                </div>
                {analysis.pipsRisk && (
                  <div className="text-[10px] font-mono text-rose-400/80 mt-0.5">
                    -{analysis.pipsRisk} pips risk
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-neutral-950/50 border border-neutral-800/80 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ArrowUpRight className="w-3 h-3" />
                  Take Profit ({riskParameters.defaultTakeProfitPct}%)
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums mt-1">
                  ${formatPrice(analysis.takeProfitPrice)}
                </div>
                {analysis.pipsTarget && (
                  <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
                    +{analysis.pipsTarget} pips target
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-neutral-950/50 border border-neutral-800/80 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Size & Leverage
                </div>
                <div className="text-xs font-mono font-bold text-amber-400 tabular-nums mt-1">
                  {analysis.suggestedAllocationPct}% · {analysis.suggestedLeverage}x
                </div>
              </div>
            </div>

            {/* Entry Timing Confluence Checklist */}
            <div className="p-3 bg-neutral-950/50 border border-neutral-800/80 rounded-lg space-y-2">
              <div className="text-[11px] font-mono font-semibold text-neutral-300 flex items-center justify-between">
                <span>Entry Timing Confluence Checklist:</span>
                <span className="text-[10px] text-neutral-500">{analysis.activeSession}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  {analysis.timingConfluences?.trendAligned ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span>Higher Trend Aligned</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  {analysis.timingConfluences?.momentumConfirm ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span>Momentum Signal Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  {analysis.timingConfluences?.sessionVolumeHigh ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span>Peak Session Liquidity</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  {analysis.timingConfluences?.keyLevelBounce ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span>Key Support/Resistance Level</span>
                </div>
              </div>
            </div>

            {/* Technical Rationale */}
            <div className="p-3 bg-neutral-950/40 border border-neutral-800/60 rounded-lg text-xs leading-relaxed text-neutral-300">
              <span className="font-semibold text-neutral-200">AI Quantitative Thesis: </span>
              {analysis.technicalRationale}
            </div>

            {/* Risk Warning Box */}
            <div className="flex items-start gap-2 p-2.5 bg-amber-950/20 border border-amber-800/30 rounded-lg text-[11px] text-amber-300/90 leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold">Risk Factor: </span>
                {analysis.riskWarning}
              </div>
            </div>

            {/* Manual Override Execute AI Proposal CTA */}
            {analysis.action !== 'HOLD' && (
              <button
                onClick={() => onExecuteProposal(analysis)}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  analysis.action === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99]'
                    : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.99]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Execute Trade: {analysis.direction} {symbol} ({analysis.suggestedAllocationPct}% Portfolio at {analysis.suggestedLeverage}x)
              </button>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-500">
            Analyzing indicators and entry timing for {symbol}...
          </div>
        )}

        {/* Live Bot Decision & Reasoning Stream */}
        <div className="border-t border-neutral-800/80 pt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
            <span>AI Reasoning & Execution Audit Log</span>
            <span className="text-[10px] text-neutral-500">Auto-Refreshes</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px] pr-1">
            {aiLogs.length === 0 ? (
              <div className="text-neutral-500 italic py-2">No audit events logged yet.</div>
            ) : (
              aiLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-1.5 rounded bg-neutral-950/60 border border-neutral-850 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500">{log.timestamp}</span>
                      <span
                        className={`font-bold px-1 rounded text-[9px] ${
                          log.action === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : log.action === 'SELL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                            : log.action === 'OVERRIDE'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : 'bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-neutral-200 font-semibold">{log.headline}</span>
                    </div>
                    <div className="text-neutral-400 text-[10px] pl-0.5">{log.details}</div>
                  </div>
                  {log.confidence && (
                    <span className="text-cyan-400 shrink-0 font-bold">{log.confidence}%</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
