import { IClassification } from './classification'
import { OrderEnum, PaymentMethod, ShippingStatusEnum } from './enum'
import { TUser } from './user'
import { TVoucher } from './voucher'

// Order detail interface
export interface IOrderDetail {
  id: string
  createdAt: string
  updatedAt: string
  unitPriceBeforeDiscount: number
  unitPriceAfterDiscount: number
  subTotal: number
  totalPrice: number
  quantity: number
  productName: string
  classificationName: string
  type: OrderEnum
  isFeedback: boolean
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  productClassification: IClassification
  productClassificationPreOrder: null | IClassification
}

// Order item interface
export interface IOrderItem {
  id: string
  createdAt: string
  updatedAt: string
  subTotal: number
  totalPrice: number
  shippingAddress: string
  phone: string
  recipientName: string
  paymentMethod: PaymentMethod
  notes: string
  message: string | null
  type: OrderEnum
  status: ShippingStatusEnum
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  orderDetails: IOrderDetail[]
  voucher: TVoucher | null
}

// Main order interface
export interface IOrder {
  id: string
  createdAt: string
  updatedAt: string
  subTotal: number
  totalPrice: number
  shippingAddress: string
  phone: string
  recipientName: string
  paymentMethod: PaymentMethod
  notes: string
  message: string | null
  type: OrderEnum
  status: ShippingStatusEnum
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  account: TUser
  children: IOrderItem[]
}

// Other interfaces (kept as they were, assuming they're still needed)
export interface IOrderFilter {
  search?: string
  status?: string
}

export interface IOrderCheckoutItem {
  productClassificationId: string
  quantity?: number
}

export interface ICreateOrderItem {
  shopVoucherId?: string
  items: IOrderCheckoutItem[]
  message?: string
}

export interface ICreateOrder {
  orders: ICreateOrderItem[]
  addressId: string
  paymentMethod: string
  platformVoucherId?: string
}

export interface ICreatePreOrder {
  productClassificationId: string
  quantity: number
  addressId: string
  paymentMethod: string
  notes: string
}

export interface ICancelOrder {
  orderId: string
  reason: string
}

export interface ICancelRequestOrder {
  id: string
  createdAt: string
  updatedAt: string
  reason: string
  status: string
  order: IOrder
}
