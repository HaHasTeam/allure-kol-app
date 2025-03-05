import { TBrand } from './brand'
import { TClassification } from './classification'
import { TFile } from './file'
import { TProduct } from './product'
import { TMetaData } from './request'

export type TFlashSale = TMetaData & {
  startTime: string
  endTime: string
  discount: number
  product: TProduct
  brand: TBrand
  images: TFile[]
  productClassifications: Partial<TClassification>[]
  status: FlashSaleStatusEnum
}

export enum FlashSaleStatusEnum {
  SOLD_OUT = 'SOLD_OUT',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
