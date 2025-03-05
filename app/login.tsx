import { Feather } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, TextField, View } from "react-native-ui-lib";

import MyLink from "@/components/common/MyLink";
import MyText from "@/components/common/MyText";
import { useSession } from "@/hooks/useSession";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  height,
  myDeviceHeight,
  myDeviceWidth,
  myFontWeight,
  myTextColor,
  myTheme,
  width,
} from "@/constants";
import { log } from "@/utils/logger";
export interface ILoginPayload {
  email: string;
  password: string;
}
export const formSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
});
const LoginScreen = () => {
  const { login } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ILoginPayload>({
    resolver: zodResolver(formSignInSchema),
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ILoginPayload) => {
    log.debug("data", data);
    setIsLoading(true);
    const result = await login(data.email, data.password);
    console.log("result", result);

    if (typeof result === "string") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
      router.replace("/");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          style={{
            flexDirection: "column",
            paddingHorizontal: 15,
            backgroundColor: "#FFF",
          }}
        >
          <MyText
            text="Xin chào, mừng bạn quay trở lại!"
            styleProps={{
              fontSize: width < myDeviceWidth.sm ? 14 : 16,
              textAlign: "left",
              marginVertical: 24,
            }}
          />
          <View style={{ position: "relative", marginVertical: 12 }}>
            <MyText
              text="Email"
              styleProps={{
                position: "absolute",
                top: -10,
                left: 1,
                fontSize: 16,
                textAlign: "left",
              }}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  leadingAccessory={
                    <Feather
                      style={{
                        position: "absolute",
                        top: height < myDeviceHeight.sm ? 36 : 43,
                        left: 15,
                      }}
                      name="mail"
                      size={24}
                      color={myTheme.primary}
                    />
                  }
                  inputMode="email"
                  maxLength={50}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Email"
                  placeholderTextColor="grey"
                  fieldStyle={{
                    paddingVertical: 20,
                  }}
                  style={{
                    borderStyle: "solid",
                    borderColor: errors.email ? "red" : myTheme.primary,
                    borderWidth: 1,
                    borderRadius: 7,
                    height: height < myDeviceHeight.sm ? 60 : 70,
                    paddingLeft: 55,
                    paddingRight: 15,
                    fontSize: 16,
                    overflow: "hidden",
                    fontFamily: myFontWeight.regular,
                  }}
                />
              )}
            />
            {errors.email && (
              <MyText
                text={errors.email.message || ""}
                styleProps={{ color: "red" }}
              />
            )}
          </View>
          <View style={{ position: "relative", marginVertical: 12 }}>
            <MyText
              text="Mật khẩu"
              styleProps={{
                position: "absolute",
                top: -10,
                left: 1,
                fontSize: 16,
                textAlign: "left",
              }}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  leadingAccessory={
                    <Feather
                      style={{
                        position: "absolute",
                        top: height < myDeviceHeight.sm ? 36 : 43,
                        left: 15,
                      }}
                      name="lock"
                      size={24}
                      color={myTheme.primary}
                    />
                  }
                  maxLength={50}
                  trailingAccessory={
                    <TouchableOpacity
                      onPress={() => setIsShowPassword(!isShowPassword)}
                      style={{
                        padding: 10,
                        position: "absolute",
                        top: height < myDeviceHeight.sm ? 26 : 33,
                        right: 10,
                      }}
                    >
                      <Feather
                        name={isShowPassword ? "eye" : "eye-off"}
                        size={24}
                        color="lightgray"
                      />
                    </TouchableOpacity>
                  }
                  placeholder="Mật khẩu"
                  placeholderTextColor="grey"
                  multiline={false}
                  secureTextEntry={!isShowPassword}
                  fieldStyle={{
                    paddingVertical: 20,
                  }}
                  style={{
                    borderStyle: "solid",
                    borderColor: errors.password ? "red" : myTheme.primary,
                    borderWidth: 1,
                    borderRadius: 7,
                    height: height < myDeviceHeight.sm ? 60 : 70,
                    paddingLeft: 55,
                    paddingRight: 50,
                    fontSize: 16,
                    overflow: "hidden",
                    fontFamily: myFontWeight.regular,
                  }}
                />
              )}
            />
            {errors.password && (
              <MyText
                text={errors.password.message || ""}
                styleProps={{ color: "red" }}
              />
            )}
          </View>
          <View style={{ marginTop: 12, gap: 24 }}>
            <Button
              onPress={handleSubmit(onSubmit)}
              label="Đăng nhập"
              size="large"
              disabled={isLoading}
              backgroundColor={myTheme.primary}
              style={{
                minWidth: "95%",
                height: 48,
                justifyContent: "center",
              }}
              labelStyle={{
                fontFamily: myFontWeight.bold,
                fontSize: 16,
              }}
            />
            {errors.root && (
              <MyText
                text={errors.root.message || ""}
                styleProps={{ color: "red", textAlign: "center" }}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 2.5,
              }}
            >
              <MyText styleProps={{ fontSize: 16 }} text="Chưa có tài khoản?" />
              <MyLink
                weight={myFontWeight.medium}
                styleProps={{
                  color: myTextColor.primary,
                  fontSize: 16,
                  marginBottom: 40,
                }}
                text="Đăng kí"
                href="/register"
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
