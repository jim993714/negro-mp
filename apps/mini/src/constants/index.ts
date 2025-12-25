// API 状态码
export const API_CODE = {
  SUCCESS: 0,
  ERROR: -1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};

// 订单状态映射
export const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  CONFIRMING: '待确认',
  CANCELLED: '已取消',
  DISPUTED: '争议中',
  REFUNDED: '已退款',
};

// 订单状态颜色
export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: '#FF9500',
  ACCEPTED: '#007AFF',
  IN_PROGRESS: '#34C759',
  PAUSED: '#8E8E93',
  COMPLETED: '#30D158',
  CONFIRMING: '#AF52DE',
  CANCELLED: '#FF3B30',
  DISPUTED: '#FF2D55',
  REFUNDED: '#5856D6',
};

// 用户角色映射
export const USER_ROLE_MAP: Record<string, string> = {
  PLAYER: '玩家',
  BOOSTER: '代练师',
  ADMIN: '管理员',
};

// 交易类型映射
export const TRANSACTION_TYPE_MAP: Record<string, string> = {
  RECHARGE: '充值',
  WITHDRAW: '提现',
  ORDER_PAY: '订单支付',
  ORDER_INCOME: '订单收入',
  REFUND: '退款',
  COMMISSION: '佣金扣除',
  FROZEN: '冻结',
  UNFROZEN: '解冻',
};

// 平台配置
export const PLATFORM_CONFIG = {
  COMMISSION_RATE: 0.1,
  MIN_WITHDRAW_AMOUNT: 10,
  ORDER_TIMEOUT_HOURS: 24,
  REVIEW_DEADLINE_DAYS: 7,
  DISPUTE_DEADLINE_DAYS: 3,
};

// 工具函数
export function formatDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CONFIRMING = 'CONFIRMING',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

