/**
 * 图标组件
 * 使用 iconfont 风格的 SVG 图标
 * 小程序需要将 SVG 转为 base64 图片显示
 */
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo } from 'react'
import { icons } from './icons'
import './index.scss'

// Base64 编码表
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// UTF-8 字符串转 Base64（兼容小程序）
function utf8ToBase64(str: string): string {
  // 将字符串转为 UTF-8 字节数组
  const utf8Bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i)
    if (charCode < 0x80) {
      utf8Bytes.push(charCode)
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6))
      utf8Bytes.push(0x80 | (charCode & 0x3f))
    } else if (charCode < 0x10000) {
      utf8Bytes.push(0xe0 | (charCode >> 12))
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f))
      utf8Bytes.push(0x80 | (charCode & 0x3f))
    } else {
      utf8Bytes.push(0xf0 | (charCode >> 18))
      utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f))
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f))
      utf8Bytes.push(0x80 | (charCode & 0x3f))
    }
  }

  // 转为 Base64
  let result = ''
  const len = utf8Bytes.length
  for (let i = 0; i < len; i += 3) {
    const a = utf8Bytes[i]
    const b = i + 1 < len ? utf8Bytes[i + 1] : 0
    const c = i + 2 < len ? utf8Bytes[i + 2] : 0

    result += BASE64_CHARS[a >> 2]
    result += BASE64_CHARS[((a & 3) << 4) | (b >> 4)]
    result += i + 1 < len ? BASE64_CHARS[((b & 15) << 2) | (c >> 6)] : '='
    result += i + 2 < len ? BASE64_CHARS[c & 63] : '='
  }

  return result
}

// 别名映射：英文名称 -> icons.ts 中的名称
const aliasMap: Record<string, string> = {
  // 导航相关
  arrowLeft: 'fanhui',
  arrowRight: 'qianwang',
  back: 'fanhui',
  forward: 'qianwang',
  
  // 用户相关
  user: 'yonghu',
  profile: 'yonghu',
  
  // 设置
  settings: 'shezhi1',
  setting: 'shezhi1',
  
  // 安全
  shield: 'anquan1',
  security: 'anquan1',
  protection: 'anquan1',
  
  // 锁
  lock: 'suo1',
  
  // 电话
  phone: 'dianhua1',
  tel: 'dianhua1',
  
  // 首页
  home: 'shouye',
  homeFilled: 'shouye-xuanzhong',
  
  // 订单
  order: 'liebiao1',
  orderFilled: 'liebiao',
  
  // 钱包
  wallet: 'qianbao1',
  money: 'qianbi1',
  
  // 购物
  cart: 'gouwuche1',
  shop: 'shangcheng',
  store: 'dianpu1',
  
  // 消息
  message: 'xiaoxi1',
  chat: 'liaotian',
  notification: 'tongzhi1',
  bell: 'tongzhi1',
  
  // 收藏/点赞
  star: 'shoucang1',
  starFilled: 'shoucang',
  like: 'dianzan1',
  likeFilled: 'dianzan',
  heart: 'xin',
  favorite: 'shoucang1',
  
  // 分享
  share: 'fenxiang1',
  
  // 搜索
  search: 'sousuo1',
  
  // 添加
  plus: 'jia',
  add: 'tianjia1',
  addCircle: 'tianjia',
  
  // 减少
  minus: 'jian',
  
  // 关闭
  close: 'guanbi1',
  closeCircle: 'guanbi',
  
  // 复制
  copy: 'fuzhi1',
  
  // 编辑
  edit: 'bianji',
  
  // 删除
  delete: 'qingchu1',
  trash: 'qingchu',
  
  // 刷新
  refresh: 'shuaxin',
  
  // 加载
  loading: 'jiazai',
  
  // 成功/完成
  check: 'wancheng1',
  success: 'wancheng',
  completed: 'wancheng',
  
  // 警告/错误
  warning: 'zhushi1',
  error: 'guanbi11',
  info: 'zhushi',
  
  // 帮助
  help: 'wenti1',
  question: 'jieshi',
  
  // 时间
  clock: 'shijian1',
  time: 'shijian1',
  history: 'shijian',
  
  // 位置
  location: 'weizhi1',
  
  // 礼物
  gift: 'liwu1',
  
  // 奖杯
  trophy: 'jiangbei1',
  crown: 'jiangbei',
  
  // 优惠券
  coupon: 'quan1',
  ticket: 'quan',
  
  // 红包
  redPacket: 'hongbao',
  
  // 客服
  headset: 'kefu',
  service: 'kefu',
  
  // 眼睛
  eye: 'kejian1',
  eyeOpen: 'kejian',
  eyeClosed: 'bukejian1',
  eyeOff: 'bukejian',
  
  // 相机
  camera: 'paishe1',
  
  // 图片
  image: 'tupian1',
  picture: 'tupian',
  
  // 二维码
  qrcode: 'erweima',
  scan: 'saoma',
  
  // 筛选
  filter: 'shaixuan1',
  
  // 排序
  sort: 'paixu',
  
  // 更多
  more: 'gengduo',
  
  // 展开/收起
  expand: 'zhankai',
  collapse: 'shouqi',
  
  // 下拉
  dropdown: 'sanjiao',
  
  // 火
  fire: 'huohua1',
  hot: 'huohua',
  
  // 失效
  expired: 'shixiao',
  
  // 待处理状态
  pending: 'shijian1',
  processing: 'jiazai',
  review: 'shoucang1',
  refund: 'jintuikuan',
  
  // 退出
  logout: 'tuihuotuikuan',
  
  // 包裹/物流
  package: 'baoguo1',
  shipping: 'yunshu1',
}

