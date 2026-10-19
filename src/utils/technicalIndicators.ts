import { Candle, CryptoSymbol, OrderBook, TapeTrade } from '../types/trading';

// Calculate Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

// Calculate Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let currentEma = data[0] || 0;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      currentEma = data[i];
    } else {
      currentEma = data[i] * k + currentEma * (1 - k);
    }
    ema.push(Number(currentEma.toFixed(2)));
  }
  return ema;
}

// Calculate RSI (14)
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Number(rsi.toFixed(1));
}

// Calculate MACD (12, 26, 9)
export function calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  if (closes.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  const signalLine = calculateEMA(macdLine, 9);
  const latestMacd = macdLine[macdLine.length - 1];
  const latestSignal = signalLine[signalLine.length - 1];
  const histogram = latestMacd - latestSignal;

  return {
    macd: Number(latestMacd.toFixed(2)),
    signal: Number(latestSignal.toFixed(2)),
    histogram: Number(histogram.toFixed(2)),
  };
}

// Calculate Bollinger Bands
export function calculateBollingerBands(closes: number[], period: number = 20, multiplier: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  if (closes.length < period) {
    const last = closes[closes.length - 1] || 100;
    return { upper: last * 1.02, middle: last, lower: last * 0.98 };
  }

  const slice = closes.slice(closes.length - period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Number((mean + multiplier * stdDev).toFixed(2)),
    middle: Number(mean.toFixed(2)),
    lower: Number((mean - multiplier * stdDev).toFixed(2)),
  };
}

// Generate Realistic Historical Candles
export function generateCandles(basePrice: number, count: number = 60, intervalSec: number = 60): Candle[] {
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 1000);
  let currentPrice = basePrice * (1 - (Math.random() * 0.04 - 0.02));

  for (let i = count; i >= 0; i--) {
    const time = now - i * intervalSec;
    const volatility = currentPrice * 0.0035;
    const drift = (Math.random() - 0.495) * volatility;
    
    const open = currentPrice;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.random() * volatility * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * 0.8;
    const volume = Number((basePrice * 0.15 * (0.6 + Math.random() * 0.8)).toFixed(2));

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

// Generate Realistic Order Book Depth
export function generateOrderBook(currentPrice: number): OrderBook {
  const tick = currentPrice > 1000 ? 0.5 : currentPrice > 10 ? 0.01 : 0.0001;
  const bids = [];
  const asks = [];

  let cumBidTotal = 0;
  for (let i = 1; i <= 10; i++) {
    const price = Number((currentPrice - i * tick * (1 + i * 0.1)).toFixed(2));
    const amount = Number((Math.random() * 2.5 + 0.3 * (11 - i)).toFixed(4));
    cumBidTotal += amount;
    bids.push({ price, amount, total: Number(cumBidTotal.toFixed(4)) });
  }

  let cumAskTotal = 0;
  for (let i = 1; i <= 10; i++) {
    const price = Number((currentPrice + i * tick * (1 + i * 0.1)).toFixed(2));
    const amount = Number((Math.random() * 2.5 + 0.3 * (11 - i)).toFixed(4));
    cumAskTotal += amount;
    asks.push({ price, amount, total: Number(cumAskTotal.toFixed(4)) });
  }

  const spread = Number((asks[0].price - bids[0].price).toFixed(2));
  const totalBids = bids.reduce((acc, b) => acc + b.amount, 0);
  const totalAsks = asks.reduce((acc, a) => acc + a.amount, 0);
  const imbalance = Number((totalBids / (totalBids + totalAsks || 1)).toFixed(3));

  return { bids, asks, spread, imbalance };
}

// Generate Initial Tape Trades
export function generateTapeTrades(currentPrice: number, count: number = 12): TapeTrade[] {
  const trades: TapeTrade[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const date = new Date(now - (count - i) * 1200);
    const time = date.toTimeString().split(' ')[0];
    const side = Math.random() > 0.48 ? 'buy' : 'sell';
    const offset = (Math.random() - 0.5) * (currentPrice * 0.0008);
    const price = Number((currentPrice + offset).toFixed(2));
    const amount = Number((Math.random() * 1.8 + 0.05).toFixed(4));

    trades.unshift({
      id: `trade-${now}-${i}`,
      time,
      price,
      amount,
      side,
    });
  }

  return trades;
}
