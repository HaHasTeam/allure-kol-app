import { IBrand } from './brand'
import { ICategory } from './category'
import { IClassification } from './classification'
import { IPreOrder } from './pre-order'
import { IProductDiscount } from './product-discount'
import { IImage } from './productImage'
import { TMetaData } from './request'

// common starts
export type TProduct = TMetaData & {
  name: string
  brand?: IBrand
  category?: ICategory
  images: IImage[]
  description: string
  status?: string
  detail?: string
  productClassifications?: IServerProductClassification[]
  price?: number
  quantity?: number
  sku?: string
  menu?: string
}

export type IProductDetail = {
  organizationName?: string[]
  organizationAddress?: string[]
  ingredients?: string
  expiryPeriod?: string[]
  volume?: string[]
  batchNumber?: string
  expiryDate?: string
  origin?: string[]
  weight?: string[]
  packagingType?: string[]
  formula?: string[]
  activeIngredients?: string[]
  skinType?: string[]
  productType?: string[]
  skinCare?: string[]
  specialFeatures?: string[]
  versionType?: string[]
  quantityPerPack?: string[]
  storageCondition?: string[]
}

export type IProductClassification = {
  id?: string
  title?: string
  price?: number
  quantity?: number
  images?: File[]
  status?: string
  type?: string
  sku?: string
  color?: string
  size?: string
  other?: string
}
export type IServerProductClassification = {
  id?: string
  title?: string
  price?: number
  quantity?: number
  images: IImage[]
  status?: string
  type?: string
  sku?: string
  color?: string
  size?: string
  other?: string
}

export type ICreateProduct = {
  id?: string
  name: string
  brand?: string
  category?: string
  images: File[]
  description: string
  status: string
  detail?: IProductDetail
  productClassifications?: IProductClassification[]
  price?: number
  quantity?: number
  sku?: string
  certificate: File[]
}
export type IServerCreateProduct = {
  id?: string
  name?: string
  brand?: string
  category?: string
  images?: IImage[]
  description?: string
  status?: string
  detail?: string
  productClassifications?: IServerProductClassification[]
  price?: number
  quantity?: number
  sku?: string
  certificate?: string
}
export type IResponseProduct = {
  id?: string
  name: string
  brand?: IBrand
  category?: ICategory
  images: IImage[]
  description: string
  status?: string
  detail?: string
  productClassifications: IServerProductClassification[]
  price?: number
  quantity?: number
  sku?: string
  menu?: string
  updatedAt?: string
  createdAt: string
  certificate: string
}

export type IProductTable = {
  checked?: string
  id?: string
  name: string
  price?: number
  quantity?: number
  status?: string
  updatedAt?: string
  description: string
  productClassifications: IServerProductClassification[]
  certificate: string

  detail?: string
  brand?: IBrand
  category?: ICategory
  menu?: string
  title?: string
  images: IImage[]
  type?: string
  sku?: string
  createdAt: string
}

export type IProduct = {
  id: string
  name: string
  tag?: string
  price: number
  currentPrice?: number
  images: IImage[]
  deal?: number
  flashSale?: {
    productAmount: number
    soldAmount?: number
  }
  rating: number
  ratingAmount: number
  soldInPastMonth: number
  description: string
  classifications: IClassification[]
  createdAt?: string
  updatedAt?: string
  detail: string
  sku?: string
  status?: string
  brand?: IBrand
  productClassifications?: IClassification[] // use for cart
  productDiscounts?: IProductDiscount[] | null // use for cart
  preOrderProducts?: IPreOrder[] | null // use for cart
  category?: ICategory // use for product details
}

// common ends

// components interface starts
export interface ProductTableProps {
  tableData: TProduct[]
}

// components interface ends

// enum starts
export enum ProductEnum {
  PRE_ORDER = 'PRE_ORDER',
  FLASH_SALE = 'FLASH_SALE',
  OFFICIAL = 'OFFICIAL',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INACTIVE = 'INACTIVE'
}
export enum ProductClassificationTypeEnum {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM'
}
export enum ProductStatusEnum {
  FLASH_SALE = 'FLASH_SALE',
  OFFICIAL = 'OFFICIAL',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  PENDING = 'PENDING'
}
// enum ends
