import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized, notFound, forbidden } from '@/lib/response';

/**
 * 玩家确认完成
 * POST /api/orders/:id/confirm
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
    
    // 检查是否是发单者
    if (order.playerId !== user.id) {
      return forbidden('只有发单者可以确认完成');
    }
    
    if (order.status !== 'CONFIRMING') {
      return error('订单状态不正确');
    }
    
    if (!order.boosterId) {
      return error('订单数据异常');
    }
    
    // 完成订单，结算款项
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 更新订单状态
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
      
      // 扣除玩家冻结余额
      await tx.user.update({
        where: { id: order.playerId },
        data: {
          frozenBalance: { decrement: order.price },
        },
      });
      
      // 代练师收入 = 订单金额 - 佣金
      const boosterIncome = order.price - order.commission;
      
      // 增加代练师余额
      const booster = await tx.user.update({
        where: { id: order.boosterId! },
        data: {
          balance: { increment: boosterIncome },
        },
      });
      
      // 创建代练师收入记录
      await tx.transaction.create({
        data: {
          userId: order.boosterId!,
          orderId: order.id,
          type: 'ORDER_INCOME',
          amount: boosterIncome,
          balance: booster.balance,
          description: `订单 ${order.orderNo} 收入`,
        },
      });
      
      // 更新代练师完成订单数
      await tx.boosterProfile.update({
        where: { userId: order.boosterId! },
        data: {
          completedOrders: { increment: 1 },
        },
      });
      
      // 通知代练师
      await tx.notification.create({
        data: {
          userId: order.boosterId!,
          type: 'ORDER',
          title: '订单已完成',
          content: `订单 ${order.orderNo} 已确认完成，收入 ${boosterIncome / 100} 元已到账`,
          data: JSON.stringify({ orderId: order.id }),
        },
      });
      
      return updated;
    });
    
    return success(updatedOrder, '订单已完成');
  } catch (err) {
    console.error('确认完成失败:', err);
    return error('确认完成失败');
  }
}

