/**
 * 注册提示组件
 */
import { View, Text } from '@tarojs/components'
import './index.scss'

export default function RegisterTips() {
  return (
    <View className='register-tips'>
      <Text className='register-tips__item'>• 用户名注册后不可修改</Text>
      <Text className='register-tips__item'>• 绑定手机号后可使用手机号一键登录</Text>
    </View>
  )
}

