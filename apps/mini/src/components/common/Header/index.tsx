/**
 * 头部内容组件
 * @description 可配合 SafeArea 使用，高度 80rpx
 */
import { PropsWithChildren } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@/components'
import './index.scss'

interface HeaderProps {
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
  /** 自定义类名 */
  className?: string
}

export default function Header({
  title = '',
  showBack = true,
  backgroundColor = 'transparent',
  textColor = '#fff',
  onBack,
  renderRight,
  className = '',
  children,
}: PropsWithChildren<HeaderProps>) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      const pages = Taro.getCurrentPages()
      if (pages.length > 1) {
        Taro.navigateBack()
      } else {
        Taro.switchTab({ url: '/pages/home/index' })
      }
    }
  }

  return (
    <View
      className={`header ${className}`}
      style={{ backgroundColor }}
    >
      {/* 左侧返回按钮 */}
      <View className='header__left'>
        {showBack && (
          <View className='header__back' onClick={handleBack}>
            <Icon name='arrowLeft' size={20} color={textColor} />
          </View>
        )}
      </View>

      {/* 中间标题或自定义内容 */}
      <View className='header__center'>
        {children || (
          title && (
            <Text className='header__title' style={{ color: textColor }}>
              {title}
            </Text>
          )
        )}
      </View>

      {/* 右侧内容 */}
      <View className='header__right'>
        {renderRight}
      </View>
    </View>
  )
}

