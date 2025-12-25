/**
 * 注册表单组件
 */
import { View, Text, Input } from '@tarojs/components'
import './index.scss'

interface RegisterFormProps {
  username: string
  password: string
  confirmPassword: string
  phone: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export default function RegisterForm({
  username,
  password,
  confirmPassword,
  phone,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onPhoneChange,
}: RegisterFormProps) {
  return (
    <View className='register-form'>
      <View className='register-form__item'>
        <Text className='register-form__label'>用户名</Text>
        <Input
          className='register-form__input'
          placeholder='请输入用户名（2-16位）'
          value={username}
          onInput={(e) => onUsernameChange(e.detail.value)}
          maxlength={16}
        />
      </View>

      <View className='register-form__item'>
        <Text className='register-form__label'>密码</Text>
        <Input
          className='register-form__input'
          type='password'
          placeholder='请输入密码（6-20位）'
          value={password}
          onInput={(e) => onPasswordChange(e.detail.value)}
          maxlength={20}
        />
      </View>

      <View className='register-form__item'>
        <Text className='register-form__label'>确认密码</Text>
        <Input
          className='register-form__input'
          type='password'
          placeholder='请再次输入密码'
          value={confirmPassword}
          onInput={(e) => onConfirmPasswordChange(e.detail.value)}
          maxlength={20}
        />
      </View>

      <View className='register-form__item'>
        <Text className='register-form__label'>
          手机号 <Text className='optional'>（选填）</Text>
        </Text>
        <Input
          className='register-form__input'
          type='number'
          placeholder='绑定后可用手机号登录'
          value={phone}
          onInput={(e) => onPhoneChange(e.detail.value)}
          maxlength={11}
        />
      </View>
    </View>
  )
}

