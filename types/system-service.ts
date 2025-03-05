import { ISystemServiceFormData } from '@/schemas/system-service.schema'

import { ICategory } from './category'
import { ServiceTypeEnum, StatusEnum } from './enum'
import { IImage } from './image'
import { TMetaData } from './request'
import { IResponseResultSheetData, IUpdateResultSheetData } from './result-sheet'

export type IUpdateSystemServiceFormData = ISystemServiceFormData & {
  id: string
  resultSheetData: IUpdateResultSheetData
}

export type ISystemService = {
  name: string
  description: string
  type: ServiceTypeEnum
  status: StatusEnum
  resultSheet: IResponseResultSheetData
  images: IImage[]
  category: ICategory
}

export type ICreateSystemService =
  | ISystemServiceFormData
  | {
      images: IImage[]
    }

export type IResponseSystemService = TMetaData & ISystemService
