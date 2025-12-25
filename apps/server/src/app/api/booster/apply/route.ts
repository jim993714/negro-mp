import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { boosterApplySchema } from '@/lib/validators';
import { success, error, unauthorized, validationError } from '@/lib/response';

/**
 * 申请成为代练师
 * POST /api/booster/apply
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
    }
    
    // 检查是否已经申请过
    if (user.boosterProfile) {
      if (user.boosterProfile.isVerified) {
        return error('您已经是认证代练师');
      }
      return error('您的申请正在审核中');
    }
    
    const body = await request.json();
    const result = boosterApplySchema.safeParse(body);
    
    if (!result.success) {
      return validationError('参数错误', result.error.errors);
    }
    
    const data = result.data;
    
    // 创建代练师资料
    const profile = await prisma.$transaction(async (tx) => {
      // 更新用户角色
      await tx.user.update({
        where: { id: user.id },
        data: {
          role: 'BOOSTER',
          status: 'PENDING',
        },
      });
      
      // 创建代练师资料
      return tx.boosterProfile.create({
        data: {
          userId: user.id,
          realName: data.realName,
          idCard: data.idCard,
          games: JSON.stringify(data.games),
          introduction: data.introduction || '',
          certificates: JSON.stringify(data.certificates || []),
          isVerified: false, // 需要审核
        },
      });
    });
    
    return success(profile, '申请已提交，请等待审核');
  } catch (err) {
    console.error('申请代练师失败:', err);
    return error('申请失败');
  }
}

/**
 * 获取代练师申请状态
 * GET /api/booster/apply
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
    }
    
    const profile = await prisma.boosterProfile.findUnique({
      where: { userId: user.id },
    });
    
    return success({
      hasApplied: !!profile,
      isVerified: profile?.isVerified || false,
      profile,
    });
  } catch (err) {
    console.error('获取申请状态失败:', err);
    return error('获取失败');
  }
}

