/**
 * 用户信息卡片组件
 */
import { View, Text, Image } from '@tarojs/components'
import { Icon } from '@/components'
import './index.scss'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
}

interface UserCardProps {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  onLogin: () => void
  onSettings: () => void
}

// 默认头像生成（与后端一致的逻辑）
const getDefaultAvatar = (name: string) => {
  const displayName = (name || '用户').slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=ffffff&size=128&rounded=true&bold=true&format=png`
}

export default function UserCard({ isLoggedIn, userInfo, onLogin, onSettings }: UserCardProps) {
  // 获取头像URL，优先使用用户头像，否则使用默认头像
  const avatarUrl = userInfo?.avatar || getDefaultAvatar(userInfo?.nickname || '用户')

  return (
    <View className='user-card' onClick={isLoggedIn ? undefined : onLogin}>
      {/* 头像 */}
      <View className='user-card__avatar'>
        {isLoggedIn ? (
          <Image 
            className='avatar-img' 
            src={avatarUrl}
            mode='aspectFill'
          />
        ) : (
          <View className='avatar-placeholder'>
            <Icon name='user' size={32} color='#667eea' />
          </View>
        )}
      </View>

      {/* 信息 */}
      <View className='user-card__info'>
        {isLoggedIn ? (
          <>
            <Text className='nickname'>{userInfo?.nickname || '游戏玩家'}</Text>
            <Text className='user-id'>ID: {userInfo?.id?.slice(-8)}</Text>
          </>
        ) : (
          <>
            <Text className='login-text'>点击登录</Text>
            <Text className='login-tip'>登录后享受更多服务</Text>
          </>
        )}
      </View>

      {/* 设置按钮 */}
      {isLoggedIn && (
        <View 
          className='user-card__settings' 
          onClick={(e) => {
            e.stopPropagation()
            onSettings()
          }}
        >
          <Icon name='settings' size={22} color='rgba(255,255,255,0.9)' />
        </View>
      )}
    </View>
  )
}
