/**
 * 统一响应格式
 *
 * 错误码规范:
 * - 0: 成功
 * - 1xxx: 参数错误（客户端问题）
 * - 2xxx: 业务错误（业务逻辑问题）
 * - 3xxx: 认证/授权错误
 * - 4xxx: 外部服务错误（如微信API）
 * - 5xxx: 系统错误（服务器内部问题）
 */

import { NextResponse } from 'next/server'

// ============ 错误码定义 ============

export const ErrorCode = {
  // 成功
  SUCCESS: 0,

  // 1xxx: 参数错误
  PARAM_MISSING: 1001,        // 缺少必要参数
  PARAM_INVALID: 1002,        // 参数格式错误
  PARAM_OUT_OF_RANGE: 1003,   // 参数超出范围

  // 2xxx: 业务错误
  USER_NOT_FOUND: 2001,       // 用户不存在
  USER_EXISTS: 2002,          // 用户已存在
  PASSWORD_WRONG: 2003,       // 密码错误
  ACCOUNT_DISABLED: 2004,     // 账号已禁用
  ORDER_NOT_FOUND: 2010,      // 订单不存在
  ORDER_STATUS_ERROR: 2011,   // 订单状态错误
  BALANCE_NOT_ENOUGH: 2020,   // 余额不足

  // 3xxx: 认证/授权错误
  UNAUTHORIZED: 3001,         // 未登录
  TOKEN_EXPIRED: 3002,        // token 过期
  TOKEN_INVALID: 3003,        // token 无效
  PERMISSION_DENIED: 3004,    // 无权限

  // 4xxx: 外部服务错误
  WECHAT_CODE_INVALID: 4001,  // 微信 code 无效
  WECHAT_APPID_ERROR: 4002,   // 微信 AppID 配置错误
  WECHAT_SECRET_ERROR: 4003,  // 微信 AppSecret 配置错误
  WECHAT_API_ERROR: 4004,     // 微信接口调用失败
  WECHAT_PHONE_ERROR: 4005,   // 获取手机号失败
  SMS_SEND_ERROR: 4010,       // 短信发送失败
  PAYMENT_ERROR: 4020,        // 支付失败

  // 5xxx: 系统错误
  SYSTEM_ERROR: 5000,         // 系统错误
  DB_ERROR: 5001,             // 数据库错误
  CONFIG_ERROR: 5002,         // 配置错误
  NETWORK_ERROR: 5003,        // 网络错误
} as const

// 错误码对应的中文消息
export const ErrorMessage: Record<number, string> = {
  [ErrorCode.SUCCESS]: '操作成功',

  // 参数错误
  [ErrorCode.PARAM_MISSING]: '缺少必要参数',
  [ErrorCode.PARAM_INVALID]: '参数格式错误',
  [ErrorCode.PARAM_OUT_OF_RANGE]: '参数超出有效范围',

  // 业务错误
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_EXISTS]: '用户已存在',
  [ErrorCode.PASSWORD_WRONG]: '密码错误',
  [ErrorCode.ACCOUNT_DISABLED]: '账号已被禁用',
  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORDER_STATUS_ERROR]: '订单状态异常',
  [ErrorCode.BALANCE_NOT_ENOUGH]: '余额不足',

  // 认证错误
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '登录凭证无效',
  [ErrorCode.PERMISSION_DENIED]: '无权限执行此操作',

  // 外部服务错误
  [ErrorCode.WECHAT_CODE_INVALID]: '微信登录凭证无效或已过期，请重试',
  [ErrorCode.WECHAT_APPID_ERROR]: '微信 AppID 配置错误，请联系管理员',
  [ErrorCode.WECHAT_SECRET_ERROR]: '微信 AppSecret 配置错误，请联系管理员',
  [ErrorCode.WECHAT_API_ERROR]: '微信服务暂时不可用，请稍后重试',
  [ErrorCode.WECHAT_PHONE_ERROR]: '获取手机号失败，请重新授权',
  [ErrorCode.SMS_SEND_ERROR]: '短信发送失败，请稍后重试',
  [ErrorCode.PAYMENT_ERROR]: '支付失败，请重试',

  // 系统错误
  [ErrorCode.SYSTEM_ERROR]: '系统繁忙，请稍后重试',
  [ErrorCode.DB_ERROR]: '数据服务异常，请稍后重试',
  [ErrorCode.CONFIG_ERROR]: '服务器配置错误，请联系管理员',
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请稍后重试',
}

