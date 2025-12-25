/**
 * 手机号一键登录组件
 */
import { View, Text, Button } from '@tarojs/components'
import { Icon } from '@/components'
import './index.scss'

interface PhoneLoginProps {
  loading: boolean
  onLogin: (e: any) => void
}

export default function PhoneLogin({ loading, onLogin }: PhoneLoginProps) {
  return (
    <View className='phone-login'>
      <View className='phone-login__icon-wrap'>
        <Icon name='phone' size={40} color='#667eea' />
      </View>
      <Text className='phone-login__title'>手机号快捷登录</Text>
      <Text className='phone-login__desc'>授权后即可一键登录，安全便捷</Text>
      <Button
        className='phone-login__btn'
        openType='getPhoneNumber'
        onGetPhoneNumber={onLogin}
        loading={loading}
        disabled={loading}
      >
        <Icon name='phone' size={20} color='#fff' />
        <Text>{loading ? '登录中...' : '获取手机号登录'}</Text>
      </Button>
      <View className='phone-login__tips'>
        <Icon name='shield' size={14} color='#8e8e93' />
        <Text>您的手机号仅用于登录验证</Text>
      </View>
    </View>
  )
}
