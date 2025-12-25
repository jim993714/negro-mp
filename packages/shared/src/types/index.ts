// 用户相关类型
export interface User {
  id: string;
  openid: string;
  nickname: string;
  avatar: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  frozenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  PLAYER = 'PLAYER',       // 普通玩家（发单者）
  BOOSTER = 'BOOSTER',     // 代练师（接单者）
  ADMIN = 'ADMIN',         // 管理员
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',       // 正常
  BANNED = 'BANNED',       // 封禁
  PENDING = 'PENDING',     // 待审核
}

// 代练师信息
export interface BoosterProfile {
  id: string;
  userId: string;
  realName: string;
  idCard: string;
  isVerified: boolean;
  rating: number;
  totalOrders: number;
  completedOrders: number;
  games: string[];         // 擅长的游戏
  introduction: string;
  certificates: string[];  // 资质证书图片
  createdAt: Date;
  updatedAt: Date;
}

// 游戏分类
export interface GameCategory {
  id: string;
  name: string;
  icon: string;
  cover: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 游戏区服
export interface GameServer {
  id: string;
  gameId: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

// 代练类型
export interface BoostType {
  id: string;
  gameId: string;
  name: string;            // 如：段位代练、等级代练、任务代练
  description: string;
  basePrice: number;       // 基础价格
  unit: string;            // 单位：段、级、个
  isActive: boolean;
  sortOrder: number;
}

// 订单
export interface Order {
  id: string;
  orderNo: string;         // 订单号
  playerId: string;        // 发单玩家
  boosterId?: string;      // 代练师
  gameId: string;
  serverId: string;
  boostTypeId: string;
  
  // 游戏账号信息
  gameAccount: string;
  gamePassword: string;
  gameRole: string;
  
  // 代练内容
  currentLevel: string;    // 当前段位/等级
  targetLevel: string;     // 目标段位/等级
  requirements: string;    // 特殊要求
  
  // 价格
  price: number;
  deposit: number;         // 定金
  commission: number;      // 平台佣金
  
  // 状态
  status: OrderStatus;
  
  // 时间
  deadline?: Date;         // 截止时间
  startedAt?: Date;        // 开始时间
  completedAt?: Date;      // 完成时间
  
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',           // 待接单
  ACCEPTED = 'ACCEPTED',         // 已接单
  IN_PROGRESS = 'IN_PROGRESS',   // 进行中
  PAUSED = 'PAUSED',             // 已暂停
  COMPLETED = 'COMPLETED',       // 已完成
  CONFIRMING = 'CONFIRMING',     // 待确认
  CANCELLED = 'CANCELLED',       // 已取消
  DISPUTED = 'DISPUTED',         // 争议中
  REFUNDED = 'REFUNDED',         // 已退款
}

// 订单进度更新
export interface OrderProgress {
  id: string;
  orderId: string;
  content: string;
  images: string[];
  createdAt: Date;
}

// 评价
export interface Review {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;          // 1-5 星
  content: string;
  tags: string[];          // 评价标签
  isAnonymous: boolean;
  createdAt: Date;
}

// 消息通知
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',             // 系统通知
  ORDER = 'ORDER',               // 订单相关
  PAYMENT = 'PAYMENT',           // 支付相关
  REVIEW = 'REVIEW',             // 评价相关
  PROMOTION = 'PROMOTION',       // 推广活动
}

// 交易记录
export interface Transaction {
  id: string;
  userId: string;
  orderId?: string;
  type: TransactionType;
  amount: number;
  balance: number;         // 交易后余额
  description: string;
  createdAt: Date;
}

export enum TransactionType {
  RECHARGE = 'RECHARGE',         // 充值
  WITHDRAW = 'WITHDRAW',         // 提现
  ORDER_PAY = 'ORDER_PAY',       // 订单支付
  ORDER_INCOME = 'ORDER_INCOME', // 订单收入
  REFUND = 'REFUND',             // 退款
  COMMISSION = 'COMMISSION',     // 佣金扣除
  FROZEN = 'FROZEN',             // 冻结
  UNFROZEN = 'UNFROZEN',         // 解冻
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 登录相关
export interface LoginRequest {
  code: string;            // 微信登录 code
}

export interface LoginResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

// 订单创建请求
export interface CreateOrderRequest {
  gameId: string;
  serverId: string;
  boostTypeId: string;
  gameAccount: string;
  gamePassword: string;
  gameRole: string;
  currentLevel: string;
  targetLevel: string;
  requirements?: string;
  deadline?: string;
}

// 查询参数
export interface OrderQueryParams {
  status?: OrderStatus;
  gameId?: string;
  page?: number;
  pageSize?: number;
}

