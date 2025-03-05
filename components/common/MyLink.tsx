import { Href, Link } from 'expo-router'
import React from 'react'
import { StyleProp, TextStyle } from 'react-native'

const MyLink = ({
  weight = 'Main-Font-Regular',
  text,
  styleProps,
  href,
  ...props
}: {
  weight?: string
  text: string
  href: Href
  styleProps?: StyleProp<TextStyle>
  [key: string]: any
}) => {
  return (
    <Link href={href} style={[{ fontFamily: weight }, styleProps]} {...props}>
      {text}
    </Link>
  )
}

export default MyLink
