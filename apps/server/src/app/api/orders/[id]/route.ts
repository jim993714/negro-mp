import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { checkAuthWithDeletion } from '@/lib/auth';
import { success, error, unauthorized, notFound, forbidden } from '@/lib/response';

/**
 * 获取订单详情
 * GET /api/orders/:id
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
      include: {
        game: true,
        server: true,
        boostType: true,
        player: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
        booster: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
            boosterProfile: {
              select: {
                rating: true,
                completedOrders: true,
                introduction: true,
              },
            },
          },
        },
        progresses: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            fromUser: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    
    if (!order) {
      return notFound('订单不存在');
    }
    
    // 检查权限：只有订单相关方可以查看
    const isPlayer = order.playerId === user.id;
    const isBooster = order.boosterId === user.id;
    const isAdmin = user.role === 'ADMIN';
    const isPending = order.status === 'PENDING';
    
    if (!isPlayer && !isBooster && !isAdmin && !isPending) {
      return forbidden('没有权限查看此订单');
    }
    
    // 隐藏敏感信息
    const response = {
      ...order,
      gameAccount: isPlayer || isBooster || isAdmin ? order.gameAccount : '******',
      gamePassword: isPlayer || isBooster || isAdmin ? order.gamePassword : '******',
    };
    
    return success(response);
  } catch (err) {
    console.error('获取订单详情失败:', err);
    return error('获取订单详情失败');
  }
}

