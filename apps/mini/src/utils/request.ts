import Taro from '@tarojs/taro';

// API 基础地址，由构建时注入
declare const API_BASE_URL: string;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  showLoading?: boolean;
  showError?: boolean;
}

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 封装请求方法
 */
export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    showError = true,
  } = options;

  // 获取 token
  const token = Taro.getStorageSync('token');
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true });
  }

  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    });

    if (showLoading) {
      Taro.hideLoading();
    }

    const { statusCode, data: responseData } = response;

    // HTTP 错误
    if (statusCode >= 400) {
      if (statusCode === 401) {
        // 未授权，清除 token 并跳转登录
        Taro.removeStorageSync('token');
        Taro.navigateTo({ url: '/pages/login/index' });
        throw new Error('请先登录');
      }
      throw new Error(responseData?.message || '请求失败');
    }

    // 业务错误
    if (responseData.code !== 0) {
      if (showError) {
        Taro.showToast({
          title: responseData.message || '操作失败',
          icon: 'none',
        });
      }
      throw new Error(responseData.message);
    }

    return responseData.data as T;
  } catch (error) {
    if (showLoading) {
      Taro.hideLoading();
    }

    if (showError && error instanceof Error) {
      Taro.showToast({
        title: error.message || '网络错误',
        icon: 'none',
      });
    }

    throw error;
  }
}

/**
 * GET 请求
 */
export function get<T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) {
  return request<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export function post<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'method' | 'data'>
) {
  return request<T>(url, { ...options, method: 'POST', data });
}

/**
 * PUT 请求
 */
export function put<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestOptions, 'method' | 'data'>
) {
  return request<T>(url, { ...options, method: 'PUT', data });
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) {
  return request<T>(url, { ...options, method: 'DELETE' });
}

