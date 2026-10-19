import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AssetClass,
  BotConfig,
  MarketData,
  OpenOrder,
  OrderBook,
  Position,
  RiskParameters,
  TapeTrade,
  TradeHistoryItem,
  TradingSymbol,
  AIAnalysisResult,
  AILogEntry,
  NewsArticle,
  ChartExecutionMarker,
  InAppNotification,
} from './types/trading';
import {
  buildInitialMarketData,
  defaultBotConfig,
  defaultRiskParameters,
  initialPositions,
  initialTradeHistory,
} from './utils/defaultData';
import {
  generateOrderBook,
  generateTapeTrades,
} from './utils/technicalIndicators';
import {
  initialNewsArticles,
  initialSentimentOverview,
  initialSocialTrends,
} from './utils/sentimentData';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  NotificationPermissionState,
} from './utils/notifications';

import { Header } from './components/Header';
import { TradingViewReel } from './components/TradingView/TradingViewReel';
import { TickerBar } from './components/TickerBar';
import { CandleChart } from './components/Chart/CandleChart';
import { OrderBookTape } from './components/OrderBook/OrderBookTape';
import { AITradingSignalTerminal } from './components/AI/AITradingSignalTerminal';
import { ManualTradeTerminal } from './components/Trade/ManualTradeTerminal';
import { PositionsTable } from './components/Positions/PositionsTable';
import { RiskConfigModal } from './components/Risk/RiskConfigModal';
import { AICopilotModal } from './components/AI/AICopilotModal';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { BacktestView } from './components/Backtest/BacktestView';
import { NewsSentimentModule } from './components/Sentiment/NewsSentimentModule';
import { NotificationToasts } from './components/Notifications/NotificationToasts';
import { BeginnerGuide } from './components/Beginner/BeginnerGuide';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'terminal' | 'portfolio' | 'risk' | 'copilot' | 'backtest'>('terminal');
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState<TradingSymbol>('BTC/USDT');

  // Core Market & Simulator State
  const [markets, setMarkets] = useState<Record<TradingSymbol, MarketData>>(() => buildInitialMarketData());
  const [priceFlashMap, setPriceFlashMap] = useState<Record<TradingSymbol, 'up' | 'down' | null>>({} as any);
  const [orderBooks, setOrderBooks] = useState<Record<TradingSymbol, OrderBook>>({} as any);
  const [tapeTrades, setTapeTrades] = useState<Record<TradingSymbol, TapeTrade[]>>({} as any);

  // Portfolio & Accounting
  const [cashBalance, setCashBalance] = useState<number>(39800.00);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(initialTradeHistory);

  // Risk & Bot Configuration
  const [riskParameters, setRiskParameters] = useState<RiskParameters>(defaultRiskParameters);
  const [botConfig, setBotConfig] = useState<BotConfig>(defaultBotConfig);

  // AI Analysis State
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [aiLogs, setAiLogs] = useState<AILogEntry[]>([
    {
      id: 'log-1',
      timestamp: '08:14:22',
      symbol: 'BTC/USDT',
      action: 'BUY',
      headline: 'Institutional Order Flow Inflow Confirmed',
      details: 'RSI bounce from 54.2 with expanding buyer order depth. Stop Loss armed at $64,545.',
      confidence: 88,
    },
    {
      id: 'log-2',
      timestamp: '08:10:05',
      symbol: 'EUR/USD',
      action: 'SYSTEM',
      headline: 'London Session Volatility Monitored',
      details: 'Forex liquidity depth optimal. Key resistance observed at 1.0890.',
      confidence: 82,
    },
  ]);

  // News & Social Media Sentiment
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(initialNewsArticles);
  const [socialTrends, setSocialTrends] = useState(initialSocialTrends);
  const [sentimentOverview, setSentimentOverview] = useState(initialSentimentOverview);

  // Audio & Notification System State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>('default');
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState<boolean>(true);

  // TradingView Pinned Chart Execution Markers
  const [chartExecutionMarkers, setChartExecutionMarkers] = useState<ChartExecutionMarker[]>([
    {
      id: 'm-init-1',
      time: Math.floor(Date.now() / 1000) - 3600,
      symbol: 'BTC/USDT',
      side: 'BUY',
      price: 66200.00,
      amount: 0.15,
      source: 'AI_BOT',
      label: 'BUY 0.15',
    },
    {
      id: 'm-init-2',
      time: Math.floor(Date.now() / 1000) - 1800,
      symbol: 'EUR/USD',
      side: 'BUY',
      price: 1.0835,
      amount: 0.5,
      source: 'AI_BOT',
      label: 'BUY 0.5 Lots',
    },
  ]);

  // Audio synthesizer for feedback
  const playChime = useCallback((type: 'success' | 'alert' | 'panic') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'panic') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Notification Helper: Dispatches both Browser Notification API + In-App Toast
  const dispatchAlert = useCallback(
    (alert: {
      type: 'TRADE_FILLED' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'PANIC' | 'ALERT';
      title: string;
      message: string;
      symbol?: TradingSymbol;
      price?: number;
      amount?: number | string;
      pnl?: number;
    }) => {
      // 1. Dispatch real browser push notification via Notification API
      sendBrowserNotification({
        type: alert.type,
        symbol: alert.symbol || selectedSymbol,
        side: alert.type === 'TRADE_FILLED' ? 'BUY' : undefined,
        price: alert.price,
        amount: alert.amount,
        pnl: alert.pnl,
        message: alert.message,
      });

      // 2. Dispatch in-app floating toast
      const newToast: InAppNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        symbol: alert.symbol,
        pnl: alert.pnl,
      };

      setInAppNotifications((prev) => [newToast, ...prev.slice(0, 4)]);

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setInAppNotifications((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    },
    [selectedSymbol]
  );

  // Initialize Notification Permission on Mount
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      dispatchAlert({
        type: 'ALERT',
        title: 'Browser Notifications Enabled',
        message: 'You will receive real-time desktop alerts when trades execute or hit SL/TP levels.',
      });
      playChime('success');
    }
  };

  const handleSendTestNotification = () => {
    dispatchAlert({
      type: 'TRADE_FILLED',
      title: `Test Alert: AI Trade Executed`,
      message: `Simulated order filled on ${selectedSymbol} at $${markets[selectedSymbol]?.price.toFixed(2)}.`,
      symbol: selectedSymbol,
      price: markets[selectedSymbol]?.price,
      amount: 0.1,
    });
    playChime('success');
  };

  // Initialize OrderBooks and Tapes for all symbols
  useEffect(() => {
    const initialBooks: Record<TradingSymbol, OrderBook> = {} as any;
    const initialTapes: Record<TradingSymbol, TapeTrade[]> = {} as any;

    Object.keys(markets).forEach((sym) => {
      const s = sym as TradingSymbol;
      initialBooks[s] = generateOrderBook(markets[s].price);
      initialTapes[s] = generateTapeTrades(markets[s].price, 12);
    });

    setOrderBooks(initialBooks);
    setTapeTrades(initialTapes);
  }, []);

  const handleSelectAssetClass = (ac: AssetClass) => {
    setSelectedAssetClass(ac);
    if (ac === 'forex' && markets[selectedSymbol]?.assetClass !== 'forex') {
      setSelectedSymbol('EUR/USD');
    } else if (ac === 'crypto' && markets[selectedSymbol]?.assetClass !== 'crypto') {
      setSelectedSymbol('BTC/USDT');
    }
  };

  // ---------------------------------------------------------------------------
  // Real-Time Price Simulation Engine (Brownian Drift + Volatility)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) => {
        const next = { ...prev };
        const flashMap: Record<TradingSymbol, 'up' | 'down' | null> = {} as any;

        (Object.keys(next) as TradingSymbol[]).forEach((sym) => {
          const item = next[sym];
          const volatility = item.price * (item.assetClass === 'forex' ? 0.0003 : 0.0018);
          const drift = (Math.random() - 0.495) * volatility;
          const newPrice = Math.max(0.0001, item.price + drift);
          const isUp = newPrice >= item.price;

          flashMap[sym] = isUp ? 'up' : 'down';

          const candles = [...item.candles];
          const lastCandle = { ...candles[candles.length - 1] };
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          lastCandle.volume += Number((Math.random() * 0.4 + 0.1).toFixed(2));
          candles[candles.length - 1] = lastCandle;

          next[sym] = {
            ...item,
            price: newPrice,
            candles,
            high24h: Math.max(item.high24h, newPrice),
            low24h: Math.min(item.low24h, newPrice),
          };
        });

        setPriceFlashMap(flashMap);
        setTimeout(() => setPriceFlashMap({} as any), 800);
        return next;
      });

      // Update Order Book and Tape for selected symbol
      if (selectedSymbol && markets[selectedSymbol]) {
        const curPrice = markets[selectedSymbol].price;
        setOrderBooks((prev) => ({
          ...prev,
          [selectedSymbol]: generateOrderBook(curPrice),
        }));

        setTapeTrades((prev) => {
          const oldTrades = prev[selectedSymbol] || [];
          const nowStr = new Date().toTimeString().split(' ')[0];
          const newTrade: TapeTrade = {
            id: `trade-${Date.now()}`,
            time: nowStr,
            price: curPrice,
            amount: Number((Math.random() * 1.5 + 0.05).toFixed(4)),
            side: Math.random() > 0.48 ? 'buy' : 'sell',
          };
          return {
            ...prev,
            [selectedSymbol]: [newTrade, ...oldTrades.slice(0, 18)],
          };
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedSymbol, markets]);

  // ---------------------------------------------------------------------------
  // Mark Price & PnL Sync for Active Positions + SL/TP Auto Execution
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        const curMarket = markets[pos.symbol];
        if (!curMarket) return pos;

        const markPrice = curMarket.price;
        const priceDiff = pos.side === 'LONG' ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
        const pnl = priceDiff * pos.size;
        const pnlPct = (pnl / (pos.margin || 1)) * 100;
        const pipsPnl = curMarket.pipSize > 0 ? Math.round(priceDiff / curMarket.pipSize) : undefined;

        // Auto Stop-Loss Check
        if (
          pos.stopLossPrice &&
          ((pos.side === 'LONG' && markPrice <= pos.stopLossPrice) ||
            (pos.side === 'SHORT' && markPrice >= pos.stopLossPrice))
        ) {
          handleClosePosition(pos.id, 'STOP_LOSS');
        }

        // Auto Take-Profit Check
        if (
          pos.takeProfitPrice &&
          ((pos.side === 'LONG' && markPrice >= pos.takeProfitPrice) ||
            (pos.side === 'SHORT' && markPrice <= pos.takeProfitPrice))
        ) {
          handleClosePosition(pos.id, 'TAKE_PROFIT');
        }

        return {
          ...pos,
          markPrice,
          unrealizedPnl: pnl,
          unrealizedPnlPct: pnlPct,
          pipsPnl,
        };
      })
    );
  }, [markets]);

  // ---------------------------------------------------------------------------
  // Fetch AI Analysis & Timing from Server
  // ---------------------------------------------------------------------------
  const fetchAIAnalysis = useCallback(async (sym: TradingSymbol) => {
    const market = markets[sym];
    if (!market) return;

    setIsLoadingAnalysis(true);
    try {
      const relevantNews = newsArticles.filter(
        (n) => n.symbol === sym || n.symbol === 'MARKET'
      );

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          assetClass: market.assetClass,
          price: market.price,
          change24h: market.change24h,
          pipSize: market.pipSize,
          rsi: market.rsi,
          macd: market.macd,
          ema20: market.ema20,
          ema50: market.ema50,
          bollinger: market.bollinger,
          volume24h: market.volume24h,
          orderBookImbalance: orderBooks[sym]?.imbalance || 0.55,
          strategy: botConfig.strategy,
          recentNews: relevantNews,
          socialBuzz: `${sentimentOverview.fearAndGreedLabel} (${sentimentOverview.fearAndGreedIndex}/100) · ${sentimentOverview.socialBuzzVolume}`,
          riskParameters: {
            riskProfile: riskParameters.riskProfile,
            maxAllocationPct: riskParameters.maxAllocationPerTradePct,
            defaultStopLossPct: riskParameters.defaultStopLossPct,
            defaultTakeProfitPct: riskParameters.defaultTakeProfitPct,
            maxLeverage: riskParameters.maxLeverage,
            sentimentFilterEnabled: riskParameters.sentimentFilterEnabled,
            minSentimentThreshold: riskParameters.minSentimentThreshold,
            newsWeightPct: riskParameters.newsWeightPct,
          },
          currentPositionsCount: positions.length,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setCurrentAnalysis(data.analysis);

        const newLog: AILogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          symbol: sym,
          action: data.analysis.action,
          headline: data.analysis.timingHeadline || data.analysis.primaryTrigger,
          details: `${data.analysis.technicalRationale} [News: ${data.analysis.headlineCatalyst || 'Stable'}]`,
          confidence: data.analysis.confidence,
        };
        setAiLogs((prev) => [newLog, ...prev.slice(0, 15)]);

        // Autonomous Execution Check:
        if (
          botConfig.status === 'active' &&
          botConfig.mode === 'autonomous' &&
          (data.analysis.action === 'BUY' || data.analysis.action === 'SELL') &&
          data.analysis.confidence >= botConfig.minConfidenceThreshold &&
          positions.length < riskParameters.maxOpenPositions &&
          !positions.some((p) => p.symbol === sym)
        ) {
          executeAIProposal(data.analysis, true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [markets, botConfig, riskParameters, newsArticles, sentimentOverview, positions, orderBooks]);

  useEffect(() => {
    fetchAIAnalysis(selectedSymbol);
  }, [selectedSymbol]);

  useEffect(() => {
    if (botConfig.status !== 'active') return;

    const interval = setInterval(() => {
      fetchAIAnalysis(selectedSymbol);
    }, botConfig.scanIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [botConfig.status, botConfig.scanIntervalSeconds, selectedSymbol, fetchAIAnalysis]);

  // ---------------------------------------------------------------------------
  // Trade Execution Handlers
  // ---------------------------------------------------------------------------
  const executeAIProposal = (analysis: AIAnalysisResult, isAutonomous: boolean = false) => {
    const market = markets[selectedSymbol];
    if (!market || analysis.action === 'HOLD') return;

    const maxAllocPct = analysis.suggestedAllocationPct || riskParameters.maxAllocationPerTradePct;
    const margin = (cashBalance * (maxAllocPct / 100));
    if (margin <= 0 || margin > cashBalance) return;

    const leverage = analysis.suggestedLeverage || Math.min(3, riskParameters.maxLeverage);
    const notional = margin * leverage;
    const size = notional / market.price;

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: selectedSymbol,
      assetClass: market.assetClass,
      side: analysis.direction === 'LONG' ? 'LONG' : 'SHORT',
      entryPrice: market.price,
      markPrice: market.price,
      size,
      sizeUsd: notional,
      margin,
      leverage,
      liquidationPrice:
        analysis.direction === 'LONG'
          ? market.price * (1 - 0.9 / leverage)
          : market.price * (1 + 0.9 / leverage),
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      stopLossPrice: analysis.stopLossPrice,
      takeProfitPrice: analysis.takeProfitPrice,
      createdAt: Date.now(),
      source: isAutonomous ? 'AI_BOT' : 'MANUAL',
      strategyName: botConfig.strategy,
    };

    setCashBalance((prev) => prev - margin);
    setPositions((prev) => [newPosition, ...prev]);

    // Pin TradingView Execution Marker
    const marker: ChartExecutionMarker = {
      id: `marker-${Date.now()}`,
      time: Math.floor(Date.now() / 1000),
      symbol: selectedSymbol,
      side: analysis.direction === 'LONG' ? 'BUY' : 'SELL',
      price: market.price,
      amount: size,
      source: isAutonomous ? 'AI_BOT' : 'MANUAL',
      label: `${analysis.direction === 'LONG' ? 'BUY' : 'SELL'} ${size.toFixed(2)}`,
    };
    setChartExecutionMarkers((prev) => [marker, ...prev]);

    playChime('success');

    // Dispatch Browser Notification & Toast Alert
    dispatchAlert({
      type: 'TRADE_FILLED',
      title: `${isAutonomous ? 'AI Bot' : 'Manual'} ${analysis.direction} Executed`,
      message: `${selectedSymbol} @ $${market.price.toFixed(2)} | Size: $${notional.toFixed(0)} (${leverage}x)`,
      symbol: selectedSymbol,
      price: market.price,
      amount: notional,
    });

    setAiLogs((prev) => [
      {
        id: `exec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        symbol: selectedSymbol,
        action: analysis.action,
        headline: `${isAutonomous ? 'Autonomous AI' : 'Manual Override'} Position Opened: ${analysis.direction} ${selectedSymbol}`,
        details: `Committed $${margin.toFixed(0)} margin at ${leverage}x leverage. TP: $${analysis.takeProfitPrice} | SL: $${analysis.stopLossPrice}`,
        confidence: analysis.confidence,
      },
      ...prev,
    ]);
  };

  const handleManualTrade = (trade: {
    symbol: TradingSymbol;
    side: 'LONG' | 'SHORT';
    orderType: 'MARKET' | 'LIMIT';
    price: number;
    amountUsd: number;
    leverage: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
  }) => {
    const market = markets[trade.symbol];
    if (!market) return;

    const marginRequired = trade.amountUsd / (trade.leverage || 1);
    if (marginRequired > cashBalance) return;

    if (trade.orderType === 'LIMIT') {
      const newOrder: OpenOrder = {
        id: `ord-${Date.now()}`,
        symbol: trade.symbol,
        assetClass: market.assetClass,
        type: 'LIMIT',
        side: trade.side === 'LONG' ? 'BUY' : 'SELL',
        price: trade.price,
        amount: Number((trade.amountUsd / trade.price).toFixed(4)),
        status: 'PENDING',
        createdAt: Date.now(),
        source: 'MANUAL',
      };
      setOpenOrders((prev) => [newOrder, ...prev]);
      playChime('success');
      dispatchAlert({
        type: 'ALERT',
        title: `Limit Order Placed: ${trade.side} ${trade.symbol}`,
        message: `Limit order set at $${trade.price.toFixed(2)} for $${trade.amountUsd.toLocaleString()}`,
        symbol: trade.symbol,
      });
      return;
    }

    const coinSize = trade.amountUsd / market.price;
    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: trade.symbol,
      assetClass: market.assetClass,
      side: trade.side,
      entryPrice: market.price,
      markPrice: market.price,
      size: coinSize,
      sizeUsd: trade.amountUsd,
      margin: marginRequired,
      leverage: trade.leverage,
      liquidationPrice:
        trade.side === 'LONG'
          ? market.price * (1 - 0.9 / trade.leverage)
          : market.price * (1 + 0.9 / trade.leverage),
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      stopLossPrice: trade.stopLossPrice,
      takeProfitPrice: trade.takeProfitPrice,
      createdAt: Date.now(),
      source: 'MANUAL',
      strategyName: 'Manual Discretionary Override',
    };

    setCashBalance((prev) => prev - marginRequired);
    setPositions((prev) => [newPosition, ...prev]);

    // Pin TradingView Execution Marker
    const marker: ChartExecutionMarker = {
      id: `marker-${Date.now()}`,
      time: Math.floor(Date.now() / 1000),
      symbol: trade.symbol,
      side: trade.side === 'LONG' ? 'BUY' : 'SELL',
      price: market.price,
      amount: coinSize,
      source: 'MANUAL',
      label: `MANUAL ${trade.side}`,
    };
    setChartExecutionMarkers((prev) => [marker, ...prev]);

    playChime('success');

    dispatchAlert({
      type: 'TRADE_FILLED',
      title: `Manual Order Filled: ${trade.side} ${trade.symbol}`,
      message: `Executed at $${market.price.toFixed(2)} ($${trade.amountUsd.toLocaleString()} notional, ${trade.leverage}x)`,
      symbol: trade.symbol,
      price: market.price,
      amount: trade.amountUsd,
    });
  };

  // ---------------------------------------------------------------------------
  // Position Override Actions (Close, Reverse, Partial, Panic)
  // ---------------------------------------------------------------------------
  const handleClosePosition = (
    id: string,
    reason: 'MANUAL_OVERRIDE' | 'PANIC_CLOSE' | 'STOP_LOSS' | 'TAKE_PROFIT' = 'MANUAL_OVERRIDE'
  ) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const curMarket = markets[pos.symbol];
    const exitPrice = curMarket ? curMarket.price : pos.markPrice;
    const priceDiff = pos.side === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const realizedPnl = priceDiff * pos.size;
    const fee = pos.sizeUsd * 0.0006;
    const returnedCash = pos.margin + realizedPnl - fee;

    const pipsGained =
      curMarket && curMarket.pipSize > 0
        ? Math.round(priceDiff / curMarket.pipSize)
        : undefined;

    const historyItem: TradeHistoryItem = {
      id: `th-${Date.now()}`,
      symbol: pos.symbol,
      assetClass: pos.assetClass,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      size: pos.size,
      sizeUsd: pos.sizeUsd,
      realizedPnl,
      realizedPnlPct: (realizedPnl / pos.margin) * 100,
      pipsGained,
      fee,
      closedAt: Date.now(),
      source: reason,
      notes:
        reason === 'PANIC_CLOSE'
          ? 'Emergency Panic Close All executed.'
          : reason === 'STOP_LOSS'
          ? 'Automated Stop Loss triggered at predefined boundary.'
          : reason === 'TAKE_PROFIT'
          ? 'Automated Take Profit target achieved.'
          : 'Manual market override closed by user.',
    };

    setCashBalance((prev) => prev + returnedCash);
    setPositions((prev) => prev.filter((p) => p.id !== id));
    setTradeHistory((prev) => [historyItem, ...prev]);

    // Dispatch Alerts based on closure type
    if (reason === 'STOP_LOSS') {
      playChime('alert');
      dispatchAlert({
        type: 'STOP_LOSS',
        title: `Stop-Loss Hit: ${pos.symbol}`,
        message: `Position closed at $${exitPrice.toFixed(2)} | Net: -$${Math.abs(realizedPnl).toFixed(2)}`,
        symbol: pos.symbol,
        price: exitPrice,
        pnl: realizedPnl,
      });
    } else if (reason === 'TAKE_PROFIT') {
      playChime('success');
      dispatchAlert({
        type: 'TAKE_PROFIT',
        title: `Target Hit: ${pos.symbol}`,
        message: `Profit secured at $${exitPrice.toFixed(2)} | Net Gain: +$${Math.abs(realizedPnl).toFixed(2)}`,
        symbol: pos.symbol,
        price: exitPrice,
        pnl: realizedPnl,
      });
    } else if (reason === 'PANIC_CLOSE') {
      playChime('panic');
      dispatchAlert({
        type: 'PANIC',
        title: `Panic Close Executed: ${pos.symbol}`,
        message: `Liquidated at market $${exitPrice.toFixed(2)}`,
        symbol: pos.symbol,
      });
    } else {
      playChime('success');
      dispatchAlert({
        type: 'ALERT',
        title: `Position Closed: ${pos.symbol}`,
        message: `Manual close executed at $${exitPrice.toFixed(2)} | PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)}`,
        symbol: pos.symbol,
      });
    }
  };

  const handleReversePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const curMarket = markets[pos.symbol];
    const exitPrice = curMarket ? curMarket.price : pos.markPrice;
    const oppositeSide = pos.side === 'LONG' ? 'SHORT' : 'LONG';

    handleClosePosition(id, 'MANUAL_OVERRIDE');

    setTimeout(() => {
      handleManualTrade({
        symbol: pos.symbol,
        side: oppositeSide,
        orderType: 'MARKET',
        price: exitPrice,
        amountUsd: pos.sizeUsd,
        leverage: pos.leverage,
      });
    }, 150);
  };

  const handlePartialClosePosition = (id: string, pct: number) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const closeFraction = pct / 100;
    const curMarket = markets[pos.symbol];
    const exitPrice = curMarket ? curMarket.price : pos.markPrice;
    const closedSize = pos.size * closeFraction;
    const closedMargin = pos.margin * closeFraction;
    const priceDiff = pos.side === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const realizedPnl = priceDiff * closedSize;
    const fee = pos.sizeUsd * closeFraction * 0.0006;

    const returnedCash = closedMargin + realizedPnl - fee;

    const historyItem: TradeHistoryItem = {
      id: `th-${Date.now()}`,
      symbol: pos.symbol,
      assetClass: pos.assetClass,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      size: closedSize,
      sizeUsd: pos.sizeUsd * closeFraction,
      realizedPnl,
      realizedPnlPct: (realizedPnl / closedMargin) * 100,
      fee,
      closedAt: Date.now(),
      source: 'MANUAL_OVERRIDE',
      notes: `Partial close ${pct}% executed to de-risk.`,
    };

    setCashBalance((prev) => prev + returnedCash);
    setPositions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              size: p.size - closedSize,
              sizeUsd: p.sizeUsd * (1 - closeFraction),
              margin: p.margin - closedMargin,
            }
          : p
      )
    );
    setTradeHistory((prev) => [historyItem, ...prev]);
    playChime('success');
  };

  const handleUpdatePositionSlTp = (id: string, sl?: number, tp?: number) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stopLossPrice: sl, takeProfitPrice: tp } : p
      )
    );
    dispatchAlert({
      type: 'ALERT',
      title: 'SL / TP Targets Updated',
      message: `Stop Loss: ${sl ? `$${sl}` : 'None'} | Take Profit: ${tp ? `$${tp}` : 'None'}`,
    });
  };

  const handlePanicCloseAll = () => {
    if (positions.length === 0) return;

    setBotConfig((prev) => ({ ...prev, status: 'paused' }));

    positions.forEach((pos) => {
      handleClosePosition(pos.id, 'PANIC_CLOSE');
    });

    dispatchAlert({
      type: 'PANIC',
      title: 'Emergency Panic Close All Triggered',
      message: 'All positions liquidated at market. Automated bot paused to protect balance.',
    });

    setAiLogs((prev) => [
      {
        id: `panic-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        symbol: selectedSymbol,
        action: 'OVERRIDE',
        headline: 'EMERGENCY PANIC OVERRIDE TRIGGERED',
        details: 'All open positions liquidated at market price. Automated bot execution paused.',
      },
      ...prev,
    ]);
  };

  const handleInjectNews = (article: NewsArticle) => {
    setNewsArticles((prev) => [article, ...prev]);
    setTimeout(() => {
      fetchAIAnalysis(selectedSymbol);
    }, 200);
  };

  // Beginner Quick Action Helpers
  const handleApplyBeginnerPreset = () => {
    setRiskParameters({
      ...riskParameters,
      riskProfile: 'Conservative',
      maxDrawdownLimitPct: 3.0,
      maxAllocationPerTradePct: 8.0,
      defaultStopLossPct: 1.8,
      defaultTakeProfitPct: 4.5,
      maxLeverage: 2,
      trailingStopEnabled: true,
      trailingStopDistancePct: 1.0,
      dailyLossHaltPct: 2.5,
      maxOpenPositions: 2,
    });
    dispatchAlert({
      type: 'ALERT',
      title: 'Beginner Safe Preset Applied',
      message: 'Max leverage capped at 2x. Tight 1.8% stop loss and circuit breaker armed.',
    });
    playChime('success');
  };

  const handleActivateAutonomousMode = () => {
    setBotConfig((prev) => ({ ...prev, status: 'active', mode: 'autonomous' }));
    dispatchAlert({
      type: 'ALERT',
      title: 'Automated AI Bot Active',
      message: 'AI bot is now continuously scanning for Grade A optimal trade entries.',
    });
    playChime('success');
  };

  // Calculated Portfolio Totals
  const totalMarginUsed = positions.reduce((acc, p) => acc + p.margin, 0);
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalEquity = cashBalance + totalMarginUsed + totalUnrealizedPnl;
  const realized24hPnl = tradeHistory.reduce((acc, t) => acc + t.realizedPnl, 0);
  const pnl24hPct = ((totalEquity - 50000) / 50000) * 100;

  const currentMarket = markets[selectedSymbol] || markets['BTC/USDT'];
  const activePositionForCurrentSymbol = positions.find((p) => p.symbol === selectedSymbol);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* 3-Zone Header Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        botConfig={botConfig}
        onToggleBot={() =>
          setBotConfig((prev) => ({
            ...prev,
            status: prev.status === 'active' ? 'paused' : 'active',
          }))
        }
        onPanicCloseAll={handlePanicCloseAll}
        openPositionsCount={positions.length}
        totalPortfolioValue={totalEquity}
        pnl24hPct={pnl24hPct}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        riskParameters={riskParameters}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        onSendTestNotification={handleSendTestNotification}
        showBeginnerGuide={showBeginnerGuide}
        onToggleBeginnerGuide={() => setShowBeginnerGuide(!showBeginnerGuide)}
      />

      {/* TradingView Signature Live Market Ticker Tape Reel */}
      <TradingViewReel
        markets={markets}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        breakingNewsHeadline={newsArticles[0]?.title}
      />

      {/* Beginner Fast-Track Guide & Cheat Sheet */}
      <BeginnerGuide
        isOpen={showBeginnerGuide}
        onClose={() => setShowBeginnerGuide(false)}
        onApplyBeginnerPreset={handleApplyBeginnerPreset}
        onActivateAutonomousMode={handleActivateAutonomousMode}
      />

      {/* Real-time Ticker Ribbon */}
      <TickerBar
        markets={markets}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        priceFlashMap={priceFlashMap}
        selectedAssetClass={selectedAssetClass}
        onSelectAssetClass={handleSelectAssetClass}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* TAB 1: TRADING TERMINAL */}
        {currentTab === 'terminal' && (
          <div className="space-y-4">
            {/* Top Grid: Chart + Order Book + Manual Trade + AI Signal */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Left Column: Candlestick Chart (8 cols on large desktop) */}
              <div className="xl:col-span-8 space-y-4">
                <CandleChart
                  symbol={selectedSymbol}
                  candles={currentMarket.candles}
                  currentPrice={currentMarket.price}
                  pipSize={currentMarket.pipSize}
                  ema20={currentMarket.ema20}
                  ema50={currentMarket.ema50}
                  bollinger={currentMarket.bollinger}
                  activePosition={activePositionForCurrentSymbol}
                  executionMarkers={chartExecutionMarkers}
                />

                {/* AI Market Timing & Signal Engine */}
                <AITradingSignalTerminal
                  symbol={selectedSymbol}
                  marketData={currentMarket}
                  analysis={currentAnalysis}
                  isLoadingAnalysis={isLoadingAnalysis}
                  onRefreshAnalysis={() => fetchAIAnalysis(selectedSymbol)}
                  onExecuteProposal={(analysis) => executeAIProposal(analysis, false)}
                  aiLogs={aiLogs}
                  riskParameters={riskParameters}
                  isBotActive={botConfig.status === 'active'}
                />
              </div>

              {/* Right Column: Order Book & Manual Trade Desk (4 cols) */}
              <div className="xl:col-span-4 space-y-4">
                {/* Manual Trade Override Panel */}
                <ManualTradeTerminal
                  symbol={selectedSymbol}
                  marketData={currentMarket}
                  availableCash={cashBalance}
                  riskParameters={riskParameters}
                  onExecuteManualTrade={handleManualTrade}
                />

                {/* Order Book & Trade Tape */}
                <div className="h-[360px]">
                  <OrderBookTape
                    orderBook={orderBooks[selectedSymbol] || generateOrderBook(currentMarket.price)}
                    tapeTrades={tapeTrades[selectedSymbol] || []}
                    currentPrice={currentMarket.price}
                  />
                </div>
              </div>
            </div>

            {/* Breaking News & Social Media Sentiment Module */}
            <NewsSentimentModule
              newsArticles={newsArticles}
              socialTrends={socialTrends}
              sentimentOverview={sentimentOverview}
              selectedSymbol={selectedSymbol}
              onInjectNews={handleInjectNews}
            />

            {/* Active Positions & Ledger Table */}
            <PositionsTable
              positions={positions}
              openOrders={openOrders}
              tradeHistory={tradeHistory}
              onClosePosition={handleClosePosition}
              onReversePosition={handleReversePosition}
              onPartialClosePosition={handlePartialClosePosition}
              onUpdatePositionSlTp={handleUpdatePositionSlTp}
              onCancelOrder={(id) => setOpenOrders((prev) => prev.filter((o) => o.id !== id))}
              onClearHistory={() => setTradeHistory([])}
              onSelectSymbol={setSelectedSymbol}
            />
          </div>
        )}

        {/* TAB 2: PORTFOLIO & LEDGER */}
        {currentTab === 'portfolio' && (
          <PortfolioView
            totalEquity={totalEquity}
            cashBalance={cashBalance}
            usedMargin={totalMarginUsed}
            unrealizedPnl={totalUnrealizedPnl}
            realizedPnl24h={realized24hPnl}
            positions={positions}
            tradeHistory={tradeHistory}
            onResetBalance={() => {
              setCashBalance(50000);
              setPositions([]);
            }}
          />
        )}

        {/* TAB 3: RISK & BOT GOVERNANCE */}
        {currentTab === 'risk' && (
          <RiskConfigModal
            riskParameters={riskParameters}
            botConfig={botConfig}
            onSaveRiskParameters={setRiskParameters}
            onSaveBotConfig={setBotConfig}
          />
        )}

        {/* TAB 4: AI COPILOT CONSULTANT */}
        {currentTab === 'copilot' && (
          <AICopilotModal
            currentMarket={currentMarket}
            portfolioState={{
              totalBalance: totalEquity,
              availableCash: cashBalance,
              positionsCount: positions.length,
              pnl24h: pnl24hPct,
              riskProfile: riskParameters.riskProfile,
            }}
            riskParameters={riskParameters}
          />
        )}

        {/* TAB 5: STRATEGY BACKTESTING */}
        {currentTab === 'backtest' && (
          <BacktestView
            currentSymbol={selectedSymbol}
            botConfig={botConfig}
            riskParameters={riskParameters}
          />
        )}
      </main>

      {/* Floating In-App Toast Alerts */}
      <NotificationToasts
        notifications={inAppNotifications}
        onDismiss={(id) => setInAppNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
    </div>
  );
}
