/**
 * 登录方式切换标签组件
 */
import { View, Text } from '@tarojs/components'
import './index.scss'

export type LoginType = 'wechat' | 'phone' | 'account'

interface LoginTabsProps {
  current: LoginType
  onChange: (type: LoginType) => void
}

export default function LoginTabs({ current, onChange }: LoginTabsProps) {
  const tabs: { key: LoginType; label: string }[] = [
    { key: 'wechat', label: '微信登录' },
    { key: 'phone', label: '手机号' },
    { key: 'account', label: '账号密码' },
  ]

  return (
    <View className='login-tabs'>
      {tabs.map((tab) => (
        <View
          key={tab.key}
          className={`login-tabs__item ${current === tab.key ? 'login-tabs__item--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <Text>{tab.label}</Text>
          {current === tab.key && <View className='login-tabs__indicator' />}
        </View>
      ))}
    </View>
  )
}

