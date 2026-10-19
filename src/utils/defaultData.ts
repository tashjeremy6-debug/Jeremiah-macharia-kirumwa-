import {
  AssetClass,
  TradingSymbol,
  MarketData,
  RiskParameters,
  BotConfig,
  Position,
  TradeHistoryItem,
} from '../types/trading';
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  generateCandles,
} from './technicalIndicators';

interface InitialPairConfig {
  symbol: TradingSymbol;
  name: string;
  assetClass: AssetClass;
  basePrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  pipSize: number;
}

const initialConfigs: InitialPairConfig[] = [
  // Crypto
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    assetClass: 'crypto',
    basePrice: 67420.50,
    change24h: 3.12,
    high24h: 68150.00,
    low24h: 65200.00,
    volume24h: '$28.4B',
    pipSize: 1.0,
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    assetClass: 'crypto',
    basePrice: 3485.20,
    change24h: 4.85,
    high24h: 3540.00,
    low24h: 3310.00,
    volume24h: '$16.2B',
    pipSize: 0.1,
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    assetClass: 'crypto',
    basePrice: 178.60,
    change24h: -1.24,
    high24h: 184.50,
    low24h: 174.10,
    volume24h: '$5.7B',
    pipSize: 0.01,
  },
  {
    symbol: 'BNB/USDT',
    name: 'BNB',
    assetClass: 'crypto',
    basePrice: 588.30,
    change24h: 1.15,
    high24h: 595.00,
    low24h: 581.00,
    volume24h: '$1.8B',
    pipSize: 0.01,
  },
  {
    symbol: 'AVAX/USDT',
    name: 'Avalanche',
    assetClass: 'crypto',
    basePrice: 31.45,
    change24h: 6.30,
    high24h: 32.80,
    low24h: 29.20,
    volume24h: '$940M',
    pipSize: 0.001,
  },
  {
    symbol: 'XRP/USDT',
    name: 'XRP',
    assetClass: 'crypto',
    basePrice: 0.5842,
    change24h: 0.72,
    high24h: 0.6020,
    low24h: 0.5750,
    volume24h: '$1.2B',
    pipSize: 0.0001,
  },

  // Forex
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'forex',
    basePrice: 1.0864,
    change24h: 0.28,
    high24h: 1.0895,
    low24h: 1.0832,
    volume24h: '$420B',
    pipSize: 0.0001,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    assetClass: 'forex',
    basePrice: 1.2945,
    change24h: 0.42,
    high24h: 1.2985,
    low24h: 1.2890,
    volume24h: '$280B',
    pipSize: 0.0001,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    assetClass: 'forex',
    basePrice: 152.35,
    change24h: -0.34,
    high24h: 153.10,
    low24h: 151.80,
    volume24h: '$340B',
    pipSize: 0.01,
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    assetClass: 'forex',
    basePrice: 0.6625,
    change24h: 0.18,
    high24h: 0.6655,
    low24h: 0.6598,
    volume24h: '$110B',
    pipSize: 0.0001,
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    assetClass: 'forex',
    basePrice: 1.3850,
    change24h: -0.15,
    high24h: 1.3890,
    low24h: 1.3820,
    volume24h: '$95B',
    pipSize: 0.0001,
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold (Spot) / US Dollar',
    assetClass: 'forex',
    basePrice: 2718.50,
    change24h: 0.85,
    high24h: 2735.00,
    low24h: 2698.00,
    volume24h: '$180B',
    pipSize: 0.1,
  },
];

export function buildInitialMarketData(): Record<TradingSymbol, MarketData> {
  const result: Partial<Record<TradingSymbol, MarketData>> = {};

  initialConfigs.forEach((cfg) => {
    const candles = generateCandles(cfg.basePrice, 50, 60);
    const closes = candles.map((c) => c.close);
    const ema20Arr = calculateEMA(closes, 20);
    const ema50Arr = calculateEMA(closes, 50);

    result[cfg.symbol] = {
      symbol: cfg.symbol,
      name: cfg.name,
      assetClass: cfg.assetClass,
      price: cfg.basePrice,
      change24h: cfg.change24h,
      high24h: cfg.high24h,
      low24h: cfg.low24h,
      volume24h: cfg.volume24h,
      pipSize: cfg.pipSize,
      rsi: calculateRSI(closes, 14),
      ema20: ema20Arr[ema20Arr.length - 1],
      ema50: ema50Arr[ema50Arr.length - 1],
      macd: calculateMACD(closes),
      bollinger: calculateBollingerBands(closes, 20, 2),
      candles,
    };
  });

  return result as Record<TradingSymbol, MarketData>;
}

