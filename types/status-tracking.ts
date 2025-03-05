import { IOrder } from './order'
import { TUserUpdateStatusTracking } from './user'

export interface IStatusTracking {
  id: string
  createdAt: string
  updatedAt: string
  reason: string | null
  status: string
  updatedBy: TUserUpdateStatusTracking
  order: IOrder
}
