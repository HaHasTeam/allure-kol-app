import React from "react";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Dimensions,
  View as RNView,
} from "react-native";
import { Button, View, Carousel } from "react-native-ui-lib";

import MyLink from "@/components/common/MyLink";
import MyText from "@/components/common/MyText";
import { myTheme } from "@/constants";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  const carouselItems = [
    "Khám phá các sản phẩm chăm sóc da cao cấp cho làn da rạng rỡ, khỏe mạnh",
    "Gợi ý sản phẩm phù hợp dựa trên loại da riêng của bạn",
    "Thành phần có nguồn gốc tự nhiên và không thử nghiệm trên động vật",
  ];

  return (
    <ImageBackground
      source={require("@/assets/images/banner-welcome.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <RNView style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <MyText text="Chào mừng đến với" styleProps={styles.welcomeText} />
            <MyText text="Allure" styleProps={styles.brandText} />
          </View>

          <View style={styles.carouselSection}>
            <Carousel
              containerStyle={styles.carousel}
              loop
              autoplay
              autoplayInterval={5000}
              pageControlProps={{
                color: myTheme.primary,
                size: 6,
                spacing: 8,
              }}
              pageControlPosition={Carousel.pageControlPositions.UNDER}
            >
              {carouselItems.map((item, index) => (
                <View key={index} style={styles.carouselItem}>
                  <MyText text={item} styleProps={styles.carouselText} />
                </View>
              ))}
            </Carousel>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label="Bắt đầu mua sắm"
              size="large"
              style={styles.button}
              onPress={() => router.push("/register")}
              labelStyle={styles.buttonLabel}
              backgroundColor={myTheme.primary}
            />
            <MyLink
              text="Đã có tài khoản? Đăng nhập"
              href="/login"
              styleProps={styles.loginLink}
            />
          </View>
        </View>
      </RNView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Semi-transparent white background
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 8,
    color: "#333",
  },
  brandText: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 32,
    color: myTheme.primary,
  },
  carouselSection: {
    flex: 1,
    justifyContent: "center",
  },
  carousel: {
    height: height * 0.15,
  },
  carouselItem: {
    width: width - 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  carouselText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    lineHeight: 24,
  },
  buttonSection: {
    width: "100%",
    gap: 16,
    marginBottom: height * 0.05,
  },
  button: {
    minWidth: "100%",
    height: 48,
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    color: myTheme.primary,
    fontSize: 14,
    textAlign: "center",
  },
});
