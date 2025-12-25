/**
 * 本地存储工具
 */
import Taro from '@tarojs/taro'

const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token)
}

/**
 * 删除 Token
 */
export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any {
  return Taro.getStorageSync(USER_KEY) || null
}

/**
 * 设置用户信息
 */
export function setUserInfo(user: any): void {
  Taro.setStorageSync(USER_KEY, user)
}

/**
 * 删除用户信息
 */
export function removeUserInfo(): void {
  Taro.removeStorageSync(USER_KEY)
}

/**
 * 清除登录信息
 */
export function clearAuth(): void {
  removeToken()
  removeUserInfo()
}

/**
 * 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken() && !!getUserInfo()
}

