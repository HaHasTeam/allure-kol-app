import React, { useEffect, useState, useCallback } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import MyText from "@/components/common/MyText";
import { myFontWeight } from "../../../constants/index";

const CartScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <MyText styleProps={{ fontFamily: myFontWeight.bold }} text={"cart"} />
    </SafeAreaView>
  );
};

export default CartScreen;
