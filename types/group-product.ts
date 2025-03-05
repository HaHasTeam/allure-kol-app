import { TProduct } from './product'
import { TMetaData } from './request'
import { TVoucher } from './voucher'

export type TGroupProduct = TMetaData & {
  name: string
  description?: string
  maxBuyAmountEachPerson?: number
  criterias: GroupBuyingCriteria[]
  status: GroupProductStatusEnum
  products: TProduct[]
  startTime?: string
  endTime?: string
}

export enum GroupProductStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  DENIED = 'DENIED'
}

export type GroupBuyingCriteria = TMetaData & {
  threshold: number
  voucher: TVoucher
}
