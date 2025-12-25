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
  PLAYER = 'PLAYER',
  BOOSTER = 'BOOSTER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
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
  games: string[];
  introduction: string;
  certificates: string[];
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
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  isActive: boolean;
  sortOrder: number;
}

// 订单状态
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

// 订单
export interface Order {
  id: string;
  orderNo: string;
  playerId: string;
  boosterId?: string;
  gameId: string;
  serverId: string;
  boostTypeId: string;
  gameAccount: string;
  gamePassword: string;
  gameRole: string;
  currentLevel: string;
  targetLevel: string;
  requirements: string;
  price: number;
  deposit: number;
  commission: number;
  status: OrderStatus;
  deadline?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  game?: GameCategory;
  server?: GameServer;
  boostType?: BoostType;
  player?: { id: string; nickname: string; avatar: string };
  booster?: { 
    id: string; 
    nickname: string; 
    avatar: string;
    boosterProfile?: { rating: number; completedOrders: number };
  };
  progresses?: OrderProgress[];
}

// 订单进度
export interface OrderProgress {
  id: string;
  orderId: string;
  content: string;
  images: string[];
  createdAt: Date;
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
  price: number;
  deadline?: string;
}

