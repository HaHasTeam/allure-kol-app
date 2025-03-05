import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);
export const formRegisterSchema = z
  .object({
    username: z
      .string()

      .min(1, "Tên người dùng phải có ít nhất 1 ký tự")
      .max(50, "Tên người dùng không được vượt quá 50 ký tự"),

    email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(20, "Mật khẩu không được vượt quá 20 ký tự"),
    passwordConfirmation: z
      .string()
      .min(8, "Xác nhận mật khẩu phải có ít nhất 8 ký tự")
      .max(20, "Xác nhận mật khẩu không được vượt quá 20 ký tự"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Mật khẩu không khớp",
    path: ["passwordConfirmation"],
  });
