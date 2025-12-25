import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized, notFound, forbidden } from '@/lib/response';

/**
 * 取消订单
 * POST /api/orders/:id/cancel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
    }
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!order) {
      return notFound('订单不存在');
    }
    
    // 检查权限
    const isPlayer = order.playerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    
    if (!isPlayer && !isAdmin) {
      return forbidden('没有权限取消此订单');
    }
    
    // 只有待接单状态可以取消
    if (order.status !== 'PENDING') {
      return error('当前订单状态无法取消，请联系客服');
    }
    
    // 取消订单，退还冻结金额
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 更新订单状态
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
        },
      });
      
      // 解冻并退还玩家余额
      const player = await tx.user.update({
        where: { id: order.playerId },
        data: {
          balance: { increment: order.price },
          frozenBalance: { decrement: order.price },
        },
      });
      
      // 创建退款记录
      await tx.transaction.create({
        data: {
          userId: order.playerId,
          orderId: order.id,
          type: 'REFUND',
          amount: order.price,
          balance: player.balance,
          description: `订单 ${order.orderNo} 取消退款`,
        },
      });
      
      return updated;
    });
    
    return success(updatedOrder, '订单已取消，金额已退还');
  } catch (err) {
    console.error('取消订单失败:', err);
    return error('取消订单失败');
  }
}

