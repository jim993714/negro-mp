import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { success, error, notFound } from '@/lib/response';

/**
 * 获取游戏详情
 * GET /api/games/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await prisma.gameCategory.findUnique({
      where: { id: params.id },
      include: {
        servers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        boostTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    
    if (!game) {
      return notFound('游戏不存在');
    }
    
    return success(game);
  } catch (err) {
    console.error('获取游戏详情失败:', err);
    return error('获取游戏详情失败');
  }
}

