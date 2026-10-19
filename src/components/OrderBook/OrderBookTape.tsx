import React, { useState } from 'react';
import { OrderBook, TapeTrade } from '../../types/trading';

interface OrderBookTapeProps {
  orderBook: OrderBook;
  tapeTrades: TapeTrade[];
  currentPrice: number;
}

export const OrderBookTape: React.FC<OrderBookTapeProps> = ({
  orderBook,
  tapeTrades,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'tape'>('book');

  const maxBidTotal = orderBook.bids[orderBook.bids.length - 1]?.total || 1;
  const maxAskTotal = orderBook.asks[orderBook.asks.length - 1]?.total || 1;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/80">
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md border border-neutral-800">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'book'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setActiveTab('tape')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'tape'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Recent Trades
          </button>
        </div>

        <div className="text-[10px] font-mono text-neutral-400">
          Spread: <span className="text-neutral-200">${orderBook.spread.toFixed(2)}</span>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="flex flex-col flex-1 p-2 text-[11px] font-mono select-none">
          {/* Table Header */}
          <div className="grid grid-cols-3 text-neutral-500 pb-1.5 px-2 border-b border-neutral-800/60 text-[10px]">
            <span>Price (USDT)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sells) - Reversed so lowest ask is closest to mid */}
          <div className="flex flex-col justify-end py-1 space-y-0.5 overflow-hidden">
            {orderBook.asks.slice(0, 6).reverse().map((ask, i) => {
              const depthPct = (ask.total / maxTotal) * 100;
              return (
                <div
                  key={`ask-${i}`}
                  className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-neutral-800/50 rounded transition-colors"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-rose-400 font-semibold tabular-nums z-10">
                    ${ask.price.toFixed(ask.price < 1 ? 4 : 2)}
                  </span>
                  <span className="text-right text-neutral-300 tabular-nums z-10">
                    {ask.amount.toFixed(4)}
                  </span>
                  <span className="text-right text-neutral-500 tabular-nums z-10">
                    {ask.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mid Market Price Indicator */}
          <div className="flex items-center justify-between px-3 py-1.5 my-1 bg-neutral-950/80 border-y border-neutral-800 rounded">
            <span className="text-xs font-bold text-white font-mono tabular-nums">
              ${currentPrice.toFixed(currentPrice < 1 ? 4 : 2)}
            </span>
            <span className="text-[10px] text-neutral-400">
              Buyer Depth:{' '}
              <span className="text-emerald-400 font-semibold">
                {(orderBook.imbalance * 100).toFixed(0)}%
              </span>
            </span>
          </div>

          {/* Bids (Buys) */}
          <div className="flex flex-col py-1 space-y-0.5 overflow-hidden">
            {orderBook.bids.slice(0, 6).map((bid, i) => {
              const depthPct = (bid.total / maxTotal) * 100;
              return (
                <div
                  key={`bid-${i}`}
                  className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-neutral-800/50 rounded transition-colors"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none rounded-r"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-emerald-400 font-semibold tabular-nums z-10">
                    ${bid.price.toFixed(bid.price < 1 ? 4 : 2)}
                  </span>
                  <span className="text-right text-neutral-300 tabular-nums z-10">
                    {bid.amount.toFixed(4)}
                  </span>
                  <span className="text-right text-neutral-500 tabular-nums z-10">
                    {bid.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Live Tape view */
        <div className="flex flex-col flex-1 p-2 text-[11px] font-mono select-none overflow-y-auto max-h-[360px]">
          <div className="grid grid-cols-3 text-neutral-500 pb-1.5 px-2 border-b border-neutral-800/60 text-[10px]">
            <span>Time</span>
            <span className="text-center">Price</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="flex flex-col py-1 space-y-1">
            {tapeTrades.slice(0, 14).map((trade) => (
              <div
                key={trade.id}
                className="grid grid-cols-3 px-2 py-0.5 hover:bg-neutral-800/40 rounded transition-colors"
              >
                <span className="text-neutral-500 text-[10px]">{trade.time}</span>
                <span
                  className={`text-center font-semibold tabular-nums ${
                    trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${trade.price.toFixed(trade.price < 1 ? 4 : 2)}
                </span>
                <span className="text-right text-neutral-300 tabular-nums">
                  {trade.amount.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
