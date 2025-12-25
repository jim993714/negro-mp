/**
 * 手机号一键登录接口
 * POST /api/auth/phone-login
 */
import { NextRequest } from 'next/server'
import {
  success,
  error,
  paramMissing,
  mapWechatError,
  ErrorCode,
} from '@/lib/response'
import { loginWithPhone } from '@/services/auth.service'
import { getOpenidByCode, getPhoneNumber } from '@/services/wechat.service'

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    let body: { code?: string; phoneCode?: string }
    try {
      body = await request.json()
    } catch {
      return error(ErrorCode.PARAM_INVALID, '请求体格式错误，需要 JSON 格式')
    }

    const { code, phoneCode } = body

    // 参数校验
    if (!code) {
      return paramMissing('code (微信登录凭证)')
    }
    if (!phoneCode) {
      return paramMissing('phoneCode (手机号凭证)')
    }

    console.log('[手机号登录] 开始处理, code:', code.substring(0, 10) + '...')

    // 获取 openid
    let openid: string
    let unionid: string | undefined
    try {
      const result = await getOpenidByCode(code)
      openid = result.openid
      unionid = result.unionid
      console.log('[手机号登录] 获取 openid 成功')
    } catch (err: any) {
      console.error('[手机号登录] 获取 openid 失败:', err)

      // 如果是微信接口错误，映射错误码
      if (err.errcode) {
        const mapped = mapWechatError(err.errcode, err.errmsg)
        return error(mapped.code, mapped.message)
      }
      return error(ErrorCode.WECHAT_API_ERROR, '微信登录失败，请重试')
    }

    // 获取手机号
    let phoneNumber: string
    try {
      phoneNumber = await getPhoneNumber(phoneCode)
      console.log('[手机号登录] 获取手机号成功:', phoneNumber.substring(0, 3) + '****')
    } catch (err: any) {
      console.error('[手机号登录] 获取手机号失败:', err)

      if (err.errcode) {
        const mapped = mapWechatError(err.errcode, err.errmsg)
        return error(mapped.code, mapped.message)
      }
      return error(ErrorCode.WECHAT_PHONE_ERROR, '获取手机号失败，请重新授权')
    }

    if (!phoneNumber) {
      return error(ErrorCode.WECHAT_PHONE_ERROR, '获取手机号失败，请重新授权')
    }

    // 调用登录服务
    const result = await loginWithPhone(openid, phoneNumber, unionid)

    if (result.success) {
      return success(result.data, '登录成功')
    }

    return error(ErrorCode.SYSTEM_ERROR, result.message || '登录失败')
  } catch (err) {
    console.error('[手机号登录] 未知错误:', err)
    return error(ErrorCode.SYSTEM_ERROR, '系统繁忙，请稍后重试')
  }
}
