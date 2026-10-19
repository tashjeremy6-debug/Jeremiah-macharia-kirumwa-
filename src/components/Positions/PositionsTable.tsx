import React, { useState } from 'react';
import {
  Position,
  OpenOrder,
  TradeHistoryItem,
  TradingSymbol,
} from '../../types/trading';
import {
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Repeat,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Shield,
  Layers,
} from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  openOrders: OpenOrder[];
  tradeHistory: TradeHistoryItem[];
  onClosePosition: (id: string, reason?: 'MANUAL_OVERRIDE' | 'PANIC_CLOSE') => void;
  onReversePosition: (id: string) => void;
  onPartialClosePosition: (id: string, pct: number) => void;
  onUpdatePositionSlTp: (id: string, sl?: number, tp?: number) => void;
  onCancelOrder: (id: string) => void;
  onClearHistory: () => void;
  onSelectSymbol: (symbol: TradingSymbol) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  openOrders,
  tradeHistory,
  onClosePosition,
  onReversePosition,
  onPartialClosePosition,
  onUpdatePositionSlTp,
  onCancelOrder,
  onClearHistory,
  onSelectSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editSl, setEditSl] = useState<string>('');
  const [editTp, setEditTp] = useState<string>('');

  const handleOpenEdit = (pos: Position) => {
    setEditingPosition(pos);
    setEditSl(pos.stopLossPrice?.toString() || '');
    setEditTp(pos.takeProfitPrice?.toString() || '');
  };

  const handleSaveSlTp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;
    const sl = parseFloat(editSl) || undefined;
    const tp = parseFloat(editTp) || undefined;
    onUpdatePositionSlTp(editingPosition.id, sl, tp);
    setEditingPosition(null);
  };

  return (
    <div className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800">
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md border border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'positions'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Active Positions</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'orders'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Open Orders</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded">
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Trade Ledger</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded">
              {tradeHistory.length}
            </span>
          </button>
        </div>

        {activeTab === 'history' && tradeHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[11px] font-mono text-neutral-500 hover:text-rose-400 transition-colors"
          >
            Clear Ledger
          </button>
        )}
      </div>

      {/* POSITIONS TAB */}
      {activeTab === 'positions' && (
        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-1">
              <Layers className="w-6 h-6 mx-auto stroke-1 text-neutral-600 mb-2" />
              <div className="font-semibold text-neutral-400">No Active Positions Open</div>
              <p className="text-[11px] text-neutral-500">
                The AI Bot is monitoring market conditions for high-probability setups, or you can place a manual trade.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950/60 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Asset / Side</th>
                  <th className="py-2.5 px-3 font-medium">Size</th>
                  <th className="py-2.5 px-3 font-medium">Entry / Mark</th>
                  <th className="py-2.5 px-3 font-medium">Liq. Price</th>
                  <th className="py-2.5 px-3 font-medium">Unrealized PnL</th>
                  <th className="py-2.5 px-3 font-medium">SL / TP Targets</th>
                  <th className="py-2.5 px-3 font-medium">Source</th>
                  <th className="py-2.5 px-4 font-medium text-right">Manual Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {positions.map((pos) => {
                  const isPositive = pos.unrealizedPnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-neutral-850/50 transition-colors">
                      {/* Asset & Side */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectSymbol(pos.symbol)}
                            className="font-bold text-white hover:text-cyan-400 transition-colors"
                          >
                            {pos.symbol}
                          </button>
                          <span
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'LONG'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {pos.side === 'LONG' ? (
                              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                            )}
                            {pos.side} {pos.leverage}x
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3">
                        <div className="text-white font-semibold tabular-nums">
                          ${pos.sizeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[10px] text-neutral-500 tabular-nums">
                          {pos.size.toFixed(4)} {pos.symbol.split('/')[0]}
                        </div>
                      </td>

                      {/* Entry vs Mark */}
                      <td className="py-3 px-3">
                        <div className="text-neutral-300 tabular-nums">
                          ${pos.entryPrice.toFixed(pos.entryPrice < 1 ? 4 : 2)}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-semibold tabular-nums">
                          ${pos.markPrice.toFixed(pos.markPrice < 1 ? 4 : 2)}
                        </div>
                      </td>

                      {/* Liq Price */}
                      <td className="py-3 px-3">
                        <span className="text-amber-400/90 font-medium tabular-nums">
                          ${pos.liquidationPrice.toFixed(pos.liquidationPrice < 1 ? 4 : 2)}
                        </span>
                      </td>

                      {/* Unrealized PnL */}
                      <td className="py-3 px-3">
                        <div
                          className={`font-bold tabular-nums ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] tabular-nums ${
                            isPositive ? 'text-emerald-400/80' : 'text-rose-400/80'
                          }`}
                        >
                          ({isPositive ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%)
                        </div>
                      </td>

                      {/* SL / TP */}
                      <td className="py-3 px-3 text-[10px]">
                        <div className="text-rose-400 tabular-nums">
                          SL: {pos.stopLossPrice ? `$${pos.stopLossPrice.toFixed(2)}` : 'None'}
                        </div>
                        <div className="text-emerald-400 tabular-nums">
                          TP: {pos.takeProfitPrice ? `$${pos.takeProfitPrice.toFixed(2)}` : 'None'}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            pos.source === 'AI_BOT'
                              ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {pos.source === 'AI_BOT' ? 'AI Bot' : 'Manual'}
                        </span>
                      </td>

                      {/* Manual Overrides */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit SL/TP */}
                          <button
                            onClick={() => handleOpenEdit(pos)}
                            title="Adjust Stop Loss / Take Profit"
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Partial Close 50% */}
                          <button
                            onClick={() => onPartialClosePosition(pos.id, 50)}
                            title="Take 50% Profit / De-risk"
                            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-neutral-300 hover:text-white transition-colors"
                          >
                            50%
                          </button>

                          {/* Reverse Position */}
                          <button
                            onClick={() => onReversePosition(pos.id)}
                            title={`Flip position to ${pos.side === 'LONG' ? 'SHORT' : 'LONG'}`}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 text-[10px] font-semibold text-amber-300 transition-colors"
                          >
                            <Repeat className="w-3 h-3" />
                            Flip
                          </button>

                          {/* Instant Market Close */}
                          <button
                            onClick={() => onClosePosition(pos.id, 'MANUAL_OVERRIDE')}
                            title="Market close position immediately"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-bold shadow-xs transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* OPEN ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto">
          {openOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No pending limit or stop orders.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950/60 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Asset / Side</th>
                  <th className="py-2.5 px-3 font-medium">Type</th>
                  <th className="py-2.5 px-3 font-medium">Limit Price</th>
                  <th className="py-2.5 px-3 font-medium">Amount</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {openOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">
                      {ord.symbol}{' '}
                      <span className={ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400">{ord.type}</td>
                    <td className="py-2.5 px-3 text-neutral-200 tabular-nums">
                      ${ord.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 tabular-nums">{ord.amount}</td>
                    <td className="py-2.5 px-3 text-amber-400 font-semibold">{ord.status}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onCancelOrder(ord.id)}
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-rose-900/40 text-neutral-300 hover:text-rose-300 text-[10px] font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TRADE HISTORY & AUDIT TAB */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto">
          {tradeHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No historical trades executed yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950/60 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Date & Asset</th>
                  <th className="py-2.5 px-3 font-medium">Side</th>
                  <th className="py-2.5 px-3 font-medium">Entry / Exit</th>
                  <th className="py-2.5 px-3 font-medium">Notional</th>
                  <th className="py-2.5 px-3 font-medium">Realized PnL</th>
                  <th className="py-2.5 px-3 font-medium">Closure Trigger</th>
                  <th className="py-2.5 px-4 font-medium">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {tradeHistory.map((th) => {
                  const isProfit = th.realizedPnl >= 0;
                  const dateStr = new Date(th.closedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={th.id} className="hover:bg-neutral-850/50 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-white">{th.symbol}</div>
                        <div className="text-[10px] text-neutral-500">{dateStr}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold ${
                            th.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {th.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 tabular-nums">
                        ${th.entryPrice.toFixed(2)} → ${th.exitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-200 tabular-nums">
                        ${th.sizeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold tabular-nums ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfit ? '+' : ''}${th.realizedPnl.toFixed(2)} ({isProfit ? '+' : ''}
                          {th.realizedPnlPct.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            th.source === 'AI_BOT'
                              ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                              : th.source === 'MANUAL_OVERRIDE'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : th.source === 'PANIC_CLOSE'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {th.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400 text-[10px]">
                        {th.notes || 'Normal strategy execution.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Edit SL/TP Inline Modal */}
      {editingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Adjust SL / TP Targets</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">{editingPosition.symbol}</span>
            </div>

            <div className="text-xs font-mono text-neutral-400">
              Entry: <span className="text-white">${editingPosition.entryPrice.toFixed(2)}</span> · Mark:{' '}
              <span className="text-cyan-400">${editingPosition.markPrice.toFixed(2)}</span>
            </div>

            <form onSubmit={handleSaveSlTp} className="space-y-3 font-mono">
              <div className="space-y-1">
                <label className="text-[11px] text-rose-400">Stop Loss Price (USDT)</label>
                <input
                  type="number"
                  step="any"
                  value={editSl}
                  onChange={(e) => setEditSl(e.target.value)}
                  placeholder="e.g. 64500"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-emerald-400">Take Profit Price (USDT)</label>
                <input
                  type="number"
                  step="any"
                  value={editTp}
                  onChange={(e) => setEditTp(e.target.value)}
                  placeholder="e.g. 71000"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
