/**
 * 设置页面
 */
import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Icon } from '@/components'
import type { IconName } from '@/components'
import { isLoggedIn, getUserInfo, clearAuth } from '@/utils/storage'
import { get, post, del } from '@/services/request'
import './index.scss'

interface SettingItem {
  key: string
  label: string
  value?: string
  icon: IconName
  arrow?: boolean
  danger?: boolean
  onClick: () => void
}

interface DeletionStatus {
  isDeletionPending: boolean
  deletionRequestedAt: string | null
  deletionScheduledAt: string | null
  daysRemaining: number | null
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const logged = isLoggedIn()
    setLoggedIn(logged)
    if (logged) {
      setUserInfo(getUserInfo())
      fetchDeletionStatus()
    }
  }

  // 获取注销状态
  const fetchDeletionStatus = async () => {
    try {
      const res = await get<DeletionStatus>('/api/user/deletion')
      if (res.code === 0) {
        setDeletionStatus(res.data)
      }
    } catch (error) {
      console.error('获取注销状态失败:', error)
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

  // 申请注销账号
  const handleDeleteAccount = () => {
    if (!loggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    // 如果已在注销流程中，显示取消注销选项
    if (deletionStatus?.isDeletionPending) {
      Taro.showModal({
        title: '账号注销中',
        content: `您的账号将在 ${deletionStatus.daysRemaining} 天后注销。是否取消注销？`,
        confirmText: '取消注销',
        cancelText: '继续注销',
        confirmColor: '#667eea',
        success: async (res) => {
          if (res.confirm) {
            handleCancelDeletion()
          }
        },
      })
      return
    }

    Taro.showModal({
      title: '注销账号',
      content: '注销账号后，您的所有数据将被删除且无法恢复。账号将进入7天冷静期，期间可随时取消注销。确定要注销吗？',
      confirmText: '确定注销',
      cancelText: '取消',
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          try {
            Taro.showLoading({ title: '处理中...' })
            const result = await post('/api/user/deletion')
            Taro.hideLoading()

            if (result.code === 0) {
              Taro.showModal({
                title: '注销申请已提交',
                content: '您的账号将在7天后注销。期间登录可随时取消注销。',
                showCancel: false,
                confirmText: '我知道了',
                success: () => {
                  fetchDeletionStatus()
                },
              })
            } else {
              Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
            }
          } catch (error) {
            Taro.hideLoading()
            Taro.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      },
    })
  }

  // 取消注销
  const handleCancelDeletion = async () => {
    try {
      Taro.showLoading({ title: '处理中...' })
      const result = await del('/api/user/deletion')
      Taro.hideLoading()

      if (result.code === 0) {
        Taro.showToast({ title: '已取消注销', icon: 'success' })
        setDeletionStatus(null)
        fetchDeletionStatus()
      } else {
        Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
      }
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
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
    [
      {
        key: 'deleteAccount',
        label: deletionStatus?.isDeletionPending 
          ? `注销账号（${deletionStatus.daysRemaining}天后生效）` 
          : '注销账号',
        icon: 'close',
        arrow: true,
        danger: true,
        onClick: handleDeleteAccount,
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
                className={`settings-page__item ${item.danger ? 'settings-page__item--danger' : ''}`}
                onClick={item.onClick}
              >
                <View className='settings-page__item-left'>
                  <View className='settings-page__item-icon'>
                    <Icon name={item.icon} size={22} color={item.danger ? '#ff3b30' : '#667eea'} />
                  </View>
                  <View className='settings-page__item-content'>
                    <Text className={`settings-page__item-label ${item.danger ? 'settings-page__item-label--danger' : ''}`}>
                      {item.label}
                    </Text>
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

