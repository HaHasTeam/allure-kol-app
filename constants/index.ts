import { Dimensions } from "react-native";

export const myFontWeight = {
  bold: "Main-Font-Bold",
  boldItalic: "Main-Font-BoldItalic",
  extraBold: "Main-Font-ExtraBold",
  extraBoldItalic: "Main-Font-ExtraBoldItalic",
  italic: "Main-Font-Italic",
  medium: "Main-Font-Medium",
  mediumItalic: "Main-Font-MediumItalic",
  regular: "Main-Font-Regular",
  semiBold: "Main-Font-SemiBold",
  semiBoldItalic: "Main-Font-SemiBoldItalic",
};

export const myTextColor = {
  primary: "#f16f90",
  caption: "#697B7A",
};

export const myTheme = {
  primary: "#f16f90",
  lighter: "#D5F3F0",
  lightGrey: "#f6faf9",
  lightPrimary: "#e5f7f7",
  grey: "#697B7A",
  yellow: "#ff9f25",
  green: "#22c022",
  red: "#f76868",
  textColor: "#0f172a",
  textColorLight: "#697B7A",
  borderColor: "#e5f7f7",
  backgroundColor: "#f6faf9",
};

export const myDeviceHeight = {
  sm: 667.5,
  md: 914.5,
};

export const myDeviceWidth = {
  sm: 375.5,
  md: 411.5,
};

export enum WEEKDAY {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

export enum SLOT_NUMBER {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

export const height = Dimensions.get("screen").height;
export const width = Dimensions.get("screen").width;
export const errorMessage = {
  ERM033: "Hệ thống của chúng tôi đang gặp sự cố. Vui lòng thử lại sau.",
  ERM003: "Email hoặc mật khẩu không chính xác.",
  ERM002: "<> là bắt buộc.",
  ERM009: "<> không được vượt quá <> kí tự.",
  ERM018: "Vui lòng nhập địa chỉ email hợp lệ.",
  ERM019: "Email này đã được sử dụng. Vui lòng sử dụng email khác.",
  ERM020: "<> phải có ít nhất <> kí tự.",
  ERM021:
    "Mật khẩu phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.",
  ERM023: "Số điện thoại phải có 10 ký tự và bắt đầu bằng số 0.",
  ERM025: "Đã xảy ra lỗi khi <>. Vui lòng thử lại sau.",
  ERM029: "Tài khoản chưa được xác thực. Vui lòng xác thực và thử lại.",
  ERM030: "Mật khẩu không khớp.",
  ERM034: "<> không thành công. Vui lòng thử lại.",
};

export const successMessage = {
  SSM032: "<> thành công",
  SSM033: "Đơn hàng của bạn đã được thanh toán",
};
