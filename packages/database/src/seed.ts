import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// 使用 Prisma Accelerate 扩展
const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  console.log('🌱 开始填充数据...');

  // 创建游戏分类
  const games = await Promise.all([
    prisma.gameCategory.upsert({
      where: { id: 'king-of-glory' },
      update: {},
      create: {
        id: 'king-of-glory',
        name: '王者荣耀',
        icon: '/games/kog-icon.png',
        cover: '/games/kog-cover.png',
        description: '5V5公平竞技手游',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.gameCategory.upsert({
      where: { id: 'lol' },
      update: {},
      create: {
        id: 'lol',
        name: '英雄联盟',
        icon: '/games/lol-icon.png',
        cover: '/games/lol-cover.png',
        description: 'MOBA竞技游戏',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.gameCategory.upsert({
      where: { id: 'peace-elite' },
      update: {},
      create: {
        id: 'peace-elite',
        name: '和平精英',
        icon: '/games/pubgm-icon.png',
        cover: '/games/pubgm-cover.png',
        description: '大逃杀射击手游',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.gameCategory.upsert({
      where: { id: 'genshin' },
      update: {},
      create: {
        id: 'genshin',
        name: '原神',
        icon: '/games/genshin-icon.png',
        cover: '/games/genshin-cover.png',
        description: '开放世界冒险游戏',
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.gameCategory.upsert({
      where: { id: 'valorant' },
      update: {},
      create: {
        id: 'valorant',
        name: '无畏契约',
        icon: '/games/valorant-icon.png',
        cover: '/games/valorant-cover.png',
        description: '5V5战术射击游戏',
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${games.length} 个游戏分类`);

  // 为王者荣耀创建区服
  const kogServers = await Promise.all([
    prisma.gameServer.upsert({
      where: { id: 'kog-android-qq' },
      update: {},
      create: {
        id: 'kog-android-qq',
        gameId: 'king-of-glory',
        name: '安卓QQ区',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.gameServer.upsert({
      where: { id: 'kog-android-wx' },
      update: {},
      create: {
        id: 'kog-android-wx',
        gameId: 'king-of-glory',
        name: '安卓微信区',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.gameServer.upsert({
      where: { id: 'kog-ios-qq' },
      update: {},
      create: {
        id: 'kog-ios-qq',
        gameId: 'king-of-glory',
        name: 'iOS QQ区',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.gameServer.upsert({
      where: { id: 'kog-ios-wx' },
      update: {},
      create: {
        id: 'kog-ios-wx',
        gameId: 'king-of-glory',
        name: 'iOS微信区',
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${kogServers.length} 个王者荣耀区服`);

  // 为王者荣耀创建代练类型
  const kogBoostTypes = await Promise.all([
    prisma.boostType.upsert({
      where: { id: 'kog-rank' },
      update: {},
      create: {
        id: 'kog-rank',
        gameId: 'king-of-glory',
        name: '段位代练',
        description: '帮您提升排位段位',
        basePrice: 5000, // 50元起
        unit: '段',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.boostType.upsert({
      where: { id: 'kog-star' },
      update: {},
      create: {
        id: 'kog-star',
        gameId: 'king-of-glory',
        name: '星星代练',
        description: '按星星数量计费',
        basePrice: 500, // 5元/星
        unit: '星',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.boostType.upsert({
      where: { id: 'kog-win' },
      update: {},
      create: {
        id: 'kog-win',
        gameId: 'king-of-glory',
        name: '胜场代练',
        description: '保证胜场数量',
        basePrice: 300, // 3元/场
        unit: '场',
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${kogBoostTypes.length} 个王者荣耀代练类型`);

  // 为英雄联盟创建区服
  const lolServers = await Promise.all([
    prisma.gameServer.upsert({
      where: { id: 'lol-ionia' },
      update: {},
      create: {
        id: 'lol-ionia',
        gameId: 'lol',
        name: '艾欧尼亚',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.gameServer.upsert({
      where: { id: 'lol-demacia' },
      update: {},
      create: {
        id: 'lol-demacia',
        gameId: 'lol',
        name: '德玛西亚',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.gameServer.upsert({
      where: { id: 'lol-noxus' },
      update: {},
      create: {
        id: 'lol-noxus',
        gameId: 'lol',
        name: '诺克萨斯',
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${lolServers.length} 个英雄联盟区服`);

  // 为英雄联盟创建代练类型
  const lolBoostTypes = await Promise.all([
    prisma.boostType.upsert({
      where: { id: 'lol-rank' },
      update: {},
      create: {
        id: 'lol-rank',
        gameId: 'lol',
        name: '段位代练',
        description: '帮您提升排位段位',
        basePrice: 10000, // 100元起
        unit: '段',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.boostType.upsert({
      where: { id: 'lol-placement' },
      update: {},
      create: {
        id: 'lol-placement',
        gameId: 'lol',
        name: '定级赛代打',
        description: '帮您完成定级赛',
        basePrice: 8000, // 80元/10场
        unit: '次',
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${lolBoostTypes.length} 个英雄联盟代练类型`);

  // 创建系统配置
  const configs = await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: 'commission_rate' },
      update: {},
      create: {
        key: 'commission_rate',
        value: '0.1', // 10% 佣金
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'min_withdraw' },
      update: {},
      create: {
        key: 'min_withdraw',
        value: '1000', // 最低提现10元
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'service_phone' },
      update: {},
      create: {
        key: 'service_phone',
        value: '400-123-4567',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${configs.length} 个系统配置`);

  // 创建轮播图
  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: 'banner-1' },
      update: {},
      create: {
        id: 'banner-1',
        title: '新用户首单立减10元',
        image: '/banners/new-user.png',
        link: '/pages/activity/new-user',
        linkType: 'page',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-2' },
      update: {},
      create: {
        id: 'banner-2',
        title: '王者荣耀S34赛季冲分季',
        image: '/banners/kog-season.png',
        link: '/pages/game/detail?id=king-of-glory',
        linkType: 'page',
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${banners.length} 个轮播图`);

  console.log('🎉 数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

