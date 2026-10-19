export type AssetClass = 'crypto' | 'forex';

export type CryptoSymbol =
  | 'BTC/USDT'
  | 'ETH/USDT'
  | 'SOL/USDT'
  | 'BNB/USDT'
  | 'AVAX/USDT'
  | 'XRP/USDT';

export type ForexSymbol =
  | 'EUR/USD'
  | 'GBP/USD'
  | 'USD/JPY'
  | 'AUD/USD'
  | 'USD/CAD'
  | 'XAU/USD';

export type TradingSymbol = CryptoSymbol | ForexSymbol;

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: TradingSymbol;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  pipSize: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  candles: Candle[];
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  imbalance: number;
}

export interface TapeTrade {
  id: string;
  time: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

export interface Position {
  id: string;
  symbol: TradingSymbol;
  assetClass: AssetClass;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  markPrice: number;
  size: number;
  sizeUsd: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  pipsPnl?: number;
  trailingStopPct?: number;
  createdAt: number;
  source: 'AI_BOT' | 'MANUAL';
  strategyName?: string;
}

export interface OpenOrder {
  id: string;
  symbol: TradingSymbol;
  assetClass: AssetClass;
  type: 'LIMIT' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  createdAt: number;
  source: 'AI_BOT' | 'MANUAL';
}

export interface TradeHistoryItem {
  id: string;
  symbol: TradingSymbol;
  assetClass: AssetClass;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  sizeUsd: number;
  realizedPnl: number;
  realizedPnlPct: number;
  pipsGained?: number;
  fee: number;
  closedAt: number;
  source: 'AI_BOT' | 'MANUAL_OVERRIDE' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'PANIC_CLOSE';
  strategy?: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// News & Social Media Sentiment Models
// -----------------------------------------------------------------------------
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  symbol?: TradingSymbol | 'MARKET';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  summary: string;
  socialEngagement: string;
  viralScore: number; // 1-100
}

export interface SocialTrendTopic {
  id: string;
  hashtag: string;
  platform: 'X (Twitter)' | 'Reddit' | 'Telegram' | 'Bloomberg Wire';
  mentions24h: string;
  sentimentScore: number; // -100 to +100
  sentimentLabel: 'Extremely Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Extreme FUD';
  velocity: string;
}

export interface MarketSentimentOverview {
  fearAndGreedIndex: number; // 0 to 100
  fearAndGreedLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  aggregateSentimentScore: number; // -100 to +100
  bullishPercentage: number;
  bearishPercentage: number;
  neutralPercentage: number;
  socialBuzzVolume: string; // e.g. "1.42M posts / 24h"
  newsSentimentShift: '+12% vs yesterday';
}

export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive' | 'Custom';

export interface RiskParameters {
  riskProfile: RiskProfile;
  maxDrawdownLimitPct: number;
  maxAllocationPerTradePct: number;
  defaultStopLossPct: number;
  defaultTakeProfitPct: number;
  maxLeverage: number;
  trailingStopEnabled: boolean;
  trailingStopDistancePct: number;
  slippageTolerancePct: number;
  dailyLossHaltPct: number;
  maxOpenPositions: number;
  cooldownBetweenTradesSec: number;
  // Sentiment controls
  sentimentFilterEnabled: boolean;
  minSentimentThreshold: number; // e.g. 55% bullish required for longs
  newsWeightPct: number; // Weight of news/social in AI decision (e.g. 30%)
}

export interface BotConfig {
  status: 'active' | 'paused';
  mode: 'autonomous' | 'signal_only';
  strategy:
    | 'Adaptive Multi-Factor AI'
    | 'Forex London/NY Breakout'
    | 'News Sentiment & Momentum Rider'
    | 'Trend Rider EMA Cross'
    | 'Mean Reversion Bands';
  scanIntervalSeconds: number;
  minConfidenceThreshold: number;
  circuitBreakerTriggered?: boolean;
}

export type EntryTimingGrade =
  | 'OPTIMAL_NOW'
  | 'WAIT_FOR_PULLBACK'
  | 'APPROACHING_KEY_ZONE'
  | 'OVEREXTENDED_AVOID';

export interface AIAnalysisResult {
  action: 'BUY' | 'SELL' | 'HOLD';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  sentiment: string;
  recommendedEntry: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: string;
  suggestedLeverage: number;
  suggestedAllocationPct: number;
  primaryTrigger: string;
  technicalRationale: string;
  riskWarning: string;
  // Timing
  timingGrade: EntryTimingGrade;
  timingHeadline: string;
  timingConfluences: {
    trendAligned: boolean;
    momentumConfirm: boolean;
    sessionVolumeHigh: boolean;
    keyLevelBounce: boolean;
    socialSentimentAligned?: boolean;
  };
  pipsTarget?: number;
  pipsRisk?: number;
  activeSession: string;
  // Integrated News & Social Sentiment Data
  sentimentScore: number; // -100 to +100
  sentimentAlignment: 'ALIGNED_BULLISH' | 'ALIGNED_BEARISH' | 'SENTIMENT_DIVERGENCE_RISK' | 'NEUTRAL';
  socialBuzzSummary: string;
  headlineCatalyst: string;
  newsImpactRating: 'HIGH_CATALYST' | 'MODERATE' | 'LOW_NOISE';
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  symbol: TradingSymbol;
  action: 'BUY' | 'SELL' | 'HOLD' | 'SYSTEM' | 'OVERRIDE';
  headline: string;
  details: string;
  confidence?: number;
  sentimentBadge?: string;
}

export interface ChartExecutionMarker {
  id: string;
  time: number;
  symbol: TradingSymbol;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  source: 'AI_BOT' | 'MANUAL';
  label: string;
}

export interface InAppNotification {
  id: string;
  type: 'TRADE_FILLED' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'PANIC' | 'ALERT';
  title: string;
  message: string;
  timestamp: string;
  symbol?: TradingSymbol;
  pnl?: number;
}


