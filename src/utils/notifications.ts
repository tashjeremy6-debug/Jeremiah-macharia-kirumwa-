export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionState;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return Notification.permission as NotificationPermissionState;
  }
}

export interface TradeAlertPayload {
  type: 'TRADE_FILLED' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'PANIC' | 'ALERT';
  symbol: string;
  side?: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
  price?: number;
  amount?: number | string;
  pnl?: number;
  message?: string;
}

export function sendBrowserNotification(payload: TradeAlertPayload): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    let title = 'AetherTrade Alert';
    let body = payload.message || '';
    let icon = '/src/assets/images/crypto_analyst_avatar_1792422991031.jpg';

    if (payload.type === 'TRADE_FILLED') {
      title = `🤖 Trade Executed: ${payload.side} ${payload.symbol}`;
      body = `Filled at $${payload.price?.toLocaleString()} | Size: ${payload.amount}`;
    } else if (payload.type === 'STOP_LOSS') {
      title = `🛡️ Stop-Loss Hit: ${payload.symbol}`;
      body = `Position closed at $${payload.price?.toLocaleString()} | PnL: ${payload.pnl && payload.pnl < 0 ? '-' : ''}$${Math.abs(payload.pnl || 0).toFixed(2)}`;
    } else if (payload.type === 'TAKE_PROFIT') {
      title = `🎯 Take-Profit Target Hit: ${payload.symbol}!`;
      body = `Target reached at $${payload.price?.toLocaleString()} | Profit Locked: +$${Math.abs(payload.pnl || 0).toFixed(2)}`;
    } else if (payload.type === 'PANIC') {
      title = `🚨 Emergency Panic Close All Triggered`;
      body = `All open positions closed at market. Bot execution paused.`;
    }

    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: `aether-${Date.now()}`,
    });

    // Close automatically after 6 seconds
    setTimeout(() => {
      try {
        notification.close();
      } catch (e) {
        // ignore
      }
    }, 6000);

    return true;
  } catch (err) {
    console.warn('Failed to dispatch browser notification:', err);
    return false;
  }
}
