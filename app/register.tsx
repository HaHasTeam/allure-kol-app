import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, TextField, View } from "react-native-ui-lib";

import MyLink from "@/components/common/MyLink";
import MyText from "@/components/common/MyText";

import { IRegisterFormPayload } from "@/types/auth";
import { errorMessage } from "../constants/index";

import useAuth from "@/hooks/api/useAuth";
import {
  height,
  myDeviceHeight,
  myDeviceWidth,
  myFontWeight,
  myTextColor,
  myTheme,
  width,
} from "../constants/index";
import { formRegisterSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/contexts/AuthContext";
import { z } from "zod";
import { useToast } from "@/contexts/ToastContext";

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useAuth();
  const { mappedRoles } = useSession();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowPasswordConfirmation, setIsShowPasswordConfirmation] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof formRegisterSchema>>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const showErrorAlert = (message: string) => {
    Alert.alert("Error", message, [{ text: "OK" }], { cancelable: false });
  };
  const onSubmit = async (data: IRegisterFormPayload) => {
    setIsLoading(true);
    const result = await register({
      email: data.email,
      password: data.password,
      username: data.username,
      role: mappedRoles.CUSTOMER.id,
    });

    if (typeof result === "string") {
      setError("root", {
        type: "manual",
        message: result,
      });
    } else {
      // Show success toast notification
      showToast("Registration successful! Please login.", "success", 4000);

      // Navigate to login page after a short delay to ensure toast is visible
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (errors.root?.message) {
      showErrorAlert(errors.root.message);
    }
  }, [errors.root?.message]);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView
          style={{
            paddingHorizontal: 20,
            backgroundColor: "#FFF",
          }}
        >
          <MyText
            text="Điền thông tin phía dưới để tham gia trải nghiệm các sản phẩm tuyệt vời của chúng tôi."
            styleProps={{
              fontSize: width < myDeviceWidth.sm ? 14 : 16,
              textAlign: "left",
              marginVertical: 24,
            }}
          />
          <View style={{ position: "relative", marginVertical: 12 }}>
            <MyText
              text="Họ và tên"
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
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  inputMode="text"
                  leadingAccessory={
                    <Feather
                      style={{
                        position: "absolute",
                        top: height < myDeviceHeight.sm ? 36 : 43,
                        left: 15,
                      }}
                      name="user"
                      size={24}
                      color={myTheme.primary}
                    />
                  }
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Họ và tên"
                  placeholderTextColor="grey"
                  fieldStyle={{
                    paddingVertical: 20,
                  }}
                  style={{
                    borderStyle: "solid",
                    borderColor: errors.username ? "red" : myTheme.primary,
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
            {errors.username && (
              <MyText
                text={errors.username?.message || ""}
                styleProps={{ color: "red" }}
              />
            )}
          </View>
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
                  inputMode="email"
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
                    borderColor:
                      errors.email ||
                      errors.root?.message === errorMessage.ERM019
                        ? "red"
                        : myTheme.primary,
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
          <View style={{ position: "relative", marginVertical: 12 }}>
            <MyText
              text="Xác nhận mật khẩu"
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
              name="passwordConfirmation"
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
                  trailingAccessory={
                    <TouchableOpacity
                      onPress={() =>
                        setIsShowPasswordConfirmation(
                          !isShowPasswordConfirmation
                        )
                      }
                      style={{
                        padding: 10,
                        position: "absolute",
                        top: height < myDeviceHeight.sm ? 26 : 33,
                        right: 10,
                      }}
                    >
                      <Feather
                        name={isShowPasswordConfirmation ? "eye" : "eye-off"}
                        size={24}
                        color="lightgray"
                      />
                    </TouchableOpacity>
                  }
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="grey"
                  multiline={false}
                  secureTextEntry={!isShowPasswordConfirmation}
                  fieldStyle={{
                    paddingVertical: 20,
                  }}
                  style={{
                    borderStyle: "solid",
                    borderColor: errors.passwordConfirmation
                      ? "red"
                      : myTheme.primary,
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
            {errors.passwordConfirmation && (
              <MyText
                text={errors.passwordConfirmation?.message || ""}
                styleProps={{ color: "red" }}
              />
            )}
          </View>
          <View style={{ marginTop: 12, gap: 24 }}>
            <Button
              disabled={isLoading}
              backgroundColor={myTheme.primary}
              onPress={handleSubmit(onSubmit)}
              label="Đăng kí"
              size="large"
              style={{
                minWidth: "95%",
                height: 48,
                justifyContent: "center",
                marginBottom: -40,
              }}
              labelStyle={{
                fontFamily: myFontWeight.bold,
                fontSize: 16,
              }}
            />
            {errors.root && (
              <MyText
                text={errors.root?.message || ""}
                styleProps={{
                  color: "red",
                  textAlign: "center",
                  marginTop: 36,
                }}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 2.5,
                marginBottom: 40,
                marginTop: errors.root ? undefined : 40,
              }}
            >
              <MyText
                styleProps={{ fontSize: 16, color: myTextColor.caption }}
                text="Đã có tài khoản?"
              />
              <MyLink
                weight={myFontWeight.medium}
                styleProps={{ color: myTextColor.primary, fontSize: 16 }}
                text="Đăng nhập"
                href="/login"
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
