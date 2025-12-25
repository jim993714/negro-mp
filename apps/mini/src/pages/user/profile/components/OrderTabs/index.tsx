/**
 * 订单快捷入口组件
 */
import { View, Text } from '@tarojs/components'
import { Icon } from '@/components'
import type { IconName } from '@/components'
import './index.scss'

interface OrderTab {
  icon: IconName
  text: string
  status: string
  color?: string
}

interface OrderTabsProps {
  tabs: OrderTab[]
  onClick: (status: string) => void
}

export default function OrderTabs({ tabs, onClick }: OrderTabsProps) {
  return (
    <View className='order-tabs'>
      {tabs.map((tab) => (
        <View key={tab.status} className='order-tabs__item' onClick={() => onClick(tab.status)}>
          <View className='order-tabs__icon'>
            <Icon name={tab.icon} size={28} color={tab.color || '#667eea'} />
          </View>
          <Text className='text'>{tab.text}</Text>
        </View>
      ))}
    </View>
  )
}

