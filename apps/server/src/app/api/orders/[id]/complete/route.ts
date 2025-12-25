import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized, notFound, forbidden } from '@/lib/response';

/**
 * 代练师提交完成
 * POST /api/orders/:id/complete
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
    
    // 检查是否是该订单的代练师
    if (order.boosterId !== user.id) {
      return forbidden('只有接单代练师可以提交完成');
    }
    
    if (order.status !== 'IN_PROGRESS' && order.status !== 'ACCEPTED') {
      return error('订单状态不正确');
    }
    
    // 更新订单状态为待确认
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'CONFIRMING',
        },
      });
      
      // 通知发单者确认
      await tx.notification.create({
        data: {
          userId: order.playerId,
          type: 'ORDER',
          title: '订单待确认',
          content: `订单 ${order.orderNo} 代练师已提交完成，请确认验收`,
          data: JSON.stringify({ orderId: order.id }),
        },
      });
      
      return updated;
    });
    
    return success(updatedOrder, '已提交完成，等待玩家确认');
  } catch (err) {
    console.error('提交完成失败:', err);
    return error('提交完成失败');
  }
}

