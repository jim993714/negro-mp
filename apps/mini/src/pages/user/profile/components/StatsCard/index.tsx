/**
 * 统计数据卡片组件
 */
import { View, Text } from '@tarojs/components'
import './index.scss'

interface StatItem {
  label: string
  value: number | string
  key: string
}

interface StatsCardProps {
  items: StatItem[]
  onClick: (key: string) => void
}

export default function StatsCard({ items, onClick }: StatsCardProps) {
  return (
    <View className='stats-card'>
      {items.map((item) => (
        <View key={item.key} className='stats-card__item' onClick={() => onClick(item.key)}>
          <Text className='value'>{item.value}</Text>
          <Text className='label'>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

