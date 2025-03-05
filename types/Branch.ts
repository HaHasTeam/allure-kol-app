import { StatusEnum } from './enum'

export type IBranch = {
  id?: string
  name: string
  logo?: string
  document: string
  description?: string
  email: string
  phone?: string
  address?: string
  province?: string
  district?: string
  ward?: string
  businessTaxCode?: string
  businessRegistrationCode?: string
  establishmentDate?: string | Date
  businessRegistrationAddress?: string
  status?: StatusEnum
}
