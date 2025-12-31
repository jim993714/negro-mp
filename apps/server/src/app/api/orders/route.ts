import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { generateOrderNo, calculateCommission, PLATFORM_CONFIG } from '@negro/shared';
import { checkAuthWithDeletion } from '@/lib/auth';
import { createOrderSchema, orderQuerySchema } from '@/lib/validators';
import { success, error, unauthorized, validationError, forbidden } from '@/lib/response';

/**
 * 获取订单列表
 * GET /api/orders
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await checkAuthWithDeletion(request);
    
    if (response) {
      return response;
    }
    
    if (!user) {
      return unauthorized();
    }
    
    const { searchParams } = new URL(request.url);
    const queryResult = orderQuerySchema.safeParse(Object.fromEntries(searchParams));
    
    if (!queryResult.success) {
      return validationError('参数错误', queryResult.error.errors);
    }
    
    const { page, pageSize, status, gameId } = queryResult.data;
    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    // 根据角色过滤
    if (user.role === 'PLAYER') {
      where.playerId = user.id;
    } else if (user.role === 'BOOSTER') {
      // 代练师可以看到待接单的和自己接的订单
      where.OR = [
        { boosterId: user.id },
        { status: 'PENDING' },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (gameId) {
      where.gameId = gameId;
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          game: true,
          server: true,
          boostType: true,
          player: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
          booster: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              boosterProfile: {
                select: {
                  rating: true,
                  completedOrders: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    
    return success({
      items: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    return error('获取订单列表失败');
  }
}

/**
 * 创建订单
 * POST /api/orders
 */
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await checkAuthWithDeletion(request);
    
    if (response) {
      return response;
    }
    
    if (!user) {
      return unauthorized();
    }
    
    if (user.role !== 'PLAYER') {
      return forbidden('只有玩家可以发布订单');
    }
    
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);
    
    if (!result.success) {
      return validationError('参数错误', result.error.errors);
    }
    
    const data = result.data;
    
    // 验证游戏、区服、代练类型是否存在
    const [game, server, boostType] = await Promise.all([
      prisma.gameCategory.findUnique({ where: { id: data.gameId } }),
      prisma.gameServer.findUnique({ where: { id: data.serverId } }),
      prisma.boostType.findUnique({ where: { id: data.boostTypeId } }),
    ]);
    
    if (!game || !server || !boostType) {
      return validationError('游戏、区服或代练类型不存在');
    }
    
    // 检查余额
    if (user.balance < data.price) {
      return error('余额不足，请先充值');
    }
    
    // 计算佣金
    const commission = calculateCommission(data.price, PLATFORM_CONFIG.COMMISSION_RATE);
    
    // 创建订单并冻结金额
    const order = await prisma.$transaction(async (tx) => {
      // 冻结用户余额
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: data.price },
          frozenBalance: { increment: data.price },
        },
      });
      
      // 创建交易记录
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'FROZEN',
          amount: -data.price,
          balance: user.balance - data.price,
          description: '订单金额冻结',
        },
      });
      
      // 创建订单
      return tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          playerId: user.id,
          gameId: data.gameId,
          serverId: data.serverId,
          boostTypeId: data.boostTypeId,
          gameAccount: data.gameAccount,
          gamePassword: data.gamePassword,
          gameRole: data.gameRole || '',
          currentLevel: data.currentLevel,
          targetLevel: data.targetLevel,
          requirements: data.requirements || '',
          price: data.price,
          commission,
          deadline: data.deadline ? new Date(data.deadline) : null,
          status: 'PENDING',
        },
        include: {
          game: true,
          server: true,
          boostType: true,
        },
      });
    });
    
    return success(order, '订单创建成功');
  } catch (err) {
    console.error('创建订单失败:', err);
    return error('创建订单失败');
  }
}

