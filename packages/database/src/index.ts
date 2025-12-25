import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// 防止开发环境热重载创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  
  // 如果使用 Prisma Accelerate/Postgres，启用扩展
  if (process.env.DATABASE_URL?.includes('prisma.io') || process.env.DATABASE_URL?.includes('accelerate')) {
    return client.$extends(withAccelerate());
  }
  
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export default prisma;

