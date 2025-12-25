/**
 * 登录页面
 * @description 支持微信授权登录、手机号登录和账号密码登录
 */
import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon, NavBar } from '@/components'
import { wechatLogin, phoneLogin, accountLogin } from '@/services/auth.service'
import { isValidPassword } from '@/utils/index'

// 页面组件
import { LoginTabs, WechatLogin, PhoneLogin, AccountLogin } from './components'
import type { LoginType } from './components/LoginTabs'
import './index.scss'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>('wechat')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 校验账号密码
  const validate = (): boolean => {
    if (!account.trim()) {
      Taro.showToast({ title: '请输入账号', icon: 'none' })
      return false
    }
    if (!password || !isValidPassword(password)) {
      Taro.showToast({ title: '密码需要6-20位', icon: 'none' })
      return false
    }
    return true
  }

  // 登录成功后的处理
  const onLoginSuccess = () => {
    Taro.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1500)
  }

  // 微信授权登录
  const handleWechatLogin = async () => {
    setLoading(true)
    const result = await wechatLogin()
    setLoading(false)

    if (result.success) {
      onLoginSuccess()
    } else {
      Taro.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  }

  // 手机号登录
  const handlePhoneLogin = async (e: any) => {
    console.log('getPhoneNumber result:', e.detail)

    const { code, errMsg } = e.detail

    if (errMsg && errMsg.includes('deny')) {
      Taro.showToast({ title: '您取消了授权', icon: 'none' })
      return
    }

    if (!code) {
      Taro.showToast({ title: '获取手机号失败', icon: 'none' })
      console.error('getPhoneNumber failed:', errMsg)
      return
    }

    setLoading(true)

    try {
      const loginRes = await Taro.login()
      if (!loginRes.code) {
        Taro.showToast({ title: '微信登录失败', icon: 'none' })
        setLoading(false)
        return
      }

      const result = await phoneLogin(loginRes.code, code)

      if (result.success) {
        onLoginSuccess()
      } else {
        Taro.showToast({ title: result.message || '登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('Login error:', error)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 账号密码登录
  const handleAccountLogin = async () => {
    if (!validate()) return

    setLoading(true)
    const result = await accountLogin(account.trim(), password)
    setLoading(false)

    if (result.success) {
      onLoginSuccess()
    } else {
      Taro.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  }

  // 跳转注册
  const goToRegister = () => {
    Taro.navigateTo({ url: '/pages/auth/register/index' })
  }

  const statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 0
  const navBarHeight = 44

  return (
    <View className='login-page'>
      {/* 自定义导航栏 */}
      <NavBar title='登录' backgroundColor='transparent' textColor='#fff' />

      {/* 背景装饰 */}
      <View className='login-page__bg'>
        <View className='circle circle--1' />
        <View className='circle circle--2' />
        <View className='circle circle--3' />
      </View>

      {/* Logo */}
      <View 
        className='login-page__header'
        style={{ paddingTop: `${statusBarHeight + navBarHeight + 40}px` }}
      >
        <View className='logo'>
          <Icon name='gamepad' size={48} color='#fff' />
        </View>
        <Text className='title'>游戏代练平台</Text>
        <Text className='slogan'>专业代练 · 安全高效</Text>
      </View>

      {/* 登录卡片 */}
      <View className='login-page__card'>
        <LoginTabs current={loginType} onChange={setLoginType} />

        {loginType === 'wechat' && (
          <WechatLogin loading={loading} onLogin={handleWechatLogin} />
        )}

        {loginType === 'phone' && (
          <PhoneLogin loading={loading} onLogin={handlePhoneLogin} />
        )}

        {loginType === 'account' && (
          <AccountLogin
            account={account}
            password={password}
            loading={loading}
            onAccountChange={setAccount}
            onPasswordChange={setPassword}
            onLogin={handleAccountLogin}
            onRegister={goToRegister}
          />
        )}
      </View>

      {/* 协议 */}
      <View className='login-page__agreement'>
        <Text>登录即表示同意</Text>
        <Text className='link'>《用户协议》</Text>
        <Text>和</Text>
        <Text className='link'>《隐私政策》</Text>
      </View>
    </View>
  )
}
