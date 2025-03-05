import { WeekDay } from './enum'
import { TMetaData } from './request'

export type TSlot = TMetaData & {
  weekDay: WeekDay
  startTime: string
  endTime: string
}
