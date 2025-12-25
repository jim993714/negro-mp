/**
 * 自定义 TabBar 组件
 */
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Icon, IconName } from '@/components'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  icon: IconName
  selectedIcon: IconName
}

const tabList: TabItem[] = [
  {
    pagePath: '/pages/home/index',
    text: '首页',
    icon: 'shouye',
    selectedIcon: 'shouye-xuanzhong',
  },
  {
    pagePath: '/pages/game/list/index',
    text: '游戏',
    icon: 'qizhi1',
    selectedIcon: 'qizhi',
  },
  {
    pagePath: '/pages/order/list/index',
    text: '订单',
    icon: 'liebiao1',
    selectedIcon: 'liebiao',
  },
  {
    pagePath: '/pages/user/profile/index',
    text: '我的',
    icon: 'wode',
    selectedIcon: 'wode-xuanzhong',
  },
]

// 获取当前页面对应的 tab index
function getCurrentTabIndex(): number {
  const currentPages = Taro.getCurrentPages()
  if (currentPages.length > 0) {
    const currentPage = currentPages[currentPages.length - 1]
    const currentPath = '/' + currentPage.route
    const index = tabList.findIndex(item => item.pagePath === currentPath)
    return index !== -1 ? index : 0
  }
  return 0
}

export default function TabBar() {
  const [selected, setSelected] = useState(() => getCurrentTabIndex())

  // 每次页面显示时更新选中状态
  useDidShow(() => {
    const index = getCurrentTabIndex()
    setSelected(index)
  })

  const handleTabClick = (index: number) => {
    if (index === selected) return
    
    const tab = tabList[index]
    
    Taro.switchTab({
      url: tab.pagePath,
    })
  }

  return (
    <View className='custom-tab-bar'>
      {tabList.map((tab, index) => {
        const isSelected = selected === index
        return (
          <View
            key={tab.pagePath}
            className={`tab-item ${isSelected ? 'tab-item--active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <View className='tab-item__icon'>
              <Icon
                name={isSelected ? tab.selectedIcon : tab.icon}
                size={24}
                color={isSelected ? '#667eea' : '#8a8a8a'}
              />
            </View>
            <Text className={`tab-item__text ${isSelected ? 'tab-item__text--active' : ''}`}>
              {tab.text}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
