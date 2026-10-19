import React from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  SlidersHorizontal,
  Bot,
  TrendingUp,
  History,
  Volume2,
  VolumeX,
  Sparkles,
  Bell,
  BellRing,
  HelpCircle,
} from 'lucide-react';
import { BotConfig, RiskParameters } from '../types/trading';
import { NotificationPermissionState } from '../utils/notifications';

interface HeaderProps {
  currentTab: 'terminal' | 'portfolio' | 'risk' | 'copilot' | 'backtest';
  onSelectTab: (tab: 'terminal' | 'portfolio' | 'risk' | 'copilot' | 'backtest') => void;
  botConfig: BotConfig;
  onToggleBot: () => void;
  onPanicCloseAll: () => void;
  openPositionsCount: number;
  totalPortfolioValue: number;
  pnl24hPct: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  riskParameters: RiskParameters;
  notificationPermission: NotificationPermissionState;
  onRequestNotificationPermission: () => void;
  onSendTestNotification: () => void;
  showBeginnerGuide: boolean;
  onToggleBeginnerGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  botConfig,
  onToggleBot,
  onPanicCloseAll,
  openPositionsCount,
  totalPortfolioValue,
  pnl24hPct,
  soundEnabled,
  onToggleSound,
  riskParameters,
  notificationPermission,
  onRequestNotificationPermission,
  onSendTestNotification,
  showBeginnerGuide,
  onToggleBeginnerGuide,
}) => {
  const isPnlPositive = pnl24hPct >= 0;

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-neutral-950/95 border-b border-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand wordmark & Bot Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Bot className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              AetherTrade
            </span>
            <span className="text-[10px] text-neutral-400 font-mono leading-none">
              AI Quantitative Terminal
            </span>
          </div>
        </div>

        {/* Beginner Guide Toggle Button */}
        <button
          onClick={onToggleBeginnerGuide}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
            showBeginnerGuide
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 font-bold'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Toggle Beginner Onboarding & Terminology Guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Beginner Guide</span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800/70 text-xs font-medium text-neutral-300">
        <button
          onClick={() => onSelectTab('terminal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'terminal'
              ? 'bg-neutral-800 text-white shadow-sm font-semibold'
              : 'hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Trading Terminal
        </button>

        <button
          onClick={() => onSelectTab('portfolio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'portfolio'
              ? 'bg-neutral-800 text-white shadow-sm font-semibold'
              : 'hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Portfolio & Positions
          {openPositionsCount > 0 && (
            <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
              {openPositionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('risk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'risk'
              ? 'bg-neutral-800 text-white shadow-sm font-semibold'
              : 'hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Risk Parameters
        </button>

        <button
          onClick={() => onSelectTab('copilot')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'copilot'
              ? 'bg-neutral-800 text-white shadow-sm font-semibold'
              : 'hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          AI Copilot
        </button>

        <button
          onClick={() => onSelectTab('backtest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'backtest'
              ? 'bg-neutral-800 text-white shadow-sm font-semibold'
              : 'hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-400" />
          Strategy Backtest
        </button>
      </nav>

      {/* Zone 3: Actions, Browser Notifications & Overrides */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Browser Push Notification Permission Button */}
        {notificationPermission === 'granted' ? (
          <button
            onClick={onSendTestNotification}
            title="Browser Notifications Active. Click to send test alert!"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Alerts Active</span>
          </button>
        ) : (
          <button
            onClick={onRequestNotificationPermission}
            title="Enable browser notifications for trade fills & stop loss alerts"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 text-xs font-mono font-medium transition-colors cursor-pointer animate-pulse"
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Enable Alerts</span>
          </button>
        )}

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute execution sound chimes' : 'Enable execution sound chimes'}
          className="p-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Master Bot Toggle */}
        <button
          onClick={onToggleBot}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
            botConfig.status === 'active'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
              : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
          }`}
        >
          {botConfig.status === 'active' ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Bot: Active</span>
              <span className="sm:hidden">Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Bot: Paused</span>
              <span className="sm:hidden">Paused</span>
            </>
          )}
        </button>

        {/* Emergency Panic Override Button */}
        <button
          onClick={onPanicCloseAll}
          disabled={openPositionsCount === 0}
          title="Instantly market-close all positions and pause automated bot"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 shadow-sm ${
            openPositionsCount > 0
              ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Panic Close All ({openPositionsCount})</span>
        </button>
      </div>
    </header>
  );
};
