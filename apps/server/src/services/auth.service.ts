/**
 * 认证服务
 * @description 处理用户认证相关的业务逻辑
 */
import { prisma } from '@negro/database'
import { hashPassword, verifyPassword, signToken } from '@/lib/auth'
import { generateDefaultAvatar } from '@/lib/avatar'
import { randomBytes } from 'crypto'

// 用户信息返回类型
export interface UserResponse {
  id: string
  nickname: string
  avatar: string
  phone: string | null
  role: string
}

// 登录结果
export interface AuthResult {
  success: boolean
  message?: string
  data?: {
    token: string
    user: UserResponse
  }
}

/**
 * 生成本地用户 openid
 */
function generateLocalOpenid(): string {
  return `local_${randomBytes(16).toString('hex')}`
}

/**
 * 格式化用户信息
 */
function formatUser(user: any): UserResponse {
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    role: user.role,
  }
}

/**
 * 账号密码登录
 */
export async function loginWithPassword(account: string, password: string): Promise<AuthResult> {
  // 查找用户（支持手机号或用户名）
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: account },
        { nickname: account },
      ],
    },
  })

  if (!user) {
    return { success: false, message: '账号不存在' }
  }

  if (user.status === 'BANNED') {
    return { success: false, message: '账号已被禁用' }
  }

  if (!user.password) {
    return { success: false, message: '该账号未设置密码，请使用手机号登录' }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { success: false, message: '密码错误' }
  }

  const token = await signToken({ userId: user.id, role: user.role })

  return {
    success: true,
    data: { token, user: formatUser(user) },
  }
}

/**
 * 手机号登录
 */
export async function loginWithPhone(
  openid: string,
  phoneNumber: string,
  unionid?: string
): Promise<AuthResult> {
  // 先通过 openid 查找
  let user = await prisma.user.findUnique({ where: { openid } })

  if (user) {
    // 更新手机号
    if (user.phone !== phoneNumber) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: phoneNumber },
      })
    }
  } else {
    // 通过手机号查找（可能是账号密码注册的用户）
    const phoneUser = await prisma.user.findFirst({ where: { phone: phoneNumber } })

    if (phoneUser) {
      // 绑定微信 openid
      user = await prisma.user.update({
        where: { id: phoneUser.id },
        data: { openid, unionid: unionid || phoneUser.unionid },
      })
    } else {
      // 创建新用户
      const nickname = `用户${phoneNumber.slice(-4)}`
      user = await prisma.user.create({
        data: {
          openid,
          unionid,
          phone: phoneNumber,
          nickname,
          avatar: generateDefaultAvatar(nickname),
          role: 'PLAYER',
          status: 'ACTIVE',
        },
      })
    }
  }

  if (user.status === 'BANNED') {
    return { success: false, message: '账号已被禁用' }
  }

  const token = await signToken({ userId: user.id, role: user.role })

  return {
    success: true,
    data: { token, user: formatUser(user) },
  }
}

/**
 * 注册
 */
export async function register(
  username: string,
  password: string,
  phone?: string
): Promise<AuthResult> {
  // 检查用户名是否存在
  const existingUser = await prisma.user.findFirst({
    where: { nickname: username },
  })
  if (existingUser) {
    return { success: false, message: '用户名已被使用' }
  }

  // 检查手机号是否存在
  if (phone) {
    const existingPhone = await prisma.user.findFirst({ where: { phone } })
    if (existingPhone) {
      return { success: false, message: '手机号已被注册' }
    }
  }

  // 加密密码
  const hashedPassword = await hashPassword(password)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      openid: generateLocalOpenid(),
      nickname: username,
      avatar: generateDefaultAvatar(username),
      password: hashedPassword,
      phone: phone || null,
      role: 'PLAYER',
      status: 'ACTIVE',
    },
  })

  const token = await signToken({ userId: user.id, role: user.role })

  return {
    success: true,
    data: { token, user: formatUser(user) },
  }
}

