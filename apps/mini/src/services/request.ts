/**
 * 网络请求封装
 */
import Taro from '@tarojs/taro'
import { getToken, clearAuth } from '@/utils/storage'

// API 基础地址
const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000'

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
      // 未授权，跳转登录
      if (result.code === 401) {
        clearAuth()
        Taro.navigateTo({ url: '/pages/auth/login/index' })
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

