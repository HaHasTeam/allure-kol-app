export type TServerResponseSuccess<T, TItems = undefined> = {
  data: T & (TItems extends undefined ? object : { items: TItems });
  error: null;
  message: string;
};

export type TServerResponseError = {
  data: null;
  error: string;
  message: string;
};

export type TServerResponse<T> =
  | TServerResponseSuccess<T>
  | TServerResponseError;

export type TMetaData = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type TServerError<TErrorResponse = unknown> = {
  message: string;
  errors?: {
    [key in keyof TErrorResponse]: string;
  };
};
export class ResponseError<TErrorResponse = unknown> extends Error {
  errors?: { [key in keyof TErrorResponse]: string };
  constructor(public response: TServerError<TErrorResponse>) {
    super(response.message);
    this.errors = response.errors;
  }
}
