import { IResultSheetSectionFormData } from '@/schemas/result-sheet.schema'

import { StatusEnum } from './enum'
import { TMetaData } from './request'
import { IResponseSystemService } from './system-service'

export type IUpdateResultSheetSection = IResultSheetSectionFormData & {
  id?: string
  status: StatusEnum
}
export type IResponseResultSheetSection = IResultSheetSectionFormData &
  TMetaData & {
    status: StatusEnum
  }

export type IUpdateResultSheetData = {
  id: string
  title: string
  resultSheetSections: IUpdateResultSheetSection[]
}

export type IResponseResultSheetData = {
  id: string
  title: string
  resultSheetSections: IResponseResultSheetSection[]
  status: StatusEnum
  systemServices: IResponseSystemService[]
}
