/**
 * 头像上传接口
 * POST /api/user/avatar
 */
import { NextRequest } from 'next/server';
import { prisma } from '@negro/database';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/response';
import { generateDefaultAvatar } from '@/lib/avatar';

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 上传头像
 * POST /api/user/avatar
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return unauthorized();
    }
    
    // 解析 multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return error(1001, '请选择要上传的图片');
    }
    
    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return error(1002, '只支持 JPG、PNG、GIF、WebP 格式的图片');
    }
    
    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return error(1003, '图片大小不能超过 5MB');
    }
    
    // 读取文件内容并转换为 base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    
    // 生成 data URL 作为头像（适用于小型应用）
    // 生产环境建议使用 OSS 存储
    const avatarUrl = `data:${mimeType};base64,${base64}`;
    
    // 如果头像太大（base64后超过500KB），使用默认头像
    if (avatarUrl.length > 500 * 1024) {
      // 使用第三方头像服务
      const timestamp = Date.now();
      const newAvatarUrl = generateDefaultAvatar(user.nickname + timestamp);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: newAvatarUrl },
      });
      
      return success({ avatar: newAvatarUrl }, '头像更新成功');
    }
    
    // 更新用户头像
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    });
    
    return success({
      avatar: updatedUser.avatar,
    }, '头像上传成功');
  } catch (err) {
    console.error('上传头像失败:', err);
    return error(5000, '上传头像失败');
  }
}

