export enum UserRoleEnum {
  CUSTOMER = "CUSTOMER",
  MANAGER = "MANAGER",
  CONSULTANT = "CONSULTANT",
  STAFF = "STAFF",
  KOL = "KOL",
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
}

export enum RoleStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}
export type TRoleResponse = {
  id: string;
  role: UserRoleEnum;
  status: RoleStatusEnum;
};
export type GetRoleByEnumResponse = {
  [key: string]: TRoleResponse;
};
