/**
 * 用户信息卡片组件
 */
import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@/components'
import { put } from '@/services/request'
import { setUserInfo, getUserInfo } from '@/utils/storage'
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
  onUserInfoUpdate?: (userInfo: UserInfo) => void
}

// 默认头像生成（与后端一致的逻辑）
const getDefaultAvatar = (name: string) => {
  const displayName = (name || '用户').slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=ffffff&size=128&rounded=true&bold=true&format=png`
}

export default function UserCard({ isLoggedIn, userInfo, onLogin, onSettings, onUserInfoUpdate }: UserCardProps) {
  const defaultAvatar = useMemo(() => getDefaultAvatar(userInfo?.nickname || '用户'), [userInfo?.nickname])
  
  // 计算当前应该显示的头像URL
  const avatarUrl = useMemo(() => {
    if (!isLoggedIn || !userInfo) {
      return defaultAvatar
    }
    return userInfo.avatar || defaultAvatar
  }, [isLoggedIn, userInfo, defaultAvatar])
  
  // 用于头像加载失败时的备用URL
  const [fallbackAvatar, setFallbackAvatar] = useState<string | null>(null)
  
  // 当用户信息变化时重置fallback
  useEffect(() => {
    setFallbackAvatar(null)
  }, [userInfo?.avatar])

  // 图片加载失败时回退到默认头像
  const handleAvatarError = () => {
    console.log('[UserCard] 头像加载失败，使用默认头像')
    setFallbackAvatar(defaultAvatar)
  }
  
  // 实际显示的头像URL
  const displayAvatarUrl = fallbackAvatar || avatarUrl

  // 点击头像更换头像
  const handleAvatarClick = async (e: any) => {
    e.stopPropagation()
    if (!isLoggedIn) return

    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        Taro.showLoading({ title: '上传中...' })
        
        // 上传图片到服务器
        const uploadRes = await Taro.uploadFile({
          url: `${process.env.TARO_APP_API_URL || 'http://localhost:3000'}/api/user/avatar`,
          filePath: res.tempFilePaths[0],
          name: 'file',
          header: {
            Authorization: `Bearer ${Taro.getStorageSync('token')}`,
          },
        })

        Taro.hideLoading()

        const data = JSON.parse(uploadRes.data)
        if (data.code === 0) {
          const newAvatarUrl = data.data.avatar
          setFallbackAvatar(null) // 清除fallback
          
          // 更新本地存储
          const currentUserInfo = getUserInfo()
          if (currentUserInfo) {
            const updatedUserInfo = { ...currentUserInfo, avatar: newAvatarUrl }
            setUserInfo(updatedUserInfo)
            onUserInfoUpdate?.(updatedUserInfo)
          }
          
          Taro.showToast({ title: '头像更新成功', icon: 'success' })
        } else {
          Taro.showToast({ title: data.message || '上传失败', icon: 'none' })
        }
      }
    } catch (error: any) {
      Taro.hideLoading()
      if (error.errMsg?.includes('cancel')) {
        return // 用户取消选择
      }
      console.error('更换头像失败:', error)
      Taro.showToast({ title: '更换头像失败', icon: 'none' })
    }
  }

  // 点击昵称更换昵称
  const handleNicknameClick = (e: any) => {
    e.stopPropagation()
    if (!isLoggedIn) return

    Taro.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: userInfo?.nickname || '',
      success: async (res) => {
        if (res.confirm && res.content) {
          const newNickname = res.content.trim()
          if (!newNickname) {
            Taro.showToast({ title: '昵称不能为空', icon: 'none' })
            return
          }
          if (newNickname.length > 20) {
            Taro.showToast({ title: '昵称不能超过20个字符', icon: 'none' })
            return
          }

          try {
            Taro.showLoading({ title: '保存中...' })
            const result = await put<UserInfo>('/api/user/profile', { nickname: newNickname })
            Taro.hideLoading()

            if (result.code === 0) {
              // 更新本地存储
              const currentUserInfo = getUserInfo()
              if (currentUserInfo) {
                const updatedUserInfo = { ...currentUserInfo, nickname: newNickname }
                setUserInfo(updatedUserInfo)
                onUserInfoUpdate?.(updatedUserInfo)
              }
              Taro.showToast({ title: '昵称修改成功', icon: 'success' })
            } else {
              Taro.showToast({ title: result.message || '修改失败', icon: 'none' })
            }
          } catch (error) {
            Taro.hideLoading()
            console.error('修改昵称失败:', error)
            Taro.showToast({ title: '修改昵称失败', icon: 'none' })
          }
        }
      },
    })
  }

  // 卡片点击事件 - 统一处理，避免条件性onClick导致的Taro事件监听器问题
  const handleCardClick = () => {
    if (!isLoggedIn) {
      onLogin()
    }
  }

  // 设置按钮点击
  const handleSettingsClick = (e: any) => {
    e.stopPropagation()
    onSettings()
  }

  // 使用 key 确保登录状态切换时组件完全重新创建，避免事件监听器残留
  return (
    <View 
      key={isLoggedIn ? 'logged-in' : 'logged-out'} 
      className='user-card' 
      onClick={handleCardClick}
    >
      {/* 头像 */}
      <View className='user-card__avatar' onClick={isLoggedIn ? handleAvatarClick : undefined}>
        {isLoggedIn && userInfo ? (
          <>
            <Image 
              className='avatar-img' 
              src={displayAvatarUrl}
              mode='aspectFill'
              onError={handleAvatarError}
            />
            <View className='avatar-edit'>
              <Icon name='camera' size={14} color='#fff' />
            </View>
          </>
        ) : (
          <View className='avatar-placeholder'>
            <Icon name='user' size={32} color='#667eea' />
          </View>
        )}
      </View>

      {/* 信息 */}
      <View className='user-card__info'>
        {isLoggedIn && userInfo ? (
          <>
            <Text className='nickname' onClick={handleNicknameClick}>
              {userInfo.nickname || '游戏玩家'}
              <Text className='edit-icon'>✎</Text>
            </Text>
            <Text className='user-id'>ID: {userInfo.id?.slice(-8)}</Text>
          </>
        ) : (
          <>
            <Text className='login-text'>点击登录</Text>
            <Text className='login-tip'>登录后享受更多服务</Text>
          </>
        )}
      </View>

      {/* 设置按钮 */}
      {isLoggedIn && userInfo && (
        <View className='user-card__settings' onClick={handleSettingsClick}>
          <Icon name='settings' size={22} color='rgba(255,255,255,0.9)' />
        </View>
      )}
    </View>
  )
}
