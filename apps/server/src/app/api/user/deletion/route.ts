/**
 * 账号注销相关接口
 * 
 * 注销流程：
 * 1. 用户申请注销账号
 * 2. 账号进入7天冷静期（status: DELETING）
 * 3. 7天内登录会提示可取消注销
 * 4. 7天后账号自动删除（status: DELETED）
 */
import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { validateTokenFromRequest } from '@/lib/auth';
import { success, error, unauthorized, ErrorCode } from '@/lib/response';

// 注销冷静期天数
const DELETION_COOLING_DAYS = 7;

/**
 * 获取注销状态
 * GET /api/user/deletion
 * 注意：此接口允许 DELETING 状态的用户访问
 */
export async function GET(request: NextRequest) {
  try {
    const result = await validateTokenFromRequest(request);
    
    // 对于 DELETING 状态，仍然允许访问此接口
    const user = result.user;
    
    if (!user && result.error !== 'ACCOUNT_DELETING') {
      return unauthorized();
    }
    
    // 检查是否在注销中
    const isDeletionPending = user.status === 'DELETING' && user.deletionScheduledAt;
    
    if (!isDeletionPending) {
      return success({
        isDeletionPending: false,
        deletionRequestedAt: null,
        deletionScheduledAt: null,
        daysRemaining: null,
      });
    }
    
    // 计算剩余天数
    const now = new Date();
    const scheduledAt = new Date(user.deletionScheduledAt!);
    const diffTime = scheduledAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return success({
      isDeletionPending: true,
      deletionRequestedAt: user.deletionRequestedAt,
      deletionScheduledAt: user.deletionScheduledAt,
      daysRemaining: Math.max(0, daysRemaining),
    });
  } catch (err) {
    console.error('获取注销状态失败:', err);
    return error(5000, '获取注销状态失败');
  }
}

/**
 * 申请注销账号
 * POST /api/user/deletion
 */
export async function POST(request: NextRequest) {
  try {
    const result = await validateTokenFromRequest(request);
    const user = result.user;
    
    if (!user) {
      return unauthorized();
    }
    
    // 检查账号状态
    if (user.status === 'DELETING') {
      return error(2001, '账号已在注销流程中');
    }
    
    if (user.status === 'DELETED') {
      return error(2002, '账号已被注销');
    }
    
    if (user.status === 'BANNED') {
      return error(2003, '账号已被禁用，无法注销');
    }
    
    // 检查是否有未完成的订单
    const pendingOrders = await prisma.order.count({
      where: {
        OR: [
          { playerId: user.id },
          { boosterId: user.id },
        ],
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'PAUSED', 'CONFIRMING'],
        },
      },
    });
    
    if (pendingOrders > 0) {
      return error(2004, `您还有 ${pendingOrders} 个未完成的订单，请处理完毕后再注销账号`);
    }
    
    // 检查余额
    if (user.balance > 0 || user.frozenBalance > 0) {
      return error(2005, '您的账户还有余额，请先提现后再注销账号');
    }
    
    // 计算注销时间（7天后）
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + DELETION_COOLING_DAYS * 24 * 60 * 60 * 1000);
    
    // 更新用户状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'DELETING',
        deletionRequestedAt: now,
        deletionScheduledAt: scheduledAt,
      },
    });
    
    return success({
      deletionRequestedAt: now,
      deletionScheduledAt: scheduledAt,
      daysRemaining: DELETION_COOLING_DAYS,
    }, '注销申请已提交，账号将在7天后注销。期间可随时取消');
  } catch (err) {
    console.error('申请注销失败:', err);
    return error(5000, '申请注销失败');
  }
}

/**
 * 取消注销
 * DELETE /api/user/deletion
 * 注意：此接口允许 DELETING 状态的用户访问
 */
export async function DELETE(request: NextRequest) {
  try {
    const result = await validateTokenFromRequest(request);
    
    // 对于 DELETING 状态，仍然允许访问此接口
    const user = result.user;
    
    if (!user && result.error !== 'ACCOUNT_DELETING') {
      return unauthorized();
    }
    
    // 检查是否在注销流程中
    if (user.status !== 'DELETING') {
      return error(2006, '账号不在注销流程中');
    }
    
    // 取消注销，恢复账号状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        deletionRequestedAt: null,
        deletionScheduledAt: null,
      },
    });
    
    return success(null, '已取消注销，账号已恢复正常');
  } catch (err) {
    console.error('取消注销失败:', err);
    return error(5000, '取消注销失败');
  }
}

