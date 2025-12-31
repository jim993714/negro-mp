import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { checkAuthWithDeletion } from '@/lib/auth';
import { orderProgressSchema } from '@/lib/validators';
import { success, error, unauthorized, notFound, forbidden, validationError } from '@/lib/response';

/**
 * 获取订单进度
 * GET /api/orders/:id/progress
 */
export async function GET(
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
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!order) {
      return notFound('订单不存在');
    }
    
    // 检查权限
    const isPlayer = order.playerId === user.id;
    const isBooster = order.boosterId === user.id;
    const isAdmin = user.role === 'ADMIN';
    
    if (!isPlayer && !isBooster && !isAdmin) {
      return forbidden('没有权限查看此订单');
    }
    
    const progresses = await prisma.orderProgress.findMany({
      where: { orderId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    
    return success(progresses);
  } catch (err) {
    console.error('获取订单进度失败:', err);
    return error('获取订单进度失败');
  }
}

/**
 * 添加订单进度
 * POST /api/orders/:id/progress
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
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!order) {
      return notFound('订单不存在');
    }
    
    // 只有代练师可以更新进度
    if (order.boosterId !== user.id) {
      return forbidden('只有接单代练师可以更新进度');
    }
    
    if (order.status !== 'IN_PROGRESS' && order.status !== 'ACCEPTED') {
      return error('当前订单状态无法更新进度');
    }
    
    const body = await request.json();
    const result = orderProgressSchema.safeParse(body);
    
    if (!result.success) {
      return validationError('参数错误', result.error.errors);
    }
    
    const { content, images } = result.data;
    
    // 创建进度更新，同时将订单状态改为进行中
    const [progress] = await prisma.$transaction([
      prisma.orderProgress.create({
        data: {
          orderId: params.id,
          content,
          images: JSON.stringify(images || []),
        },
      }),
      prisma.order.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      }),
    ]);
    
    // 通知发单者
    await prisma.notification.create({
      data: {
        userId: order.playerId,
        type: 'ORDER',
        title: '订单进度更新',
        content: `订单 ${order.orderNo} 有新的进度更新`,
        data: JSON.stringify({ orderId: order.id }),
      },
    });
    
    return success(progress, '进度更新成功');
  } catch (err) {
    console.error('更新订单进度失败:', err);
    return error('更新订单进度失败');
  }
}

