import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Candle, ChartExecutionMarker, Position, TradingSymbol } from '../../types/trading';
import { BarChart3, LineChart, Maximize2, Sparkles, Clock } from 'lucide-react';

interface CandleChartProps {
  symbol: TradingSymbol;
  candles: Candle[];
  currentPrice: number;
  pipSize: number;
  ema20: number;
  ema50: number;
  bollinger: { upper: number; middle: number; lower: number };
  activePosition?: Position;
  executionMarkers?: ChartExecutionMarker[];
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '1D';

export const CandleChart: React.FC<CandleChartProps> = ({
  symbol,
  candles,
  currentPrice,
  pipSize,
  ema20,
  ema50,
  bollinger,
  activePosition,
  executionMarkers = [],
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<'regular' | 'log' | 'percent'>('regular');

  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // TradingView countdown clock for active candle (seconds left)
  const [candleCountdown, setCandleCountdown] = useState<number>(47);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCandleCountdown((prev) => (prev > 1 ? prev - 1 : 60));
      setCurrentTimeStr(new Date().toTimeString().split(' ')[0] + ' (UTC)');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const decimals = pipSize < 0.001 ? 5 : pipSize < 0.1 ? 3 : 2;

  const formatPrice = (val: number) => {
    return val.toFixed(decimals);
  };

  // Compute price ranges
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: currentPrice * 0.99, maxPrice: currentPrice * 1.01, maxVolume: 1000 };
    }

    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));
    const maxVol = Math.max(...candles.map((c) => c.volume), 1);

    if (activePosition?.stopLossPrice) {
      min = Math.min(min, activePosition.stopLossPrice);
    }
    if (activePosition?.takeProfitPrice) {
      max = Math.max(max, activePosition.takeProfitPrice);
    }

    const padding = (max - min) * 0.08 || 0.001;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: maxVol,
    };
  }, [candles, currentPrice, activePosition]);

  // Chart Dimensions
  const width = 800;
  const height = 430;
  const margin = { top: 20, right: 85, bottom: 45, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const volumeHeight = showVolume ? 60 : 0;
  const priceChartHeight = innerHeight - volumeHeight;

  // Scale helpers
  const getY = (val: number) => {
    return margin.top + (1 - (val - minPrice) / (maxPrice - minPrice || 1)) * priceChartHeight;
  };

  const candleWidth = Math.max(2, (innerWidth / (candles.length || 1)) * 0.65);
  const candleGap = innerWidth / (candles.length || 1);

  // EMA polyline points
  const ema20Points = useMemo(() => {
    if (!showEMA || candles.length === 0) return '';
    return candles
      .map((c, i) => {
        const x = margin.left + i * candleGap + candleGap / 2;
        const y = getY(c.close);
        return `${x},${y}`;
      })
      .join(' ');
  }, [candles, showEMA, minPrice, maxPrice]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - margin.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= 0 && mouseX <= innerWidth && mouseY >= margin.top && mouseY <= margin.top + priceChartHeight) {
      const index = Math.min(
        candles.length - 1,
        Math.max(0, Math.floor(mouseX / candleGap))
      );
      setHoveredCandle(candles[index] || null);
      setCrosshairPos({ x: margin.left + index * candleGap + candleGap / 2, y: mouseY });
    } else {
      setHoveredCandle(null);
      setCrosshairPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setCrosshairPos(null);
  };

  const priceTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const price = minPrice + (i / (count - 1)) * (maxPrice - minPrice);
      ticks.push(price);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm relative">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-800 bg-neutral-950/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{symbol}</span>
            <span className="text-xs text-neutral-400 font-mono">
              ${formatPrice(currentPrice)}
            </span>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-md border border-neutral-800 text-[11px] font-mono">
            {(['1m', '5m', '15m', '1h', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Toggle */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-md border border-neutral-800 text-[11px]">
            <button
              onClick={() => setChartType('candles')}
              title="Candlestick Chart"
              className={`p-1 rounded transition-colors ${
                chartType === 'candles' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Smooth Line Chart"
              className={`p-1 rounded transition-colors ${
                chartType === 'line' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showEMA
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            EMA (20/50)
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showBollinger
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            BB (20,2)
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showVolume
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            VOL
          </button>
        </div>
      </div>

      {/* Candle Stats Bar (OHLCV) */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 bg-neutral-950/60 border-b border-neutral-800/60 text-[11px] font-mono tabular-nums text-neutral-400">
          <span>
            O: <span className="text-neutral-200">${formatPrice(activeCandle.open)}</span>
          </span>
          <span>
            H: <span className="text-emerald-400">${formatPrice(activeCandle.high)}</span>
          </span>
          <span>
            L: <span className="text-rose-400">${formatPrice(activeCandle.low)}</span>
          </span>
          <span>
            C:{' '}
            <span
              className={
                activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              ${formatPrice(activeCandle.close)}
            </span>
          </span>
          <span>
            Vol: <span className="text-neutral-300">{activeCandle.volume.toLocaleString()}</span>
          </span>
          {showEMA && (
            <>
              <span className="text-amber-400">EMA20: ${formatPrice(ema20)}</span>
              <span className="text-cyan-400">EMA50: ${formatPrice(ema50)}</span>
            </>
          )}
        </div>
      )}

      {/* SVG Interactive Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* TradingView Center Watermark */}
          <text
            x={innerWidth / 2 + margin.left}
            y={priceChartHeight / 2 + margin.top}
            fill="#ffffff"
            opacity="0.04"
            fontSize="42"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {symbol.replace('/', '')} · {timeframe}
          </text>

          {/* Horizontal Grid Lines */}
          {priceTicks.map((price, idx) => {
            const y = getY(price);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#262626"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={width - margin.right + 6}
                  y={y + 3}
                  fill="#737373"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  ${formatPrice(price)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Shaded Area */}
          {showBollinger && (
            <g>
              <line
                x1={margin.left}
                y1={getY(bollinger.upper)}
                x2={width - margin.right}
                y2={getY(bollinger.upper)}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <line
                x1={margin.left}
                y1={getY(bollinger.lower)}
                x2={width - margin.right}
                y2={getY(bollinger.lower)}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </g>
          )}

          {/* Volume bars */}
          {showVolume &&
            candles.map((c, i) => {
              const x = margin.left + i * candleGap + (candleGap - candleWidth) / 2;
              const barH = (c.volume / maxVolume) * (volumeHeight - 10);
              const y = height - margin.bottom - barH;
              const isUp = c.close >= c.open;

              return (
                <rect
                  key={`vol-${i}`}
                  x={x}
                  y={y}
                  width={candleWidth}
                  height={barH}
                  fill={isUp ? '#10b981' : '#f43f5e'}
                  opacity="0.3"
                />
              );
            })}

          {/* Candlesticks or Smooth Line */}
          {chartType === 'candles' ? (
            candles.map((c, i) => {
              const x = margin.left + i * candleGap + candleGap / 2;
              const isUp = c.close >= c.open;
              const color = isUp ? '#10b981' : '#f43f5e';

              const wickY1 = getY(c.high);
              const wickY2 = getY(c.low);

              const bodyTop = getY(Math.max(c.open, c.close));
              const bodyBottom = getY(Math.min(c.open, c.close));
              const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);

              return (
                <g key={`candle-${i}`}>
                  <line
                    x1={x}
                    y1={wickY1}
                    x2={x}
                    y2={wickY2}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          ) : (
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={candles
                .map((c, i) => `${margin.left + i * candleGap + candleGap / 2},${getY(c.close)}`)
                .join(' ')}
            />
          )}

          {/* EMA line */}
          {showEMA && ema20Points && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              points={ema20Points}
              opacity="0.85"
            />
          )}

          {/* Active Position Overlay Lines */}
          {activePosition && (
            <g>
              {/* Entry Price */}
              <line
                x1={margin.left}
                y1={getY(activePosition.entryPrice)}
                x2={width - margin.right}
                y2={getY(activePosition.entryPrice)}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
              <rect
                x={margin.left + 5}
                y={getY(activePosition.entryPrice) - 9}
                width="95"
                height="16"
                fill="#0369a1"
                rx="2"
              />
              <text
                x={margin.left + 8}
                y={getY(activePosition.entryPrice) + 3}
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ENTRY ${formatPrice(activePosition.entryPrice)}
              </text>

              {/* Stop Loss Line */}
              {activePosition.stopLossPrice && (
                <>
                  <line
                    x1={margin.left}
                    y1={getY(activePosition.stopLossPrice)}
                    x2={width - margin.right}
                    y2={getY(activePosition.stopLossPrice)}
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={margin.left + 5}
                    y={getY(activePosition.stopLossPrice) - 9}
                    width="80"
                    height="16"
                    fill="#be123c"
                    rx="2"
                  />
                  <text
                    x={margin.left + 8}
                    y={getY(activePosition.stopLossPrice) + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    SL ${formatPrice(activePosition.stopLossPrice)}
                  </text>
                </>
              )}

              {/* Take Profit Line */}
              {activePosition.takeProfitPrice && (
                <>
                  <line
                    x1={margin.left}
                    y1={getY(activePosition.takeProfitPrice)}
                    x2={width - margin.right}
                    y2={getY(activePosition.takeProfitPrice)}
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={margin.left + 5}
                    y={getY(activePosition.takeProfitPrice) - 9}
                    width="80"
                    height="16"
                    fill="#047857"
                    rx="2"
                  />
                  <text
                    x={margin.left + 8}
                    y={getY(activePosition.takeProfitPrice) + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TP ${formatPrice(activePosition.takeProfitPrice)}
                  </text>
                </>
              )}
            </g>
          )}

          {/* TradingView Pinned Trade Execution Markers */}
          {executionMarkers
            .filter((m) => m.symbol === symbol)
            .map((marker) => {
              const y = getY(marker.price);
              const isBuy = marker.side === 'BUY';
              const x = width - margin.right - 60;

              return (
                <g key={marker.id}>
                  {/* Marker Pin */}
                  <polygon
                    points={
                      isBuy
                        ? `${x},${y - 4} ${x - 5},${y + 6} ${x + 5},${y + 6}`
                        : `${x},${y + 4} ${x - 5},${y - 6} ${x + 5},${y - 6}`
                    }
                    fill={isBuy ? '#10b981' : '#f43f5e'}
                  />
                  {/* Badge */}
                  <rect
                    x={x + 8}
                    y={y - 8}
                    width="54"
                    height="16"
                    fill={isBuy ? '#065f46' : '#881337'}
                    rx="2"
                  />
                  <text
                    x={x + 12}
                    y={y + 4}
                    fill="#ffffff"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isBuy ? '▲ BUY' : '▼ SELL'}
                  </text>
                </g>
              );
            })}

          {/* Current Live Price Horizontal Marker + Countdown Clock */}
          <g>
            <line
              x1={margin.left}
              y1={getY(currentPrice)}
              x2={width - margin.right}
              y2={getY(currentPrice)}
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Live price badge on Y axis */}
            <rect
              x={width - margin.right + 2}
              y={getY(currentPrice) - 8}
              width="80"
              height="16"
              fill="#065f46"
              rx="2"
            />
            <text
              x={width - margin.right + 5}
              y={getY(currentPrice) + 4}
              fill="#34d399"
              fontSize="9.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ${formatPrice(currentPrice)}
            </text>

            {/* TradingView Candle Close Countdown */}
            <rect
              x={width - margin.right + 2}
              y={getY(currentPrice) + 9}
              width="80"
              height="13"
              fill="#0f172a"
              rx="2"
            />
            <text
              x={width - margin.right + 7}
              y={getY(currentPrice) + 19}
              fill="#94a3b8"
              fontSize="8.5"
              fontFamily="monospace"
            >
              00:{candleCountdown < 10 ? `0${candleCountdown}` : candleCountdown}
            </text>
          </g>

          {/* Crosshair Cursor */}
          {crosshairPos && (
            <g>
              <line
                x1={crosshairPos.x}
                y1={margin.top}
                x2={crosshairPos.x}
                y2={height - margin.bottom}
                stroke="#a3a3a3"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={margin.left}
                y1={crosshairPos.y}
                x2={width - margin.right}
                y2={crosshairPos.y}
                stroke="#a3a3a3"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>
      </div>

      {/* TradingView Bottom Status & Scale Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-t border-neutral-850 text-[10px] font-mono text-neutral-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-neutral-300">
            <Clock className="w-3 h-3 text-neutral-500" />
            {currentTimeStr || '09:02:40 (UTC)'}
          </span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline text-neutral-400">Timeframe: {timeframe}</span>
        </div>

        {/* Scale toggles: %, log, auto */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScaleMode('percent')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              scaleMode === 'percent'
                ? 'bg-neutral-800 text-cyan-400 font-bold'
                : 'hover:text-white text-neutral-500'
            }`}
          >
            %
          </button>
          <button
            onClick={() => setScaleMode('log')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              scaleMode === 'log'
                ? 'bg-neutral-800 text-cyan-400 font-bold'
                : 'hover:text-white text-neutral-500'
            }`}
          >
            log
          </button>
          <button
            onClick={() => setScaleMode('regular')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              scaleMode === 'regular'
                ? 'bg-neutral-800 text-emerald-400 font-bold'
                : 'hover:text-white text-neutral-500'
            }`}
          >
            auto
          </button>
        </div>
      </div>
    </div>
  );
};
