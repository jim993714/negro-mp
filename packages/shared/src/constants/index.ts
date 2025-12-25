// API 状态码
export const API_CODE = {
  SUCCESS: 0,
  ERROR: -1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
} as const;

// 订单状态映射
export const ORDER_STATUS_MAP = {
  PENDING: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  CONFIRMING: '待确认',
  CANCELLED: '已取消',
  DISPUTED: '争议中',
  REFUNDED: '已退款',
} as const;

// 订单状态颜色
export const ORDER_STATUS_COLOR = {
  PENDING: '#FF9500',
  ACCEPTED: '#007AFF',
  IN_PROGRESS: '#34C759',
  PAUSED: '#8E8E93',
  COMPLETED: '#30D158',
  CONFIRMING: '#AF52DE',
  CANCELLED: '#FF3B30',
  DISPUTED: '#FF2D55',
  REFUNDED: '#5856D6',
} as const;

// 用户角色映射
export const USER_ROLE_MAP = {
  PLAYER: '玩家',
  BOOSTER: '代练师',
  ADMIN: '管理员',
} as const;

// 交易类型映射
export const TRANSACTION_TYPE_MAP = {
  RECHARGE: '充值',
  WITHDRAW: '提现',
  ORDER_PAY: '订单支付',
  ORDER_INCOME: '订单收入',
  REFUND: '退款',
  COMMISSION: '佣金扣除',
  FROZEN: '冻结',
  UNFROZEN: '解冻',
} as const;

// 平台配置
export const PLATFORM_CONFIG = {
  // 平台佣金比例 (10%)
  COMMISSION_RATE: 0.1,
  // 最低提现金额
  MIN_WITHDRAW_AMOUNT: 10,
  // 订单超时时间（小时）
  ORDER_TIMEOUT_HOURS: 24,
  // 评价时限（天）
  REVIEW_DEADLINE_DAYS: 7,
  // 申诉时限（天）
  DISPUTE_DEADLINE_DAYS: 3,
} as const;

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// 评价标签
export const REVIEW_TAGS = {
  POSITIVE: ['速度快', '技术好', '态度好', '守时', '有耐心', '值得信赖'],
  NEGATIVE: ['速度慢', '技术差', '态度差', '不守时', '不耐心', '不推荐'],
} as const;

// 热门游戏 ID
export const POPULAR_GAMES = {
  KING_OF_GLORY: 'king-of-glory',
  LEAGUE_OF_LEGENDS: 'lol',
  PEACE_ELITE: 'peace-elite',
  GENSHIN_IMPACT: 'genshin',
  VALORANT: 'valorant',
  APEX_LEGENDS: 'apex',
} as const;

