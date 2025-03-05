import { BookingStatusEnum, BookingTypeEnum, PaymentMethod } from './enum'
import { TMetaData } from './request'

export type TBooking = TMetaData & {
  voucherDiscount: number
  totalPrice: number
  startTime: string
  endTime: string
  paymentMethod: PaymentMethod
  notes: string
  meetUrl: string
  record: string
  type: BookingTypeEnum
  status: BookingStatusEnum
}

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: TBooking
}
