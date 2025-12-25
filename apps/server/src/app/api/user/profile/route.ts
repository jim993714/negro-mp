import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest, validateTokenFromRequest } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validators';
import { success, error, unauthorized, validationError, ErrorCode } from '@/lib/response';

/**
 * 获取用户信息
 * GET /api/user/profile
 * 
 * 返回最新的用户数据，并验证token有效性
 * 如果token过期或账号已注销，返回对应错误码
 */
export async function GET(request: NextRequest) {
  try {
    const result = await validateTokenFromRequest(request);
    
    if (!result.valid) {
      // 根据不同错误类型返回不同错误码
      switch (result.error) {
        case 'NO_TOKEN':
        case 'INVALID_TOKEN':
          return error(ErrorCode.UNAUTHORIZED, '请先登录');
        case 'TOKEN_EXPIRED':
        case 'TOKEN_MISMATCH':
          return error(ErrorCode.TOKEN_EXPIRED, '登录已过期，请重新登录');
        case 'ACCOUNT_DELETED':
          return error(ErrorCode.ACCOUNT_DISABLED, '账号已被注销');
        case 'ACCOUNT_BANNED':
          return error(ErrorCode.ACCOUNT_DISABLED, '账号已被禁用');
        case 'USER_NOT_FOUND':
          return error(ErrorCode.USER_NOT_FOUND, '用户不存在');
        default:
          return unauthorized();
      }
    }
    
    const user = result.user;
    
    // 获取注销信息
    let deletionInfo = null;
    if (user.status === 'DELETING' && user.deletionScheduledAt) {
      const now = new Date();
      const scheduledAt = new Date(user.deletionScheduledAt);
      const diffTime = scheduledAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      deletionInfo = {
        isDeletionPending: true,
        deletionRequestedAt: user.deletionRequestedAt,
        deletionScheduledAt: user.deletionScheduledAt,
        daysRemaining: Math.max(0, daysRemaining),
      };
    }
    
    return success({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      status: user.status,
      balance: user.balance,
      frozenBalance: user.frozenBalance,
      boosterProfile: user.boosterProfile,
      createdAt: user.createdAt,
      deletionInfo,
    });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return error(ErrorCode.SYSTEM_ERROR, '获取用户信息失败');
  }
}

/**
 * 更新用户信息
 * PUT /api/user/profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
    }
    
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);
    
    if (!result.success) {
      return validationError('参数错误', result.error.errors);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: result.data,
      include: { boosterProfile: true },
    });
    
    return success({
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
      balance: updatedUser.balance,
      frozenBalance: updatedUser.frozenBalance,
      boosterProfile: updatedUser.boosterProfile,
    });
  } catch (err) {
    console.error('更新用户信息失败:', err);
    return error('更新用户信息失败');
  }
}

