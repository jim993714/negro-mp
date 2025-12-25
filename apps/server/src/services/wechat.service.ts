/**
 * 微信服务
 * @description 处理微信相关 API 调用
 */

const WECHAT_API = 'https://api.weixin.qq.com'

/**
 * 获取 Access Token
 */
export async function getAccessToken(): Promise<string> {
  const appId = process.env.WECHAT_APP_ID
  const appSecret = process.env.WECHAT_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('微信配置缺失')
  }

  const res = await fetch(
    `${WECHAT_API}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  )
  const data = await res.json()

  if (data.errcode) {
    throw new Error(`获取 access_token 失败: ${data.errmsg}`)
  }

  return data.access_token
}

/**
 * 通过 code 获取 OpenID
 */
export async function getOpenidByCode(code: string): Promise<{ openid: string; unionid?: string }> {
  const appId = process.env.WECHAT_APP_ID
  const appSecret = process.env.WECHAT_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('微信配置缺失')
  }

  const res = await fetch(
    `${WECHAT_API}/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
  )
  const data = await res.json()

  if (data.errcode) {
    throw new Error(`获取 openid 失败: ${data.errmsg}`)
  }

  return { openid: data.openid, unionid: data.unionid }
}

/**
 * 通过 code 获取手机号
 */
export async function getPhoneNumber(code: string): Promise<string> {
  const accessToken = await getAccessToken()

  const res = await fetch(
    `${WECHAT_API}/wxa/business/getuserphonenumber?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }
  )
  const data = await res.json()

  if (data.errcode !== 0) {
    throw new Error(`获取手机号失败: ${data.errmsg}`)
  }

  return data.phone_info?.phoneNumber || data.phone_info?.purePhoneNumber
}

