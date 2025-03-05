import { IClassification } from './classification'
import { DiscountTypeEnum, ProductDiscountEnum } from './enum'
import { IProduct } from './product'
import { TMetaData } from './request'

export type DiscountType = DiscountTypeEnum.PERCENTAGE | DiscountTypeEnum.AMOUNT

export type IProductDiscount = TMetaData & {
  startTime: string
  endTime: string
  discount: number
  discountType: DiscountType
  status: ProductDiscountEnum
  product: IProduct
  productClassifications?: IClassification[]
}
