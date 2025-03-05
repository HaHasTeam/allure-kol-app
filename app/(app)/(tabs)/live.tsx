import React from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import MyText from "@/components/common/MyText";
import { myDeviceWidth, myFontWeight, width } from "../../../constants/index";

const MyClassScreen = () => {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MyText
          text="live stream"
          styleProps={{
            fontSize: width < myDeviceWidth.sm ? 18 : 20,
            textAlign: "left",
            marginTop: 24,
            fontFamily: myFontWeight.bold,
          }}
        />
      </GestureHandlerRootView>
    </>
  );
};

export default MyClassScreen;
