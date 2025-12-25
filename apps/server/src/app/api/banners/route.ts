import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { success, error } from '@/lib/response';

/**
 * 获取轮播图列表
 * GET /api/banners
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    const now = new Date();
    
    const banners = await prisma.banner.findMany({
      where: active === 'true' ? {
        isActive: true,
        OR: [
          { startTime: null },
          { startTime: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endTime: null },
              { endTime: { gte: now } },
            ],
          },
        ],
      } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    
    return success(banners);
  } catch (err) {
    console.error('获取轮播图失败:', err);
    return error('获取轮播图失败');
  }
}

