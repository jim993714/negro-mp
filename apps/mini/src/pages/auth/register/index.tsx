/**
 * 注册页面
 */
import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { register } from '@/services/auth.service'
import { isValidUsername, isValidPassword, isValidPhone } from '@/utils/index'

// 页面组件
import { RegisterForm, RegisterTips } from './components'
import './index.scss'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // 校验
  const validate = (): boolean => {
    if (!username.trim() || !isValidUsername(username.trim())) {
      Taro.showToast({ title: '用户名2-16位，支持中英文数字下划线', icon: 'none' })
      return false
    }
    if (!isValidPassword(password)) {
      Taro.showToast({ title: '密码需要6-20位', icon: 'none' })
      return false
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return false
    }
    if (phone && !isValidPhone(phone)) {
      Taro.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    return true
  }

  // 提交注册
  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const result = await register(username.trim(), password, phone || undefined)
    setLoading(false)

    if (result.success) {
      Taro.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } else {
      Taro.showToast({ title: result.message || '注册失败', icon: 'none' })
    }
  }

  return (
    <View className='register-page'>
      {/* 背景 */}
      <View className='register-page__bg'>
        <View className='circle circle--1' />
        <View className='circle circle--2' />
      </View>

      {/* 标题 */}
      <View className='register-page__header'>
        <Text className='title'>创建账号</Text>
        <Text className='subtitle'>注册后可使用账号密码登录</Text>
      </View>

      {/* 表单卡片 */}
      <View className='register-page__card'>
        <RegisterForm
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          phone={phone}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onPhoneChange={setPhone}
        />

        <RegisterTips />

        <Button
          className='register-page__submit'
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? '注册中...' : '注册'}
        </Button>

        <View className='register-page__back' onClick={() => Taro.navigateBack()}>
          <Text>已有账号？返回登录</Text>
        </View>
      </View>
    </View>
  )
}
