/**
 * 账号密码登录组件
 */
import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import { Icon } from '@/components'
import './index.scss'

interface AccountLoginProps {
  account: string
  password: string
  loading: boolean
  onAccountChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
  onRegister: () => void
}

export default function AccountLogin({
  account,
  password,
  loading,
  onAccountChange,
  onPasswordChange,
  onLogin,
  onRegister,
}: AccountLoginProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className='account-login'>
      {/* 账号输入 */}
      <View className='account-login__input-group'>
        <View className='account-login__input'>
          <View className='account-login__input-icon'>
            <Icon name='user' size={20} color='#8e8e93' />
          </View>
          <Input
            className='account-login__input-field'
            type='text'
            placeholder='请输入账号/手机号'
            placeholderClass='placeholder'
            value={account}
            onInput={(e) => onAccountChange(e.detail.value)}
          />
        </View>
      </View>

      {/* 密码输入 */}
      <View className='account-login__input-group'>
        <View className='account-login__input'>
          <View className='account-login__input-icon'>
            <Icon name='lock' size={20} color='#8e8e93' />
          </View>
          <Input
            className='account-login__input-field'
            type={showPassword ? 'text' : 'safe-password'}
            password={!showPassword}
            placeholder='请输入密码'
            placeholderClass='placeholder'
            value={password}
            onInput={(e) => onPasswordChange(e.detail.value)}
          />
          <View 
            className='account-login__input-eye'
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon 
              name={showPassword ? 'eye' : 'eyeClosed'} 
              size={20} 
              color='#8e8e93' 
            />
          </View>
        </View>
      </View>

      {/* 登录按钮 */}
      <Button
        className='account-login__btn'
        onClick={onLogin}
        loading={loading}
        disabled={loading}
      >
        {loading ? '登录中...' : '登 录'}
      </Button>

      {/* 注册入口 */}
      <View className='account-login__footer'>
        <Text className='account-login__footer-text'>还没有账号？</Text>
        <Text className='account-login__footer-link' onClick={onRegister}>
          立即注册
        </Text>
      </View>
    </View>
  )
}
