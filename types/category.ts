import { TMetaData } from './request'

type BaseCategoryField = {
  label: string
  required: boolean
}

type Option = {
  label: string
  value: string
}

export enum CategoryTypeEnum {
  input = 'input',
  singleChoice = 'singleChoice',
  multipleChoice = 'multipleChoice',
  date = 'date'
}

export const categoryTypeOptions = Object.keys(CategoryTypeEnum).map((key) => ({
  label: key.toUpperCase(),
  value: CategoryTypeEnum[key as keyof typeof CategoryTypeEnum]
}))

export enum InputTypeEnum {
  text = 'text',
  number = 'number'
}

export const inputTypeOptions = Object.keys(InputTypeEnum).map((key) => ({
  label: key.toUpperCase(),
  value: InputTypeEnum[key as keyof typeof InputTypeEnum]
}))

export type CategoryType = BaseCategoryField &
  (
    | {
        type: CategoryTypeEnum.input
        inputType: InputTypeEnum
      }
    | {
        type: CategoryTypeEnum.singleChoice | CategoryTypeEnum.multipleChoice
        options: Option[]
      }
    | {
        type: CategoryTypeEnum.date
      }
  )

export type ICategoryDetail = Record<string, CategoryType>

export interface ICategory extends TMetaData {
  level: number
  name: string
  detail?: ICategoryDetail
  parentCategory?: ICategory | null
  subCategories?: ICategory[]
}
