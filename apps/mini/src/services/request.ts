/**
 * 网络请求封装
 */
import Taro from '@tarojs/taro'
import { getToken, clearAuth } from '@/utils/storage'

// API 基础地址
const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000'

// 错误码定义（与后端保持一致）
const ErrorCode = {
  UNAUTHORIZED: 3001,         // 未登录
  TOKEN_EXPIRED: 3002,        // token 过期
  TOKEN_INVALID: 3003,        // token 无效
  ACCOUNT_DISABLED: 2004,     // 账号已禁用/已注销
  ACCOUNT_DELETING: 2005,     // 账号注销中
}

// 响应类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 请求配置
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
  skipAuthRedirect?: boolean // 跳过自动跳转登录
}

// 是否正在跳转登录（防止重复跳转）
let isRedirectingToLogin = false
// 是否正在显示注销弹窗（防止重复弹窗）
let isShowingDeletionModal = false

/**
 * 跳转到登录页
 */
function redirectToLogin(message?: string) {
  if (isRedirectingToLogin) return
  
  isRedirectingToLogin = true
  clearAuth()
  
  if (message) {
    Taro.showToast({ title: message, icon: 'none' })
  }
  
  setTimeout(() => {
    Taro.navigateTo({ 
      url: '/pages/auth/login/index',
      complete: () => {
        isRedirectingToLogin = false
      }
    })
  }, message ? 1500 : 0)
}

/**
 * 处理账号注销中的情况
 * @returns Promise<boolean> - true 表示用户选择取消注销并成功，可以重试请求
 */
async function handleAccountDeleting(data: { daysRemaining: number }): Promise<boolean> {
  if (isShowingDeletionModal) return false
  
  isShowingDeletionModal = true
  
  return new Promise((resolve) => {
    Taro.showModal({
      title: '账号注销中',
      content: `您的账号正在注销流程中，将在 ${data.daysRemaining} 天后注销。\n\n确认继续使用将自动取消注销申请，账号恢复正常使用。`,
      confirmText: '继续使用',
      cancelText: '暂不使用',
      confirmColor: '#667eea',
      success: async (res) => {
        isShowingDeletionModal = false
        
        if (res.confirm) {
          // 用户选择继续使用，取消注销
          Taro.showLoading({ title: '处理中...' })
          try {
            const cancelRes = await Taro.request({
              url: `${BASE_URL}/api/user/deletion`,
              method: 'DELETE',
              header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
              },
            })
            
            Taro.hideLoading()
            
            if (cancelRes.data?.code === 0) {
              Taro.showToast({ title: '已取消注销', icon: 'success' })
              resolve(true) // 取消成功，可以重试请求
            } else {
              Taro.showToast({ title: cancelRes.data?.message || '操作失败', icon: 'none' })
              resolve(false)
            }
          } catch (err) {
            Taro.hideLoading()
            Taro.showToast({ title: '操作失败', icon: 'none' })
            resolve(false)
          }
        } else {
          // 用户选择暂不使用，清除登录状态
          clearAuth()
          Taro.showToast({ title: '已退出登录', icon: 'none' })
          resolve(false)
        }
      },
      fail: () => {
        isShowingDeletionModal = false
        resolve(false)
      }
    })
  })
}

/**
 * 统一请求方法
 */
export async function request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    showError = true,
    skipAuthRedirect = false,
  } = config

  // 显示 loading
  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true })
  }

  // 添加 Token
  const token = getToken()
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    })

    const result = response.data as ApiResponse<T>

    // 处理业务错误
    if (result.code !== 0) {
      // 处理认证相关错误
      if (!skipAuthRedirect) {
        switch (result.code) {
          case ErrorCode.UNAUTHORIZED:
          case ErrorCode.TOKEN_INVALID:
            redirectToLogin('请先登录')
            return result
          
          case ErrorCode.TOKEN_EXPIRED:
            redirectToLogin('登录已过期，请重新登录')
            return result
          
          case ErrorCode.ACCOUNT_DISABLED:
            redirectToLogin(result.message || '账号异常，请重新登录')
            return result
          
          case ErrorCode.ACCOUNT_DELETING:
            // 账号注销中，显示弹窗让用户选择
            const shouldRetry = await handleAccountDeleting(result.data || { daysRemaining: 7 })
            if (shouldRetry) {
              // 用户选择取消注销成功，重试原请求
              return request(config)
            }
            return result
        }
      }
      
      // HTTP 401 错误
      if (response.statusCode === 401 && !skipAuthRedirect) {
        redirectToLogin('请先登录')
        return result
      }
      
      if (showError) {
        Taro.showToast({ title: result.message || '请求失败', icon: 'none' })
      }
    }

    return result
  } catch (error) {
    console.error('Request error:', error)
    if (showError) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    }
    return { code: -1, message: '网络错误', data: null as any }
  } finally {
    if (showLoading) {
      Taro.hideLoading()
    }
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, data?: any, options?: Partial<RequestConfig>) {
  return request<T>({ url, method: 'GET', data, ...options })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, options?: Partial<RequestConfig>) {
  return request<T>({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, options?: Partial<RequestConfig>) {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, data?: any, options?: Partial<RequestConfig>) {
  return request<T>({ url, method: 'DELETE', data, ...options })
}