// ============ 响应类型 ============

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
  timestamp: number
}

// ============ 响应函数 ============

/**
 * 成功响应
 */
export function success<T>(data: T, message = '操作成功'): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: ErrorCode.SUCCESS,
    message,
    data,
    timestamp: Date.now(),
  })
}

/**
 * 错误响应
 * @param code 错误码
 * @param customMessage 自定义消息（可选，会覆盖默认消息）
 * @param httpStatus HTTP 状态码（默认根据错误码自动判断）
 */
export function error(
  code: number,
  customMessage?: string,
  httpStatus?: number
): NextResponse<ApiResponse<null>> {
  const message = customMessage || ErrorMessage[code] || '未知错误'

  // 根据错误码范围自动判断 HTTP 状态码
  let status = httpStatus
  if (!status) {
    if (code >= 1000 && code < 2000) status = 400      // 参数错误 -> 400
    else if (code >= 2000 && code < 3000) status = 400 // 业务错误 -> 400
    else if (code >= 3000 && code < 4000) status = 401 // 认证错误 -> 401
    else if (code >= 4000 && code < 5000) status = 502 // 外部服务错误 -> 502
    else if (code >= 5000) status = 500                // 系统错误 -> 500
    else status = 400
  }

  return NextResponse.json(
    {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    },
    { status }
  )
}

/**
 * 参数缺失错误
 */
export function paramMissing(paramName: string): NextResponse<ApiResponse<null>> {
  return error(ErrorCode.PARAM_MISSING, `缺少必要参数: ${paramName}`)
}

/**
 * 参数无效错误
 */
export function paramInvalid(paramName: string, reason?: string): NextResponse<ApiResponse<null>> {
  const msg = reason ? `参数 ${paramName} 无效: ${reason}` : `参数 ${paramName} 格式错误`
  return error(ErrorCode.PARAM_INVALID, msg)
}

/**
 * 未授权错误
 */
export function unauthorized(message?: string): NextResponse<ApiResponse<null>> {
  return error(ErrorCode.UNAUTHORIZED, message || '请先登录')
}

/**
 * 验证错误
 */
export function validationError(message: string, errors?: any): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code: ErrorCode.PARAM_INVALID,
      message,
      data: errors || null,
      timestamp: Date.now(),
    },
    { status: 400 }
  )
}

// ============ 微信错误码映射 ============

/**
 * 微信 API 错误码映射
 * https://developers.weixin.qq.com/miniprogram/dev/framework/usability/PublicErrno.html
 */
export function mapWechatError(errcode: number, errmsg?: string): { code: number; message: string } {
  const wechatErrorMap: Record<number, { code: number; message: string }> = {
    // code 相关错误
    40029: { code: ErrorCode.WECHAT_CODE_INVALID, message: '微信登录凭证无效，请重新登录' },
    40163: { code: ErrorCode.WECHAT_CODE_INVALID, message: '微信登录凭证已使用，请重新登录' },
    45011: { code: ErrorCode.WECHAT_API_ERROR, message: '请求过于频繁，请稍后再试' },

    // AppID/Secret 相关
    40013: { code: ErrorCode.WECHAT_APPID_ERROR, message: '微信 AppID 无效，请检查配置' },
    40125: { code: ErrorCode.WECHAT_SECRET_ERROR, message: '微信 AppSecret 无效，请检查配置' },
    41002: { code: ErrorCode.WECHAT_APPID_ERROR, message: '缺少 AppID 参数' },
    41004: { code: ErrorCode.WECHAT_SECRET_ERROR, message: '缺少 AppSecret 参数' },

    // 其他错误
    '-1': { code: ErrorCode.WECHAT_API_ERROR, message: '微信系统繁忙，请稍后重试' },
    40001: { code: ErrorCode.WECHAT_SECRET_ERROR, message: '微信 access_token 无效' },
  }

  if (wechatErrorMap[errcode]) {
    return wechatErrorMap[errcode]
  }

  // 未知错误
  return {
    code: ErrorCode.WECHAT_API_ERROR,
    message: errmsg || '微信服务异常，请稍后重试',
  }
}

