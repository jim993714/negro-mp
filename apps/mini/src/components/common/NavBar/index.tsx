/**
 * 自定义导航栏组件
 * 用于小程序自定义导航栏
 */
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@/components'
import './index.scss'

interface NavBarProps {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  textColor?: string
  onBack?: () => void
}

export default function NavBar({
  title = '',
  showBack = true,
  backgroundColor = '#667eea',
  textColor = '#fff',
  onBack,
}: NavBarProps) {
  const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 0
  const navBarHeight = 44 // 导航栏高度

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
      className='nav-bar'
      style={{
        paddingTop: `${statusBarHeight}px`,
        backgroundColor,
        color: textColor,
      }}
    >
      <View className='nav-bar__content' style={{ height: `${navBarHeight}px` }}>
        {showBack && (
          <View className='nav-bar__back' onClick={handleBack}>
            <Icon name='arrowLeft' size={20} color={textColor} />
          </View>
        )}
        {title && (
          <Text className='nav-bar__title' style={{ color: textColor }}>
            {title}
          </Text>
        )}
      </View>
    </View>
  )
}

