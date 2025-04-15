import { ClassificationTypeEnum, StatusEnum } from "./enum";
import { TFile } from "./file";
import { IImage } from "./image";
import { IPreOrder } from "./pre-order";
import { IProduct, ProductClassificationTypeEnum } from "./product";
import { IProductDiscount } from "./product-discount";
import { TMetaData } from "./request";

export type TClassification = TMetaData & {
  title: string;
  price: number;
  quantity: number;
  images: TFile[];
  sku: string;
  type: ProductClassificationTypeEnum;
  status: ClassificationStatusEnum;
};

export enum ClassificationStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}
export interface IClassificationSelection {
  color: string | null;
  size: string | null;
  other: string | null;
}

export type IClassificationKey = keyof IClassificationSelection;

export type IClassification = IClassificationSelection & {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  price: number;
  quantity: number;
  sku: string;
  type: ClassificationTypeEnum;
  status?: StatusEnum.ACTIVE | StatusEnum.INACTIVE;
  images: IImage[];
  product: IProduct;
  preOrderProduct?: IPreOrder | null;
  productDiscount?: IProductDiscount | null;
};
