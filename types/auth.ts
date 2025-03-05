export type TAuth = {
  accessToken: string;
  refreshToken: string;
};

export interface IRegisterPayload {
  email: string;
  username: string;
  role: string;
  password: string;
}
export type TEmailDecoded = {
  accountId: string;
};
export interface IResendOtpPayload {
  email: string;
}
export interface IRegisterFormPayload extends Omit<IRegisterPayload, "role"> {
  passwordConfirmation: string;
}
export type TInviteSignupDecoded = {
  email: string;
  brand: string;
  role: string;
};

export interface IToken {
  role: string;
  iat: number;
  exp: number;
  name: string;
  sub: string;
}
