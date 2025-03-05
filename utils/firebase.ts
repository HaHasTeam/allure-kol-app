import { getAuth } from '@react-native-firebase/auth'
import { getFirestore } from '@react-native-firebase/firestore'
import { getMessaging } from '@react-native-firebase/messaging'

export const firebaseAuth = getAuth()
export const firebaseFirestore = getFirestore()
export const firebaseCloudMessaging = getMessaging()
