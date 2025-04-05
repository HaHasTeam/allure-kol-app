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
    "✨ Tỏa sáng cùng Allure và nhận thu nhập khủng từ các buổi livestream đẳng cấp",
    "🚀 Gia tăng lượng người theo dõi với sản phẩm độc quyền.",
    "💰 Nhận ngay sản phẩm miễn phí và hoa hồng cho mỗi đơn hàng thành công",
    "🔥 Trở thành KOL hàng đầu trong lĩnh vực làm đẹp với sự hỗ trợ từ đội ngũ chuyên nghiệp",
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
            <MyText text="Allure KOL" styleProps={styles.brandText} />
          </View>

          <View style={styles.carouselSection}>
            <Carousel
              containerStyle={styles.carousel}
              loop
              autoplay
              autoplayInterval={4000}
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
              label="Đăng nhập & Bắt đầu"
              size="large"
              style={styles.button}
              onPress={() => router.push("/login")}
              labelStyle={styles.buttonLabel}
              backgroundColor={myTheme.primary}
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
    color: myTheme.primary,
    marginBottom: 8,
  },
  taglineText: {
    fontSize: 18,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#555",
    marginBottom: 32,
  },
  carouselSection: {
    flex: 1,
    justifyContent: "center",
  },
  carousel: {
    height: height * 0.2,
  },
  carouselItem: {
    width: width - 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  carouselText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    lineHeight: 26,
    fontWeight: "500",
  },
  buttonSection: {
    width: "100%",
    gap: 16,
    marginBottom: height * 0.05,
  },
  button: {
    minWidth: "100%",
    height: 52,
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  descriptionText: {
    color: "#555",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
