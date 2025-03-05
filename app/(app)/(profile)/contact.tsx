import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Badge, View } from "react-native-ui-lib";

import MyText from "@/components/common/MyText";
import { myTextColor, myTheme, width } from "@/constants";

const ContactScreen = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#FFF" }}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={{ alignItems: "center", flexGrow: 1 }}
        style={{ flex: 1 }}
      >
        <MyText
          styleProps={{
            fontSize: 16,
            color: "#092724",
            marginHorizontal: 15,
            lineHeight: 30,
            marginBottom: 15,
          }}
          text="Bạn có thể liên hệ với chúng tôi thông qua các nền tảng dưới đây. Nhân viên của chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất có thể."
        />
        <View
          backgroundColor="white"
          style={{
            elevation: 5,
            marginVertical: 12,
            borderRadius: 16,
          }}
        >
          <TouchableOpacity
            style={{
              width: (width * 11) / 12,
              paddingHorizontal: 15,
              flexDirection: "row",
              columnGap: 10,
              alignItems: "center",
              paddingVertical: 15,
            }}
            onPress={() =>
              Linking.openURL("https://maps.app.goo.gl/FtfwhL92Yim7Twzk9")
            }
          >
            <Badge
              customElement={
                <Feather name="map-pin" size={20} color={myTheme.primary} />
              }
              backgroundColor={myTheme.lightPrimary}
              size={35}
              borderRadius={999}
            />
            <MyText
              ellipsizeMode="tail"
              numberOfLines={1}
              text="Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh 700000"
              styleProps={{
                fontSize: 14,
                width: "85%",
                color: myTextColor.caption,
              }}
            />
          </TouchableOpacity>
        </View>
        <View
          backgroundColor="white"
          style={{
            elevation: 5,
            marginVertical: 12,
            borderRadius: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:0834756222`)}
            style={{
              width: (width * 11) / 12,
              paddingHorizontal: 15,
              flexDirection: "row",
              columnGap: 10,
              alignItems: "center",
              paddingVertical: 15,
            }}
          >
            <Badge
              customElement={
                <Feather name="phone" size={20} color={myTheme.primary} />
              }
              backgroundColor={myTheme.lightPrimary}
              size={35}
              borderRadius={999}
            />
            <MyText
              text="(+84) 834 756 222"
              styleProps={{
                fontSize: 14,
                width: "85%",
                color: myTextColor.caption,
              }}
            />
          </TouchableOpacity>
        </View>
        <View
          backgroundColor="white"
          style={{
            elevation: 5,
            marginVertical: 12,
            borderRadius: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:contact@allure.com`)}
            style={{
              width: (width * 11) / 12,
              paddingHorizontal: 15,
              flexDirection: "row",
              columnGap: 10,
              alignItems: "center",
              paddingVertical: 15,
            }}
          >
            <Badge
              customElement={
                <Feather name="mail" size={20} color={myTheme.primary} />
              }
              backgroundColor={myTheme.lightPrimary}
              size={35}
              borderRadius={999}
            />
            <MyText
              text="contact@allure.com"
              styleProps={{
                fontSize: 14,
                width: "85%",
                color: myTextColor.caption,
              }}
            />
          </TouchableOpacity>
        </View>
        <MyText
          text="Phiên bản v1.0.0"
          styleProps={{ marginVertical: 10, color: myTextColor.caption }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactScreen;
