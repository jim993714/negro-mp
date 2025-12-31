import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { checkAuthWithDeletion } from '@/lib/auth';
import { success, error, unauthorized, notFound, forbidden } from '@/lib/response';

/**
 * 接单
 * POST /api/orders/:id/accept
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response } = await checkAuthWithDeletion(request);
    
    if (response) {
      return response;
    }
    
    if (!user) {
      return unauthorized();
    }
    
    // 检查是否是代练师
    if (user.role !== 'BOOSTER') {
      return forbidden('只有代练师可以接单');
    }
    
    // 检查代练师是否已认证
    if (!user.boosterProfile?.isVerified) {
      return forbidden('请先完成代练师认证');
    }
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!order) {
      return notFound('订单不存在');
    }
    
    if (order.status !== 'PENDING') {
      return error('订单状态不正确，无法接单');
    }
    
    // 更新订单
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 更新订单状态
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          boosterId: user.id,
          status: 'ACCEPTED',
          startedAt: new Date(),
        },
        include: {
          game: true,
          server: true,
          boostType: true,
        },
      });
      
      // 更新代练师接单数
      await tx.boosterProfile.update({
        where: { userId: user.id },
        data: {
          totalOrders: { increment: 1 },
        },
      });
      
      // 创建通知给发单者
      await tx.notification.create({
        data: {
          userId: order.playerId,
          type: 'ORDER',
          title: '订单已被接取',
          content: `您的订单 ${order.orderNo} 已被代练师接取，请保持账号畅通`,
          data: JSON.stringify({ orderId: order.id }),
        },
      });
      
      return updated;
    });
    
    return success(updatedOrder, '接单成功');
  } catch (err) {
    console.error('接单失败:', err);
    return error('接单失败');
  }
}

