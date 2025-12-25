/**
 * 个人中心页面
 */
import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { isLoggedIn, getUserInfo, setUserInfo as saveUserInfo } from '@/utils/storage'
import { fetchUserProfile } from '@/services/user.service'
import { TabBar } from '@/components'

// 页面组件
import { UserCard, StatsCard, OrderTabs, ServiceGrid, SectionCard } from './components'
import './index.scss'

// 配置数据
const STATS_ITEMS = [
  { label: '优惠券', value: 0, key: 'coupon' },
  { label: '收藏', value: 0, key: 'favorite' },
  { label: '浏览足迹', value: 0, key: 'history' },
]

const ORDER_TABS = [
  { icon: 'pending', text: '待付款', status: 'pending', color: '#ff9500' },
  { icon: 'processing', text: '进行中', status: 'processing', color: '#1890ff' },
  { icon: 'completed', text: '已完成', status: 'completed', color: '#52c41a' },
  { icon: 'review', text: '待评价', status: 'review', color: '#faad14' },
  { icon: 'refund', text: '退款', status: 'refund', color: '#ff4d4f' },
]

const SERVICE_ITEMS = [
  [
    { icon: 'wallet', text: '我的钱包', key: 'wallet', color: '#faad14' },
    { icon: 'coupon', text: '我的优惠', key: 'coupon', color: '#ff4d4f' },
    { icon: 'favorite', text: '我的收藏', key: 'favorite', color: '#ff4d4f' },
    { icon: 'user', text: '成为代练', key: 'booster', color: '#faad14' },
  ],
  [
    { icon: 'headset', text: '平台客服', key: 'service', color: '#8c8c8c' },
    { icon: 'bell', text: '消息通知', key: 'notification', color: '#faad14' },
    { icon: 'settings', text: '账号设置', key: 'settings', color: '#8c8c8c' },
    { icon: 'help', text: '帮助中心', key: 'help', color: '#ff4d4f' },
  ],
]

export default function ProfilePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  const [loading, setLoading] = useState(false)
  // 用于在状态切换时提供稳定的渲染key
  const [renderKey, setRenderKey] = useState(0)

  // 从服务器获取最新用户信息
  const fetchLatestUserInfo = async () => {
    setLoading(true)
    try {
      console.log('[ProfilePage] 开始获取用户信息...')
      const profile = await fetchUserProfile({ showError: false, updateLocal: true })
      console.log('[ProfilePage] 获取到的profile:', profile)
      
      if (profile) {
        setLoggedIn(true)
        setUserInfo({
          id: profile.id,
          nickname: profile.nickname,
          avatar: profile.avatar,
          phone: profile.phone,
          role: profile.role,
          status: profile.status,
        })
      } else {
        // 如果获取失败，使用本地数据
        const localUser = getUserInfo()
        console.log('[ProfilePage] profile为null，使用本地数据:', localUser)
        if (localUser) {
          setLoggedIn(true)
          setUserInfo(localUser)
        }
      }
    } catch (error) {
      console.error('[ProfilePage] 获取用户信息失败:', error)
      // 降级使用本地数据
      const localUser = getUserInfo()
      setLoggedIn(!!localUser)
      setUserInfo(localUser)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 获取状态栏高度
    const windowInfo = Taro.getWindowInfo()
    setStatusBarHeight(windowInfo.statusBarHeight || 0)
  }, [])

  useDidShow(() => {
    // 每次显示页面时，先快速检查本地状态
    const logged = isLoggedIn()
    const localUser = getUserInfo()
    
    console.log('[ProfilePage] useDidShow - logged:', logged, 'localUser:', localUser)
    
    // 如果登录状态发生变化，更新 renderKey 来强制重新创建子组件
    // 这可以避免 Taro 事件监听器清理时的问题
    if (logged !== loggedIn) {
      setRenderKey(prev => prev + 1)
    }
    
    // 更新状态
    setLoggedIn(logged)
    setUserInfo(logged ? localUser : null)
    
    // 如果已登录，从服务器获取最新数据
    if (logged) {
      fetchLatestUserInfo()
    }
  })

  // 跳转登录
  const goToLogin = () => {
    Taro.navigateTo({ url: '/pages/auth/login/index' })
  }

  // 需要登录的操作
  const requireAuth = (callback: () => void) => {
    if (!loggedIn) {
      goToLogin()
      return
    }
    callback()
  }

  // 跳转订单
  const handleOrderClick = (status: string) => {
    requireAuth(() => {
      Taro.switchTab({ url: '/pages/order/list/index' })
    })
  }

  // 服务项点击
  const handleServiceClick = (key: string) => {
    requireAuth(() => {
      switch (key) {
        case 'wallet':
          Taro.navigateTo({ url: '/pages/user/wallet/index' })
          break
        case 'booster':
          Taro.navigateTo({ url: '/pages/user/booster-apply/index' })
          break
        case 'settings':
          Taro.navigateTo({ url: '/pages/user/settings/index' })
          break
        default:
          Taro.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  }

  // 统计项点击
  const handleStatsClick = (key: string) => {
    requireAuth(() => {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    })
  }

  // 用户信息更新回调
  const handleUserInfoUpdate = (newUserInfo: any) => {
    setUserInfo(newUserInfo)
    // 同步更新本地存储
    saveUserInfo(newUserInfo)
  }

  return (
    <View className='profile-page'>
      {/* 顶部背景 */}
      <View className='profile-page__bg' />

      {/* 用户信息 */}
      <View className='profile-page__user' style={{ paddingTop: `${statusBarHeight + 30}px` }}>
        <UserCard
          key={`user-card-${renderKey}`}
          isLoggedIn={loggedIn}
          userInfo={userInfo}
          onLogin={goToLogin}
          onSettings={() => handleServiceClick('settings')}
          onUserInfoUpdate={handleUserInfoUpdate}
        />
        <StatsCard items={STATS_ITEMS} onClick={handleStatsClick} />
      </View>

      {/* 我的订单 */}
      <SectionCard title='我的订单' moreText='全部订单' onMore={() => handleOrderClick('')}>
        <OrderTabs tabs={ORDER_TABS} onClick={handleOrderClick} />
      </SectionCard>

      {/* 我的服务 */}
      <SectionCard title='我的服务'>
        <ServiceGrid items={SERVICE_ITEMS} onClick={handleServiceClick} />
      </SectionCard>

      <View className='profile-page__bottom' />
      <TabBar />
    </View>
  )
}
