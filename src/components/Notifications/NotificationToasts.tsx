import React from 'react';
import { InAppNotification } from '../../types/trading';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Target,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface NotificationToastsProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToasts: React.FC<NotificationToastsProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        let borderClass = 'border-cyan-500/40 bg-neutral-900/95';
        let Icon = Zap;
        let iconColor = 'text-cyan-400';

        if (n.type === 'TAKE_PROFIT') {
          borderClass = 'border-emerald-500/50 bg-neutral-900/95';
          Icon = Target;
          iconColor = 'text-emerald-400';
        } else if (n.type === 'STOP_LOSS') {
          borderClass = 'border-rose-500/50 bg-neutral-900/95';
          Icon = AlertTriangle;
          iconColor = 'text-rose-400';
        } else if (n.type === 'PANIC') {
          borderClass = 'border-rose-600 bg-neutral-950';
          Icon = ShieldAlert;
          iconColor = 'text-rose-500';
        } else if (n.type === 'TRADE_FILLED') {
          borderClass = 'border-cyan-500/50 bg-neutral-900/95';
          Icon = CheckCircle2;
          iconColor = 'text-cyan-400';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} shadow-2xl backdrop-blur-md text-xs font-mono transition-all animate-in fade-in slide-in-from-right-4 duration-200`}
          >
            <div className={`p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 ${iconColor} shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{n.title}</span>
                <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">{n.message}</p>
            </div>

            <button
              onClick={() => onDismiss(n.id)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
