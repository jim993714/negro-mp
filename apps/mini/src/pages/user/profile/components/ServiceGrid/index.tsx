/**
 * 服务功能网格组件
 */
import { View, Text } from '@tarojs/components'
import { Icon } from '@/components'
import type { IconName } from '@/components'
import './index.scss'

interface ServiceItem {
  icon: IconName
  text: string
  key: string
  color?: string
}

interface ServiceGridProps {
  items: ServiceItem[][]
  onClick: (key: string) => void
}

export default function ServiceGrid({ items, onClick }: ServiceGridProps) {
  return (
    <View className='service-grid'>
      {items.map((row, index) => (
        <View key={index} className='service-grid__row'>
          {row.map((item) => (
            <View key={item.key} className='service-grid__item' onClick={() => onClick(item.key)}>
              <View className='service-grid__icon'>
                <Icon name={item.icon} size={28} color={item.color || '#667eea'} />
              </View>
              <Text className='text'>{item.text}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

