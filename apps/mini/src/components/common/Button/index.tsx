/**
 * 通用按钮组件
 */
import { View, Text, Button as TaroButton } from '@tarojs/components'
import { ReactNode } from 'react'
import './index.scss'

interface ButtonProps {
  children: ReactNode
  type?: 'primary' | 'secondary' | 'outline' | 'text'
  size?: 'small' | 'medium' | 'large'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  // 微信开放能力
  openType?: 'getPhoneNumber' | 'getUserInfo' | 'share'
  onGetPhoneNumber?: (e: any) => void
}

export default function Button({
  children,
  type = 'primary',
  size = 'medium',
  block = false,
  disabled = false,
  loading = false,
  onClick,
  openType,
  onGetPhoneNumber,
}: ButtonProps) {
  const className = [
    'custom-button',
    `custom-button--${type}`,
    `custom-button--${size}`,
    block && 'custom-button--block',
    disabled && 'custom-button--disabled',
    loading && 'custom-button--loading',
  ].filter(Boolean).join(' ')

  // 如果有 openType，使用原生 Button
  if (openType) {
    return (
      <TaroButton
        className={className}
        disabled={disabled || loading}
        openType={openType}
        onGetPhoneNumber={onGetPhoneNumber}
      >
        {loading && <Text className='loading-icon'>⏳</Text>}
        {children}
      </TaroButton>
    )
  }

  return (
    <View
      className={className}
      onClick={disabled || loading ? undefined : onClick}
    >
      {loading && <Text className='loading-icon'>⏳</Text>}
      {children}
    </View>
  )
}

