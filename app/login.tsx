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
  ImageBackground,
  StyleSheet,
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
    <ImageBackground
      source={require("@/assets/images/banner-welcome.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={100}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ScrollView style={styles.scrollView}>
              <View style={styles.headerContainer}>
                <MyText text="Allure KOL" styleProps={styles.logoText} />
                <MyText
                  text="Đăng nhập để bắt đầu phiên livestream của bạn"
                  styleProps={styles.welcomeText}
                />
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <MyText text="Email" styleProps={styles.labelText} />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        leadingAccessory={
                          <Feather
                            style={styles.inputIcon}
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
                        placeholder="Nhập email của bạn"
                        placeholderTextColor="grey"
                        fieldStyle={styles.fieldStyle}
                        style={[
                          styles.inputField,
                          {
                            borderColor: errors.email ? "red" : myTheme.primary,
                          },
                        ]}
                      />
                    )}
                  />
                  {errors.email && (
                    <MyText
                      text={errors.email.message || ""}
                      styleProps={styles.errorText}
                    />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <MyText text="Mật khẩu" styleProps={styles.labelText} />
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
                            style={styles.inputIcon}
                            name="lock"
                            size={24}
                            color={myTheme.primary}
                          />
                        }
                        maxLength={50}
                        trailingAccessory={
                          <TouchableOpacity
                            onPress={() => setIsShowPassword(!isShowPassword)}
                            style={styles.eyeIcon}
                          >
                            <Feather
                              name={isShowPassword ? "eye" : "eye-off"}
                              size={24}
                              color="lightgray"
                            />
                          </TouchableOpacity>
                        }
                        placeholder="Nhập mật khẩu của bạn"
                        placeholderTextColor="grey"
                        multiline={false}
                        secureTextEntry={!isShowPassword}
                        fieldStyle={styles.fieldStyle}
                        style={[
                          styles.inputField,
                          {
                            borderColor: errors.password
                              ? "red"
                              : myTheme.primary,
                          },
                        ]}
                      />
                    )}
                  />
                  {errors.password && (
                    <MyText
                      text={errors.password.message || ""}
                      styleProps={styles.errorText}
                    />
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    onPress={handleSubmit(onSubmit)}
                    label="Đăng nhập"
                    size="large"
                    disabled={isLoading}
                    backgroundColor={myTheme.primary}
                    style={styles.loginButton}
                    labelStyle={styles.buttonLabel}
                  />
                  {errors.root && (
                    <MyText
                      text={errors.root.message || ""}
                      styleProps={styles.rootError}
                    />
                  )}
                </View>

                <View style={styles.footerContainer}>
                  <MyText
                    text="Dành riêng cho KOL livestream quảng cáo sản phẩm Allure"
                    styleProps={styles.footerText}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  scrollView: {
    flexDirection: "column",
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: height * 0.08,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: myTheme.primary,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: width < myDeviceWidth.sm ? 16 : 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inputContainer: {
    position: "relative",
    marginVertical: 12,
  },
  labelText: {
    position: "absolute",
    top: -10,
    left: 12,
    fontSize: 16,
    textAlign: "left",
    backgroundColor: "white",
    paddingHorizontal: 5,
    zIndex: 1,
    color: myTheme.primary,
  },
  inputIcon: {
    position: "absolute",
    top: height < myDeviceHeight.sm ? 36 : 43,
    left: 15,
  },
  eyeIcon: {
    padding: 10,
    position: "absolute",
    top: height < myDeviceHeight.sm ? 26 : 33,
    right: 10,
  },
  fieldStyle: {
    paddingVertical: 20,
  },
  inputField: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 10,
    height: height < myDeviceHeight.sm ? 60 : 70,
    paddingLeft: 55,
    paddingRight: 50,
    fontSize: 16,
    overflow: "hidden",
    fontFamily: myFontWeight.regular,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 25,
    gap: 24,
  },
  loginButton: {
    minWidth: "100%",
    height: 55,
    justifyContent: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLabel: {
    fontFamily: myFontWeight.bold,
    fontSize: 18,
  },
  rootError: {
    color: "red",
    textAlign: "center",
  },
  footerContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default LoginScreen;
