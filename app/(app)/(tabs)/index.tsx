import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoaderScreen, TextField, View } from "react-native-ui-lib";

import MyLink from "@/components/common/MyLink";
import MyText from "@/components/common/MyText";

interface IHomeLayout {
  title: string;
  learnMoreLink: Href;
  component: React.JSX.Element;
}

export default function HomeScreen() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#FFF" }}
          keyboardVerticalOffset={100}
        >
          <MyText text="hello" />
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </>
  );
}
