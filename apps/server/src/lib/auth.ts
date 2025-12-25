import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface JWTPayload {
  userId: string;
  openid?: string;
  role: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 签发 Token（别名）
 */
export async function signToken(payload: Omit<JWTPayload, 'openid'> & { openid?: string }): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
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

/**
 * 从请求中获取用户信息
 */
export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { boosterProfile: true },
  });
  
  return user;
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

