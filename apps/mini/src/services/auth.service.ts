/**
 * 认证相关接口
 */
import Taro from '@tarojs/taro'
import { post } from './request'
import { setToken, setUserInfo, clearAuth } from '@/utils/storage'

// 用户信息类型
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  role: string
  status?: string
}

// 注销信息
export interface DeletionInfo {
  isDeletionPending: boolean
  deletionRequestedAt: string | null
  deletionScheduledAt: string | null
  daysRemaining: number | null
}

// 登录响应
interface LoginResponse {
  token: string
  user: UserInfo
  deletionInfo?: DeletionInfo | null
}

// 登录结果
export interface LoginResult {
  success: boolean
  message?: string
  deletionInfo?: DeletionInfo | null
}

/**
 * 微信授权登录
 * 根据微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html
 * 1. 调用 wx.login() 获取临时登录凭证 code
 * 2. 将 code 发送到后端
 * 3. 后端调用 auth.code2Session 换取 openid
 */
export async function wechatLogin(): Promise<LoginResult> {
  try {
    // 1. 调用 wx.login 获取 code
    const loginRes = await Taro.login()
    console.log('Taro.login result:', loginRes)

    if (!loginRes.code) {
      return { success: false, message: '微信登录失败' }
    }

    // 2. 发送 code 到后端
    const res = await post<LoginResponse>('/api/auth/wechat-login', {
      code: loginRes.code,
    }, { showError: false })

    console.log('API response:', res)

    if (res.code === 0) {
      setToken(res.data.token)
      setUserInfo(res.data.user)
      return { 
        success: true, 
        deletionInfo: res.data.deletionInfo || null 
      }
    }

    return { success: false, message: res.message || '登录失败' }
  } catch (error) {
    console.error('Wechat login error:', error)
    return { success: false, message: '网络错误，请检查后端服务' }
  }
}

/**
 * 手机号一键登录
 * @param loginCode 微信登录 code（来自 Taro.login）
 * @param phoneCode 手机号 code（来自 getPhoneNumber）
 */
export async function phoneLogin(
  loginCode: string,
  phoneCode: string
): Promise<LoginResult> {
  try {
    console.log('phoneLogin called with:', { loginCode, phoneCode })
    
    const res = await post<LoginResponse>('/api/auth/phone-login', {
      code: loginCode,
      phoneCode,
    }, { showError: false })

    console.log('API response:', res)

    if (res.code === 0) {
      setToken(res.data.token)
      setUserInfo(res.data.user)
      return { 
        success: true,
        deletionInfo: res.data.deletionInfo || null
      }
    }

    return { success: false, message: res.message || '登录失败' }
  } catch (error) {
    console.error('Phone login error:', error)
    return { success: false, message: '网络错误，请检查后端服务' }
  }
}

/**
 * 账号密码登录
 */
export async function accountLogin(
  account: string,
  password: string
): Promise<LoginResult> {
  const res = await post<LoginResponse>('/api/auth/login', {
    account,
    password,
  })

  if (res.code === 0) {
    setToken(res.data.token)
    setUserInfo(res.data.user)
    return { 
      success: true,
      deletionInfo: res.data.deletionInfo || null
    }
  }

  return { success: false, message: res.message }
}

/**
 * 注册
 */
export async function register(
  username: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; message?: string }> {
  const res = await post<LoginResponse>('/api/auth/register', {
    username,
    password,
    phone,
  })

  if (res.code === 0) {
    setToken(res.data.token)
    setUserInfo(res.data.user)
    return { success: true }
  }

  return { success: false, message: res.message }
}

/**
 * 退出登录
 */
export function logout(): void {
  clearAuth()
}

/**
 * 取消账号注销
 */
export async function cancelDeletion(): Promise<{ success: boolean; message?: string }> {
  const { del } = await import('./request')
  const res = await del('/api/user/deletion')

  if (res.code === 0) {
    return { success: true }
  }

  return { success: false, message: res.message }
}

