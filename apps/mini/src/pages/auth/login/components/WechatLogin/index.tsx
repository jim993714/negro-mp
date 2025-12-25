/**
 * 微信授权登录组件
 */
import { View, Text, Button } from '@tarojs/components'
import { Icon } from '@/components'
import './index.scss'

interface WechatLoginProps {
  loading: boolean
  onLogin: () => void
}

export default function WechatLogin({ loading, onLogin }: WechatLoginProps) {
  return (
    <View className='wechat-login'>
      <View className='wechat-login__icon-wrap'>
        <Icon name='wechat' size={48} color='#07c160' />
      </View>
      <Text className='wechat-login__title'>微信快捷登录</Text>
      <Text className='wechat-login__desc'>使用微信账号一键快速登录</Text>
      <Button
        className='wechat-login__btn'
        onClick={onLogin}
        loading={loading}
        disabled={loading}
      >
        <Icon name='wechat' size={20} color='#fff' />
        <Text>{loading ? '登录中...' : '微信登录'}</Text>
      </Button>
    </View>
  )
}
