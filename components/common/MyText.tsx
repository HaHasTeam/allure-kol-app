import React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'

const MyText = ({
  weight = 'Main-Font-Regular',
  text,
  styleProps,
  ellipsizeMode,
  numberOfLines,
  ...props
}: {
  weight?: string
  text: string
  styleProps?: StyleProp<TextStyle>
  [key: string]: any
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip' | undefined
  numberOfLines?: number | undefined
}) => {
  return (
    <Text
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      style={[{ fontFamily: weight }, styleProps]}
      {...props}
    >
      {text}
    </Text>
  )
}

export default MyText
