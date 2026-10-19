import React, { useState } from 'react';
import {
  MarketSentimentOverview,
  NewsArticle,
  SocialTrendTopic,
  TradingSymbol,
} from '../../types/trading';
import {
  Newspaper,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Share2,
  Sparkles,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

interface NewsSentimentModuleProps {
  newsArticles: NewsArticle[];
  socialTrends: SocialTrendTopic[];
  sentimentOverview: MarketSentimentOverview;
  selectedSymbol: TradingSymbol;
  onInjectNews: (article: NewsArticle) => void;
}

export const NewsSentimentModule: React.FC<NewsSentimentModuleProps> = ({
  newsArticles,
  socialTrends,
  sentimentOverview,
  selectedSymbol,
  onInjectNews,
}) => {
  const [filter, setFilter] = useState<'all' | 'selected' | 'high_impact'>('all');
  const [injectedBanner, setInjectedBanner] = useState<string | null>(null);

  const filteredNews = newsArticles.filter((item) => {
    if (filter === 'selected') {
      return item.symbol === selectedSymbol || item.symbol === 'MARKET';
    }
    if (filter === 'high_impact') {
      return item.impact === 'high';
    }
    return true;
  });

  const handleSimulateBreakingNews = (type: 'bullish' | 'bearish') => {
    const isBullish = type === 'bullish';
    const newArticle: NewsArticle = {
      id: `sim-${Date.now()}`,
      title: isBullish
        ? `BREAKING: Sovereign Wealth Fund Allocates $2.5B to ${selectedSymbol} Custody Reserves`
        : `ALERT: Regulatory Body Announces Heightened Reserve Audits Affecting ${selectedSymbol}`,
      source: 'Bloomberg Terminal FastWire',
      timeAgo: 'Just now',
      symbol: selectedSymbol,
      sentiment: isBullish ? 'bullish' : 'bearish',
      impact: 'high',
      summary: isBullish
        ? 'Institutional purchase execution underway across algorithmic liquidity venues.'
        : 'Short-term volatility spike anticipated as market makers adjust liquidity depth.',
      socialEngagement: '15.4K reposts in 4m',
      viralScore: 96,
    };

    onInjectNews(newArticle);
    setInjectedBanner(
      `Injected ${isBullish ? 'Bullish Catalyst' : 'Bearish FUD'} for ${selectedSymbol}. Watch AI Bot react!`
    );
    setTimeout(() => setInjectedBanner(null), 4000);
  };

  return (
    <div className="flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>News & Social Media Sentiment Module</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                Live Stream
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Aggregating X (Twitter), Reddit, Telegram & Financial Wires
            </div>
          </div>
        </div>

        {/* Quick Simulation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateBreakingNews('bullish')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors"
          >
            <PlusCircle className="w-3 h-3" />
            + Simulate Bullish News
          </button>
          <button
            onClick={() => handleSimulateBreakingNews('bearish')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
          >
            <AlertCircle className="w-3 h-3" />
            + Simulate Bearish FUD
          </button>
        </div>
      </div>

      {injectedBanner && (
        <div className="px-4 py-2 bg-indigo-950/60 border-b border-indigo-800/40 text-indigo-200 text-xs flex items-center gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{injectedBanner}</span>
        </div>
      )}

      {/* Sentiment Overview Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-neutral-950/40 border-b border-neutral-800">
        {/* Fear & Greed Index */}
        <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Fear & Greed Index</span>
            <span className="text-emerald-400 font-bold">{sentimentOverview.fearAndGreedLabel}</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {sentimentOverview.fearAndGreedIndex}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 100</span>
            <span className="text-[11px] text-emerald-400 font-mono ml-auto">
              {sentimentOverview.newsSentimentShift}
            </span>
          </div>
          {/* Visual progress bar */}
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${sentimentOverview.fearAndGreedIndex}%` }}
            />
          </div>
        </div>

        {/* Aggregate Sentiment Ratio */}
        <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Market Sentiment Bias</span>
            <span className="text-cyan-400 font-bold">
              +{sentimentOverview.aggregateSentimentScore} Score
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono my-2">
            <span className="text-emerald-400 font-bold">
              {sentimentOverview.bullishPercentage}% Bullish
            </span>
            <span className="text-neutral-400">{sentimentOverview.neutralPercentage}% Neutral</span>
            <span className="text-rose-400 font-bold">
              {sentimentOverview.bearishPercentage}% Bearish
            </span>
          </div>
          {/* Segmented bar */}
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${sentimentOverview.bullishPercentage}%` }}
            />
            <div
              className="bg-neutral-600 h-full"
              style={{ width: `${sentimentOverview.neutralPercentage}%` }}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${sentimentOverview.bearishPercentage}%` }}
            />
          </div>
        </div>

        {/* 24h Social Buzz Volume */}
        <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Social Media Volume</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" /> High Velocity
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums my-2">
            {sentimentOverview.socialBuzzVolume}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Directly factored into AI bot confidence scoring.
          </div>
        </div>
      </div>

      {/* Main Grid: Viral Social Trends & Breaking News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
        {/* Left Column: Viral Social Topics */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Viral Trends & Social Sentiment
            </span>
          </div>

          <div className="space-y-2">
            {socialTrends.map((topic) => (
              <div
                key={topic.id}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-850 hover:border-neutral-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{topic.hashtag}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {topic.velocity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                  <span>{topic.platform}</span>
                  <span>{topic.mentions24h} mentions</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-neutral-850">
                  <span className="text-neutral-500">Sentiment:</span>
                  <span
                    className={`font-semibold ${
                      topic.sentimentScore >= 60
                        ? 'text-emerald-400'
                        : topic.sentimentScore <= -20
                        ? 'text-rose-400'
                        : 'text-neutral-300'
                    }`}
                  >
                    {topic.sentimentLabel} (+{topic.sentimentScore})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Breaking News Feed */}
        <div className="lg:col-span-2 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time News Wire ({filteredNews.length})</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md border border-neutral-800 text-[11px] font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All News
              </button>
              <button
                onClick={() => setFilter('selected')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'selected'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {selectedSymbol} Only
              </button>
              <button
                onClick={() => setFilter('high_impact')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'high_impact'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                High Impact
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 hover:border-neutral-750 transition-colors space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                      {article.source}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">{article.timeAgo}</span>
                    {article.symbol && (
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {article.symbol}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Sentiment Tag */}
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        article.sentiment === 'bullish'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : article.sentiment === 'bearish'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          : 'bg-neutral-900 text-neutral-300 border border-neutral-750'
                      }`}
                    >
                      {article.sentiment}
                    </span>

                    {/* Impact Tag */}
                    {article.impact === 'high' && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 uppercase">
                        High Impact
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-neutral-100 leading-snug">
                  {article.title}
                </h4>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-900">
                  <span>Viral Impact: {article.viralScore}/100</span>
                  <span>{article.socialEngagement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
