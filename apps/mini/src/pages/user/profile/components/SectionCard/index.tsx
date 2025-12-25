/**
 * 区块卡片组件
 */
import { View, Text } from '@tarojs/components'
import { ReactNode } from 'react'
import './index.scss'

interface SectionCardProps {
  title: string
  moreText?: string
  onMore?: () => void
  children: ReactNode
}

export default function SectionCard({ title, moreText, onMore, children }: SectionCardProps) {
  return (
    <View className='section-card'>
      <View className='section-card__header'>
        <Text className='title'>{title}</Text>
        {moreText && (
          <View className='more' onClick={onMore}>
            <Text>{moreText}</Text>
            <Text className='arrow'>›</Text>
          </View>
        )}
      </View>
      <View className='section-card__body'>{children}</View>
    </View>
  )
}

