import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validators';
import { success, error, unauthorized, validationError } from '@/lib/response';

/**
 * 获取用户信息
 * GET /api/user/profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
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
    });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return error('获取用户信息失败');
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

