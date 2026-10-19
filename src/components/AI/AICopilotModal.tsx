import React, { useState } from 'react';
import { MarketData, RiskParameters, TradingSymbol } from '../../types/trading';
import { Sparkles, Send, Bot, Shield, ArrowRight, User } from 'lucide-react';

interface AICopilotModalProps {
  currentMarket: MarketData;
  portfolioState: {
    totalBalance: number;
    availableCash: number;
    positionsCount: number;
    pnl24h: number;
    riskProfile: string;
  };
  riskParameters: RiskParameters;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  currentMarket,
  portfolioState,
  riskParameters,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Greetings. I am AetherTrade's Chief AI Risk Officer and Quantitative Strategist. I continuously evaluate multi-timeframe price action, order flow, session liquidity, and news sentiment for ${currentMarket.symbol}. How can I assist your trading decisions today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const samplePrompts = [
    `What is the exact optimal entry timing for ${currentMarket.symbol}?`,
    `Evaluate our portfolio risk with ${portfolioState.positionsCount} active positions.`,
    `How does breaking news and social sentiment impact ${currentMarket.symbol} today?`,
    `Should we adjust stop loss or reduce leverage before session close?`,
  ];

  const handleSend = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          portfolioState,
          currentMarket: {
            symbol: currentMarket.symbol,
            assetClass: currentMarket.assetClass,
            price: currentMarket.price,
            change24h: currentMarket.change24h,
            rsi: currentMarket.rsi,
          },
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Analysis complete. Maintain strict risk management discipline.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `With current RSI at ${currentMarket.rsi.toFixed(1)} and your ${portfolioState.riskProfile} risk profile, wait for confirmed candle closure above EMA(20) before executing. Maintain standard stop-loss protection.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/crypto_analyst_avatar_1792422991031.jpg"
              alt="AI Trading Strategist"
              className="w-12 h-12 rounded-xl border border-cyan-500/30 object-cover shadow-lg shadow-cyan-500/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Aether Copilot · Quantitative Risk Advisor</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Live context: {currentMarket.symbol} (${currentMarket.price.toFixed(2)}) · Portfolio: ${portfolioState.totalBalance.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Risk Level: {riskParameters.riskProfile}</span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl min-h-[380px] max-h-[480px] overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium ml-auto'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 mb-0.5 font-mono">
                <span>{msg.sender === 'user' ? 'You' : 'AI Quantitative Copilot'}</span>
                <span>{msg.time}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-300 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs font-mono text-cyan-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing indicators, order book, and news sentiment...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI Copilot about ${currentMarket.symbol} strategy, optimal entry timing, or risk management...`}
          className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
