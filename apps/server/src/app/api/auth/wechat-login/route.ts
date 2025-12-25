/**
 * 微信授权登录接口
 * 根据微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html
 *
 * 流程:
 * 1. 前端调用 wx.login() 获取临时登录凭证 code
 * 2. 前端将 code 发送到本接口
 * 3. 本接口调用微信 auth.code2Session 换取 openid 和 session_key
 * 4. 根据 openid 创建或查找用户
 * 5. 生成 JWT token 返回给前端
 */
import { prisma } from '@negro/database'
import { generateToken } from '@/lib/auth'
import { generateDefaultAvatar } from '@/lib/avatar'
import {
  success,
  error,
  paramMissing,
  mapWechatError,
  ErrorCode,
} from '@/lib/response'

// 微信 code2Session 响应类型
interface WechatSessionResponse {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

/**
 * 调用微信 auth.code2Session 接口
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 */
async function code2Session(code: string): Promise<WechatSessionResponse> {
  const appId = process.env.WECHAT_APP_ID
  const appSecret = process.env.WECHAT_APP_SECRET

  // 检查配置
  if (!appId) {
    console.error('[微信登录] 缺少环境变量: WECHAT_APP_ID')
    return { errcode: 41002, errmsg: '缺少 AppID 配置' }
  }

  if (!appSecret) {
    console.error('[微信登录] 缺少环境变量: WECHAT_APP_SECRET')
    return { errcode: 41004, errmsg: '缺少 AppSecret 配置' }
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

  try {
    console.log('[微信登录] 调用 code2Session, code:', code.substring(0, 10) + '...')
    const response = await fetch(url)
    const data = await response.json()
    console.log('[微信登录] code2Session 响应:', JSON.stringify(data))
    return data
  } catch (err) {
    console.error('[微信登录] 调用微信接口失败:', err)
    return { errcode: -1, errmsg: '网络请求失败' }
  }
}

export async function POST(request: Request) {
  try {
    // 解析请求体
    let body: { code?: string }
    try {
      body = await request.json()
    } catch {
      return error(ErrorCode.PARAM_INVALID, '请求体格式错误，需要 JSON 格式')
    }

    const { code } = body

    // 参数校验
    if (!code) {
      return paramMissing('code (微信登录凭证)')
    }

    if (typeof code !== 'string' || code.length < 10) {
      return error(ErrorCode.PARAM_INVALID, 'code 参数格式不正确')
    }

    // 调用微信接口获取 openid
    const sessionRes = await code2Session(code)

    // 处理微信接口错误
    if (sessionRes.errcode) {
      const { code: errorCode, message } = mapWechatError(
        sessionRes.errcode,
        sessionRes.errmsg
      )
      console.error('[微信登录] 微信接口返回错误:', {
        errcode: sessionRes.errcode,
        errmsg: sessionRes.errmsg,
        mappedCode: errorCode,
        mappedMessage: message,
      })
      return error(errorCode, message)
    }

    if (!sessionRes.openid) {
      return error(ErrorCode.WECHAT_API_ERROR, '获取用户标识失败，请重试')
    }

    const { openid } = sessionRes
    console.log('[微信登录] 获取 openid 成功:', openid.substring(0, 10) + '...')

    // 查找或创建用户
    let user
    try {
      user = await prisma.user.findUnique({
        where: { openid },
      })

if (!user) {
      // 新用户，自动注册
      const nickname = `用户${Date.now().toString().slice(-6)}`
      user = await prisma.user.create({
        data: {
          openid,
          nickname,
          avatar: generateDefaultAvatar(nickname),
        },
      })
      console.log('[微信登录] 创建新用户:', user.id)
    } else {
        console.log('[微信登录] 用户已存在:', user.id)
      }
    } catch (dbError) {
      console.error('[微信登录] 数据库操作失败:', dbError)
      return error(ErrorCode.DB_ERROR, '用户数据处理失败，请稍后重试')
    }

    // 生成 JWT token
    const token = generateToken({
      userId: user.id,
      openid: user.openid,
      role: user.role,
    })

    return success(
      {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          role: user.role,
        },
      },
      '登录成功'
    )
  } catch (err) {
    console.error('[微信登录] 未知错误:', err)
    return error(ErrorCode.SYSTEM_ERROR, '系统繁忙，请稍后重试')
  }
}
