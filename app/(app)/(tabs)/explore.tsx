import React, { useCallback, useEffect, useState } from "react";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import MyText from "@/components/common/MyText";

const CourseScreen = () => {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MyText text="explore" />
      </GestureHandlerRootView>
    </>
  );
};

export default CourseScreen;
