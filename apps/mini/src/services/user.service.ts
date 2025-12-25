/**
 * 用户服务
 * @description 处理用户相关的API调用
 */
import { get, put } from './request'
import { setUserInfo, getUserInfo as getLocalUserInfo, clearAuth } from '@/utils/storage'

// 用户信息类型
export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  phone: string | null
  role: string
  status: string
  balance: number
  frozenBalance: number
  boosterProfile: any | null
  createdAt: string
  deletionInfo: DeletionInfo | null
}

// 注销信息
export interface DeletionInfo {
  isDeletionPending: boolean
  deletionRequestedAt: string | null
  deletionScheduledAt: string | null
  daysRemaining: number | null
}

/**
 * 获取用户信息（从服务器获取最新数据）
 * @param options 配置选项
 * @returns 用户信息，如果获取失败返回null
 */
export async function fetchUserProfile(options?: { 
  showError?: boolean
  updateLocal?: boolean 
}): Promise<UserProfile | null> {
  const { showError = false, updateLocal = true } = options || {}
  
  try {
    const res = await get<UserProfile>('/api/user/profile', undefined, { 
      showError,
      skipAuthRedirect: false, // 允许自动跳转登录
    })
    
    if (res.code === 0 && res.data) {
      // 更新本地存储
      if (updateLocal) {
        setUserInfo({
          id: res.data.id,
          nickname: res.data.nickname,
          avatar: res.data.avatar,
          phone: res.data.phone,
          role: res.data.role,
          status: res.data.status,
        })
      }
      return res.data
    }
    
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(data: { 
  nickname?: string
  avatar?: string 
}): Promise<UserProfile | null> {
  try {
    const res = await put<UserProfile>('/api/user/profile', data)
    
    if (res.code === 0 && res.data) {
      // 更新本地存储
      const localUser = getLocalUserInfo()
      if (localUser) {
        setUserInfo({
          ...localUser,
          ...data,
        })
      }
      return res.data
    }
    
    return null
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return null
  }
}

/**
 * 检查用户登录状态并获取最新数据
 * 如果token无效或过期，会自动跳转登录页
 * @returns 是否登录有效
 */
export async function checkAuthAndFetchProfile(): Promise<{ 
  isValid: boolean
  userProfile: UserProfile | null 
}> {
  const profile = await fetchUserProfile({ showError: false })
  
  return {
    isValid: profile !== null,
    userProfile: profile,
  }
}

