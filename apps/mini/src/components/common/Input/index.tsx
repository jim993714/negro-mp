/**
 * 通用输入框组件
 */
import { View, Text, Input as TaroInput } from '@tarojs/components'
import { ReactNode } from 'react'
import './index.scss'

interface InputProps {
  value: string
  placeholder?: string
  type?: 'text' | 'number' | 'password'
  maxlength?: number
  disabled?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  clearable?: boolean
  onChange: (value: string) => void
  onClear?: () => void
}

export default function Input({
  value,
  placeholder = '请输入',
  type = 'text',
  maxlength = 140,
  disabled = false,
  prefix,
  suffix,
  clearable = false,
  onChange,
  onClear,
}: InputProps) {
  const handleInput = (e: any) => {
    onChange(e.detail.value)
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <View className={`custom-input ${disabled ? 'custom-input--disabled' : ''}`}>
      {prefix && <View className='custom-input__prefix'>{prefix}</View>}
      
      <TaroInput
        className='custom-input__inner'
        type={type}
        value={value}
        placeholder={placeholder}
        placeholderClass='custom-input__placeholder'
        maxlength={maxlength}
        disabled={disabled}
        onInput={handleInput}
      />
      
      {clearable && value && !disabled && (
        <View className='custom-input__clear' onClick={handleClear}>
          <Text>✕</Text>
        </View>
      )}
      
      {suffix && <View className='custom-input__suffix'>{suffix}</View>}
    </View>
  )
}

