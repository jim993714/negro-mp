import { z } from 'zod';

/**
 * 登录请求验证
 */
export const loginSchema = z.object({
  code: z.string().min(1, '登录 code 不能为空'),
});

/**
 * 更新用户信息验证
 */
export const updateUserSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
});

/**
 * 代练师认证验证
 */
export const boosterApplySchema = z.object({
  realName: z.string().min(2, '姓名至少2个字符').max(20),
  idCard: z.string().regex(/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, '身份证格式不正确'),
  games: z.array(z.string()).min(1, '至少选择一个游戏'),
  introduction: z.string().max(500, '简介不能超过500字').optional(),
  certificates: z.array(z.string()).optional(),
});

/**
 * 创建订单验证
 */
export const createOrderSchema = z.object({
  gameId: z.string().min(1, '请选择游戏'),
  serverId: z.string().min(1, '请选择区服'),
  boostTypeId: z.string().min(1, '请选择代练类型'),
  gameAccount: z.string().min(1, '请输入游戏账号'),
  gamePassword: z.string().min(1, '请输入游戏密码'),
  gameRole: z.string().optional(),
  currentLevel: z.string().min(1, '请输入当前段位/等级'),
  targetLevel: z.string().min(1, '请输入目标段位/等级'),
  requirements: z.string().max(500).optional(),
  price: z.number().min(100, '订单金额不能小于1元'),
  deadline: z.string().optional(),
});

/**
 * 订单进度更新验证
 */
export const orderProgressSchema = z.object({
  content: z.string().min(1, '请输入进度内容').max(500),
  images: z.array(z.string()).max(9, '最多上传9张图片').optional(),
});

/**
 * 评价验证
 */
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  isAnonymous: z.boolean().optional(),
});

/**
 * 分页查询参数验证
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

/**
 * 订单查询参数验证
 */
export const orderQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  gameId: z.string().optional(),
});