export const defaultRiskParameters: RiskParameters = {
  riskProfile: 'Moderate',
  maxDrawdownLimitPct: 5.0,
  maxAllocationPerTradePct: 15.0,
  defaultStopLossPct: 2.5,
  defaultTakeProfitPct: 6.0,
  maxLeverage: 3,
  trailingStopEnabled: true,
  trailingStopDistancePct: 1.5,
  slippageTolerancePct: 0.2,
  dailyLossHaltPct: 4.0,
  maxOpenPositions: 3,
  cooldownBetweenTradesSec: 25,
  sentimentFilterEnabled: true,
  minSentimentThreshold: 55,
  newsWeightPct: 35,
};

export const defaultBotConfig: BotConfig = {
  status: 'active',
  mode: 'autonomous',
  strategy: 'Adaptive Multi-Factor AI',
  scanIntervalSeconds: 15,
  minConfidenceThreshold: 72,
  circuitBreakerTriggered: false,
};

export const initialPositions: Position[] = [
  {
    id: 'pos-init-1',
    symbol: 'BTC/USDT',
    assetClass: 'crypto',
    side: 'LONG',
    entryPrice: 66200.00,
    markPrice: 67420.50,
    size: 0.15,
    sizeUsd: 10113.07,
    margin: 3371.02,
    leverage: 3,
    liquidationPrice: 44354.00,
    unrealizedPnl: 183.07,
    unrealizedPnlPct: 5.43,
    stopLossPrice: 64545.00,
    takeProfitPrice: 70172.00,
    trailingStopPct: 1.5,
    createdAt: Date.now() - 4200000,
    source: 'AI_BOT',
    strategyName: 'Adaptive Multi-Factor AI',
  },
  {
    id: 'pos-init-2',
    symbol: 'EUR/USD',
    assetClass: 'forex',
    side: 'LONG',
    entryPrice: 1.0835,
    markPrice: 1.0864,
    size: 0.5, // 0.5 standard lot = $50,000 notional
    sizeUsd: 54320,
    margin: 1086.40,
    leverage: 50,
    liquidationPrice: 1.0620,
    unrealizedPnl: 145.00,
    unrealizedPnlPct: 13.34,
    pipsPnl: 29.0,
    stopLossPrice: 1.0815,
    takeProfitPrice: 1.0920,
    trailingStopPct: 1.0,
    createdAt: Date.now() - 3600000,
    source: 'AI_BOT',
    strategyName: 'Forex London/NY Breakout',
  },
];

export const initialTradeHistory: TradeHistoryItem[] = [
  {
    id: 'th-forex-1',
    symbol: 'GBP/USD',
    assetClass: 'forex',
    side: 'LONG',
    entryPrice: 1.2890,
    exitPrice: 1.2940,
    size: 0.4,
    sizeUsd: 51760,
    realizedPnl: 200.00,
    realizedPnlPct: 7.72,
    pipsGained: 50,
    fee: 3.50,
    closedAt: Date.now() - 10800000,
    source: 'AI_BOT',
    strategy: 'Forex London/NY Breakout',
    notes: 'Optimal entry triggered during London Open volume surge. Hit +50 pips TP target.',
  },
  {
    id: 'th-1',
    symbol: 'SOL/USDT',
    assetClass: 'crypto',
    side: 'LONG',
    entryPrice: 168.40,
    exitPrice: 181.20,
    size: 25,
    sizeUsd: 4530,
    realizedPnl: 320.00,
    realizedPnlPct: 7.60,
    fee: 4.53,
    closedAt: Date.now() - 18000000,
    source: 'AI_BOT',
    strategy: 'Momentum Scalper',
    notes: 'Take-Profit target hit automatically after breakout volume surge.',
  },
  {
    id: 'th-2',
    symbol: 'BTC/USDT',
    assetClass: 'crypto',
    side: 'SHORT',
    entryPrice: 68100.00,
    exitPrice: 67350.00,
    size: 0.12,
    sizeUsd: 8082,
    realizedPnl: 90.00,
    realizedPnlPct: 1.10,
    fee: 8.08,
    closedAt: Date.now() - 32400000,
    source: 'MANUAL_OVERRIDE',
    notes: 'Manual market override executed before high-impact economic CPI release.',
  },
];