// 自定义图标（icons.ts 中没有的）
const customIcons: Record<string, { body: string }> = {
  wechat: {
    body: '<path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647818-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78907l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225998-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328871 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.558178 15.120372 38.558178 38.061587 0 22.846049-15.357781 38.156754-38.558178 38.156754-23.107232 0-46.260603-15.310705-46.260603-38.156754C452.368367 300.994262 475.522715 285.87389 498.62897 285.87389zM283.016498 362.090231c-23.107232 0-46.402819-15.310705-46.402819-38.156754 0-22.941215 23.295587-38.061587 46.402819-38.061587 23.081698 0 38.463011 15.120372 38.463011 38.061587C321.479509 346.779526 306.098196 362.090231 283.016498 362.090231zM870.24249 609.716164c0-121.546495-123.189648-220.509757-261.683952-220.509757-146.57838 0-262.015505 98.963262-262.015505 220.509757 0 121.783856 115.437126 220.509757 262.015505 220.509757 30.66644 0 61.617289-7.609305 92.423993-15.262612l84.513836 45.786498-23.178374-76.17082C816.840042 738.53574 870.24249 678.561335 870.24249 609.716164zM546.740282 578.57498c-15.405765 0-30.856407-15.073365-30.856407-30.573422 0-15.310705 15.450642-30.667566 30.856407-30.667566 23.295587 0 38.653367 15.356861 38.653367 30.667566C585.393649 563.501615 570.035869 578.57498 546.740282 578.57498zM723.492081 578.57498c-15.216454 0-30.763241-15.073365-30.763241-30.573422 0-15.310705 15.546787-30.667566 30.763241-30.667566 23.107232 0 38.558178 15.356861 38.558178 30.667566C762.050259 563.501615 746.599313 578.57498 723.492081 578.57498z" fill="currentColor"></path>',
  },
  gamepad: {
    body: '<path d="M853.333333 469.333333v85.333334H640V384h-85.333333v170.666667H384V384h-85.333333v170.666667H128v-85.333334c0-72.533333 40.533333-134.4 99.84-166.826666L170.666667 204.373333 234.666667 149.333333l80.64 128.64C350.293333 261.12 389.973333 253.653333 426.666667 253.653333h170.666666c36.693333 0 76.373333 7.68 111.36 24.32l80.64-128.64L853.333333 204.373333 796.16 302.506667C855.466667 334.933333 896 396.8 896 469.333333h-42.666667zM768 597.333333H256c-46.933333 0-85.333333 38.4-85.333333 85.333334v85.333333c0 46.933333 38.4 85.333333 85.333333 85.333333h512c46.933333 0 85.333333-38.4 85.333333-85.333333v-85.333333c0-46.933333-38.4-85.333333-85.333333-85.333334z m-341.333333 170.666667H341.333333v-85.333333h85.333334v85.333333z m256 0h-85.333334v-85.333333h85.333334v85.333333z" fill="currentColor"></path>',
  },
}

// 合并所有可用的图标名称
type IconsKey = keyof typeof icons.icons
type AliasKey = keyof typeof aliasMap
type CustomKey = keyof typeof customIcons
export type IconName = IconsKey | AliasKey | CustomKey

interface IconProps {
  name: IconName
  size?: number | string
  color?: string
  className?: string
  onClick?: () => void
}

// 图标缓存
const iconCache = new Map<string, string>()

export default function Icon({
  name,
  size = 24,
  color = '#333333',
  className = '',
  onClick,
}: IconProps) {
  const sizeValue = useMemo(() => {
    if (typeof size === 'number') {
      return `${size}px`
    }
    return size
  }, [size])

  const iconSrc = useMemo(() => {
    // 缓存 key
    const cacheKey = `${String(name)}_${color}`
    if (iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey)!
    }

    let iconData: { body: string } | undefined
    
    // 1. 检查是否是自定义图标
    if (customIcons[name as string]) {
      iconData = customIcons[name as string]
    } else {
      // 2. 解析别名
      const realName = aliasMap[name as string] || name
      
      // 3. 获取图标数据
      iconData = icons.icons[realName as string]
    }

    if (!iconData) {
      console.warn(`[Icon] 未找到图标: ${String(name)}`)
      return ''
    }

    // 构建 viewBox
    const left = icons.left ?? 0
    const top = icons.top ?? 0
    const width = icons.width ?? 1024
    const height = icons.height ?? 1024
    const viewBox = `${left} ${top} ${width} ${height}`
    
    // 构建 SVG
    let svg = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${iconData.body}</svg>`
    
    // 替换颜色
    if (color) {
      svg = svg.replace(/currentColor/g, color)
    }

    // 使用 base64 格式
    const base64 = utf8ToBase64(svg)
    const result = `data:image/svg+xml;base64,${base64}`
    
    // 缓存结果
    iconCache.set(cacheKey, result)
    
    return result
  }, [name, color])

  if (!iconSrc) {
    return (
      <View
        className={`icon icon--placeholder ${className}`}
        style={{
          width: sizeValue,
          height: sizeValue,
        }}
      />
    )
  }

  return (
    <View
      className={`icon ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
      }}
      onClick={onClick}
    >
      <Image
        src={iconSrc}
        style={{
          width: sizeValue,
          height: sizeValue,
        }}
        mode='aspectFit'
      />
    </View>
  )
}
