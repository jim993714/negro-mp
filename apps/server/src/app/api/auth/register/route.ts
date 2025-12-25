/**
 * 注册接口
 * POST /api/auth/register
 */
import { NextRequest } from 'next/server'
import {
  success,
  error,
  paramMissing,
  paramInvalid,
  ErrorCode,
} from '@/lib/response'
import { register } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let body: { username?: string; password?: string; phone?: string }
    try {
      body = await request.json()
    } catch {
      return error(ErrorCode.PARAM_INVALID, '请求体格式错误，需要 JSON 格式')
    }

    const { username, password, phone } = body

    // 参数校验
    if (!username?.trim()) {
      return paramMissing('username (用户名)')
    }

    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 2 || trimmedUsername.length > 16) {
      return paramInvalid('username', '长度需要 2-16 个字符')
    }

    const usernameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5_]+$/
    if (!usernameRegex.test(trimmedUsername)) {
      return paramInvalid('username', '只能包含中英文、数字和下划线')
    }

    if (!password) {
      return paramMissing('password (密码)')
    }
    if (password.length < 6 || password.length > 20) {
      return paramInvalid('password', '长度需要 6-20 位')
    }

    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return paramInvalid('phone', '手机号格式不正确')
      }
    }

    // 调用服务
    const result = await register(trimmedUsername, password, phone)

    if (result.success) {
      return success(result.data, '注册成功')
    }

    // 根据错误信息返回不同错误码
    if (result.message?.includes('已存在') || result.message?.includes('已被注册')) {
      return error(ErrorCode.USER_EXISTS, result.message)
    }

    return error(ErrorCode.SYSTEM_ERROR, result.message || '注册失败')
  } catch (err) {
    console.error('[注册] 错误:', err)
    return error(ErrorCode.SYSTEM_ERROR, '系统繁忙，请稍后重试')
  }
}
