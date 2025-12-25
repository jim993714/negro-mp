/**
 * 安全区域组件
 * @description 用于处理状态栏安全区域
 */
import { useState, useEffect, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface SafeAreaProps {
  /** 背景色 */
  backgroundColor?: string
  /** 自定义类名 */
  className?: string
}

export default function SafeArea({
  backgroundColor = '#667eea',
  className = '',
  children,
}: PropsWithChildren<SafeAreaProps>) {
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  useEffect(() => {
    const windowInfo = Taro.getWindowInfo()
    setStatusBarHeight(windowInfo.statusBarHeight || 0)
  }, [])

  return (
    <View
      className={`safe-area ${className}`}
      style={{
        paddingTop: `${statusBarHeight}px`,
        backgroundColor,
      }}
    >
      {children}
    </View>
  )
}

