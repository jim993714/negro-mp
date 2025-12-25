/**
 * 账号密码登录接口
 * POST /api/auth/login
 */
import { NextRequest } from 'next/server'
import {
  success,
  error,
  paramMissing,
  ErrorCode,
} from '@/lib/response'
import { loginWithPassword } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let body: { account?: string; password?: string }
    try {
      body = await request.json()
    } catch {
      return error(ErrorCode.PARAM_INVALID, '请求体格式错误，需要 JSON 格式')
    }

    const { account, password } = body

    // 参数校验
    if (!account?.trim()) {
      return paramMissing('account (账号)')
    }
    if (!password) {
      return paramMissing('password (密码)')
    }

    // 调用服务
    const result = await loginWithPassword(account.trim(), password)

    if (result.success) {
      return success(result.data, '登录成功')
    }

    // 根据错误类型返回不同的错误码
    if (result.message?.includes('不存在')) {
      return error(ErrorCode.USER_NOT_FOUND, result.message)
    }
    if (result.message?.includes('密码')) {
      return error(ErrorCode.PASSWORD_WRONG, result.message)
    }
    if (result.message?.includes('禁用')) {
      return error(ErrorCode.ACCOUNT_DISABLED, result.message)
    }

    return error(ErrorCode.SYSTEM_ERROR, result.message || '登录失败')
  } catch (err) {
    console.error('[账号登录] 错误:', err)
    return error(ErrorCode.SYSTEM_ERROR, '系统繁忙，请稍后重试')
  }
}
