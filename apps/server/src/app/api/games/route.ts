import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { success, error } from '@/lib/response';

/**
 * 获取游戏列表
 * GET /api/games
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    const games = await prisma.gameCategory.findMany({
      where: active === 'true' ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
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
    
    return success(games);
  } catch (err) {
    console.error('获取游戏列表失败:', err);
    return error('获取游戏列表失败');
  }
}

