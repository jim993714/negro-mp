/**
 * 头像工具
 * @description 生成默认头像 URL
 */

/**
 * 生成默认头像 URL
 * 使用 UI Avatars 服务：https://ui-avatars.com/
 *
 * @param name 用户名（用于生成头像上的文字）
 * @param options 可选配置
 */
export function generateDefaultAvatar(
  name: string,
  options?: {
    background?: string // 背景色（不带 #）
    color?: string      // 文字颜色（不带 #）
    size?: number       // 图片尺寸
    rounded?: boolean   // 是否圆形
    bold?: boolean      // 文字是否加粗
  }
): string {
  const {
    background = '667eea',  // 主题紫色
    color = 'ffffff',       // 白色文字
    size = 128,
    rounded = true,
    bold = true,
  } = options || {}

  // 取名字的前两个字符
  const displayName = name.slice(0, 2)

  const params = new URLSearchParams({
    name: displayName,
    background,
    color,
    size: size.toString(),
    rounded: rounded.toString(),
    bold: bold.toString(),
    format: 'png',
  })

  return `https://ui-avatars.com/api/?${params.toString()}`
}

/**
 * 预设的头像样式
 */
export const AvatarPresets = {
  // 默认紫色
  default: (name: string) => generateDefaultAvatar(name),

  // 游戏风格 - 绿色
  gaming: (name: string) => generateDefaultAvatar(name, {
    background: '10b981',
    color: 'ffffff',
  }),

  // 代练师 - 橙色
  booster: (name: string) => generateDefaultAvatar(name, {
    background: 'f59e0b',
    color: 'ffffff',
  }),

  // VIP - 金色
  vip: (name: string) => generateDefaultAvatar(name, {
    background: 'fbbf24',
    color: '78350f',
  }),
}

