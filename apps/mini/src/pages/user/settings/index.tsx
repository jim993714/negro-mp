/**
 * 设置页面
 */
import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Icon } from '@/components'
import type { IconName } from '@/components'
import { isLoggedIn, getUserInfo, clearAuth } from '@/utils/storage'
import './index.scss'

interface SettingItem {
  key: string
  label: string
  value?: string
  icon: IconName
  arrow?: boolean
  onClick: () => void
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const logged = isLoggedIn()
    setLoggedIn(logged)
    if (logged) {
      setUserInfo(getUserInfo())
    }
  }

  // 绑定手机号
  const handleBindPhone = () => {
    if (!loggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '绑定手机号',
      content: '是否使用微信手机号授权绑定？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现手机号绑定逻辑
          Taro.showToast({ title: '功能开发中', icon: 'none' })
        }
      },
    })
  }

  // 退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          clearAuth()
          Taro.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      },
    })
  }

  // 关于我们
  const handleAbout = () => {
    Taro.showModal({
      title: '关于我们',
      content: '游戏代练平台\n专业、安全、高效的代练服务',
      showCancel: false,
      confirmText: '知道了',
    })
  }

  // 隐私政策
  const handlePrivacy = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  // 用户协议
  const handleAgreement = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  const settingsGroups: SettingItem[][] = [
    [
      {
        key: 'phone',
        label: '绑定手机号',
        value: userInfo?.phone || '未绑定',
        icon: 'phone',
        arrow: true,
        onClick: handleBindPhone,
      },
    ],
    [
      {
        key: 'privacy',
        label: '隐私政策',
        icon: 'shield',
        arrow: true,
        onClick: handlePrivacy,
      },
      {
        key: 'agreement',
        label: '用户协议',
        icon: 'info',
        arrow: true,
        onClick: handleAgreement,
      },
      {
        key: 'about',
        label: '关于我们',
        icon: 'help',
        arrow: true,
        onClick: handleAbout,
      },
    ],
  ]

  return (
    <View className='settings-page'>
      <NavBar title='设置' />

      <View className='settings-page__content'>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className='settings-page__group'>
            {group.map((item) => (
              <View
                key={item.key}
                className='settings-page__item'
                onClick={item.onClick}
              >
                <View className='settings-page__item-left'>
                  <View className='settings-page__item-icon'>
                    <Icon name={item.icon} size={22} color='#667eea' />
                  </View>
                  <View className='settings-page__item-content'>
                    <Text className='settings-page__item-label'>{item.label}</Text>
                    {item.value && (
                      <Text className='settings-page__item-value'>{item.value}</Text>
                    )}
                  </View>
                </View>
                {item.arrow && (
                  <View className='settings-page__item-arrow'>
                    <Icon name='arrowRight' size={18} color='#c7c7cc' />
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {loggedIn && (
          <View className='settings-page__logout'>
            <Button
              className='settings-page__logout-btn'
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}

