import { AddressEnum } from './enum'

export interface IAddress {
  id?: string
  createdAt?: string
  updatedAt?: string
  fullName: string
  phone: string
  detailAddress: string
  ward?: string
  district?: string
  province?: string
  fullAddress?: string
  type?: AddressEnum.HOME | AddressEnum.OFFICE | AddressEnum.OTHER
  status?: string
  isDefault?: boolean
  notes?: string
}

export interface IProvince {
  code: string
  name: string
}
export interface IProvinceDetail {
  code: string
  name: string
  province_code: string
  districts: IDistrict[]
}
export interface IDistrict {
  code: string
  name: string
  province_code: string
}

export interface IDistrictDetail {
  code: string
  name: string
  district_code: string
  wards: IWard[]
}

export interface IWard {
  code: string
  name: string
  district_code: string
}
