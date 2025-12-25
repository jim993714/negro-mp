/**
 * 导航栏组件（组合版本）
 * @description SafeArea + Header 的组合，fixed 定位覆盖状态栏
 */
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SafeArea from '../SafeArea'
import Header from '../Header'

interface NavBarProps {
  /** 标题 */
  title?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 返回按钮点击回调 */
  onBack?: () => void
  /** 右侧内容 */
  renderRight?: React.ReactNode
}

// Header 高度 80rpx = 40px
const HEADER_HEIGHT = 40

export default function NavBar({
  title = '',
  showBack = true,
  backgroundColor = '#667eea',
  textColor = '#fff',
  onBack,
  renderRight,
}: NavBarProps) {
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  useEffect(() => {
    const windowInfo = Taro.getWindowInfo()
    setStatusBarHeight(windowInfo.statusBarHeight || 0)
  }, [])

  // 总高度 = 状态栏 + Header
  const totalHeight = statusBarHeight + HEADER_HEIGHT

  return (
    <>
      {/* 固定定位的导航栏 */}
      <SafeArea backgroundColor={backgroundColor}>
        <Header
          title={title}
          showBack={showBack}
          textColor={textColor}
          onBack={onBack}
          renderRight={renderRight}
        />
      </SafeArea>
      {/* 占位元素，防止内容被遮挡 */}
      <View style={{ height: `${totalHeight}px` }} />
    </>
  )
}
