import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Token有效期：7天（毫秒）
const TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  openid?: string;
  role: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * 签发 Token 并保存到数据库
 */
export async function signTokenAndSave(payload: Omit<JWTPayload, 'openid'> & { openid?: string }): Promise<{ token: string; expiredAt: Date }> {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  const expiredAt = new Date(Date.now() + TOKEN_EXPIRES_IN_MS);
  
  // 保存token到数据库
  await prisma.user.update({
    where: { id: payload.userId },
    data: {
      token,
      tokenExpiredAt: expiredAt,
    },
  });
  
  return { token, expiredAt };
}

/**
 * 签发 Token（别名，兼容旧代码）
 */
export async function signToken(payload: Omit<JWTPayload, 'openid'> & { openid?: string }): Promise<string> {
  const { token } = await signTokenAndSave(payload);
  return token;
}

/**
 * 密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Token验证结果
export interface TokenValidationResult {
  valid: boolean;
  user: any | null;
  error?: 'NO_TOKEN' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'TOKEN_MISMATCH' | 'USER_NOT_FOUND' | 'ACCOUNT_DELETED' | 'ACCOUNT_BANNED';
}

/**
 * 从请求中获取用户信息（增强版，验证数据库token）
 */
export async function getUserFromRequest(request: NextRequest) {
  const result = await validateTokenFromRequest(request);
  return result.valid ? result.user : null;
}

/**
 * 验证请求中的Token并返回详细结果
 */
export async function validateTokenFromRequest(request: NextRequest): Promise<TokenValidationResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, user: null, error: 'NO_TOKEN' };
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return { valid: false, user: null, error: 'INVALID_TOKEN' };
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { boosterProfile: true },
  });
  
  if (!user) {
    return { valid: false, user: null, error: 'USER_NOT_FOUND' };
  }
  
  // 检查账号状态
  if (user.status === 'DELETED') {
    return { valid: false, user: null, error: 'ACCOUNT_DELETED' };
  }
  
  if (user.status === 'BANNED') {
    return { valid: false, user: null, error: 'ACCOUNT_BANNED' };
  }
  
  // 验证数据库中的token是否匹配
  // 如果数据库中有token记录，则需要匹配
  // 如果数据库中没有token（老用户/迁移用户），则跳过匹配检查
  if (user.token && user.token !== token) {
    return { valid: false, user: null, error: 'TOKEN_MISMATCH' };
  }
  
  // 检查token是否过期（只有当数据库中有过期时间记录时才检查）
  if (user.tokenExpiredAt && new Date() > new Date(user.tokenExpiredAt)) {
    return { valid: false, user: null, error: 'TOKEN_EXPIRED' };
  }
  
  return { valid: true, user };
}

/**
 * 清除用户的Token（登出时使用）
 */
export async function clearUserToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      token: null,
      tokenExpiredAt: null,
    },
  });
}

/**
 * 微信登录获取 openid
 */
export async function getWechatOpenid(code: string): Promise<{ openid: string; session_key: string } | null> {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  
  if (!appId || !appSecret) {
    console.error('微信配置缺失');
    return null;
  }
  
  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.errcode) {
      console.error('微信登录失败:', data);
      return null;
    }
    
    return {
      openid: data.openid,
      session_key: data.session_key,
    };
  } catch (error) {
    console.error('微信登录请求失败:', error);
    return null;
  }
}

