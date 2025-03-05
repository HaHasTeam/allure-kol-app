import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import * as ImagePicker from "expo-image-picker";
import type { ToastType } from "@/contexts/ToastContext";
import { errorMessage } from "@/constants/index";
import { CommonErrorResponse } from "@/types";
import { LEVEL, SLOT_NUMBER, WEEKDAY } from "@/constants/index";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

export const isFutureDate = (inputDate: string) => {
  // Chuyển đổi ngày đầu vào thành đối tượng Date
  const date = new Date(inputDate);

  // Lấy ngày hiện tại (không tính thời gian)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // So sánh ngày
  return date > today;
};

export const calculateDateList = (
  startDate: string,
  duration: number,
  weekdays: WEEKDAY[]
) => {
  const isoWeekday = {
    [WEEKDAY.MONDAY]: 1,
    [WEEKDAY.TUESDAY]: 2,
    [WEEKDAY.WEDNESDAY]: 3,
    [WEEKDAY.THURSDAY]: 4,
    [WEEKDAY.FRIDAY]: 5,
    [WEEKDAY.SATURDAY]: 6,
    [WEEKDAY.SUNDAY]: 7,
  };
  const startOfDate = dayjs(startDate).startOf("date");
  const endOfDate = startOfDate.add(duration, "week").startOf("date");

  const classDates: dayjs.Dayjs[] = [];
  let currentDate = startOfDate.clone();
  while (currentDate.isSameOrBefore(endOfDate)) {
    weekdays.forEach((weekday) => {
      const classDate = currentDate.isoWeekday(isoWeekday[weekday]);
      if (
        classDate.isSameOrAfter(startOfDate) &&
        classDate.isBefore(endOfDate)
      ) {
        classDates.push(classDate);
      }
    });

    currentDate = currentDate.add(1, "week");
  }

  return classDates;
};

export const extractMessage = (message: string, replace: string[]) => {
  let temp = message;
  for (let i = 0; i < replace.length; i++) {
    temp = temp.replace("<>", replace[i]);
  }
  return temp;
};

export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    base64: true,
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (!result.canceled) {
    return result.assets;
  }

  return null;
};

export const takePhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    base64: true,
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    cameraType: ImagePicker.CameraType.back,
  });
  if (!result.canceled) {
    return result.assets;
  }

  return null;
};

export const extractLevel = (value: LEVEL) => {
  switch (value) {
    case LEVEL.BASIC:
      return {
        color: "#21bc2b",
        title: "Cơ bản",
      };
    case LEVEL.ADVANCED:
      return {
        color: "#f66868",
        title: "Nâng cao",
      };
    case LEVEL.INTERMEDIATE:
      return {
        color: "#ff9242",
        title: "Trung bình",
      };
  }
};

export const extractWeekday = (value: WEEKDAY) => {
  switch (value) {
    case WEEKDAY.MONDAY:
      return "T2";
    case WEEKDAY.TUESDAY:
      return "T3";
    case WEEKDAY.WEDNESDAY:
      return "T4";
    case WEEKDAY.THURSDAY:
      return "T5";
    case WEEKDAY.FRIDAY:
      return "T6";
    case WEEKDAY.SATURDAY:
      return "T7";
    case WEEKDAY.SUNDAY:
      return "CN";
    default:
      return "N/A";
  }
};

export const extractSlot = (slotNumber: SLOT_NUMBER) => {
  switch (slotNumber) {
    case SLOT_NUMBER.ONE:
      return { slotStart: "7:00", slotEnd: "9:00" };
    case SLOT_NUMBER.TWO:
      return { slotStart: "9:30", slotEnd: "11:30" };
    case SLOT_NUMBER.THREE:
      return { slotStart: "12:30", slotEnd: "14:30" };
    case SLOT_NUMBER.FOUR:
      return { slotStart: "15:00", slotEnd: "17:00" };
    default:
      return { slotStart: "N/A", slotEnd: "N/A" };
  }
};

export const resolveError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as CommonErrorResponse;
    return response.message as string;
  } else {
    return errorMessage.ERM033;
  }
};

// This is a global variable that will be set by the ToastProvider
let globalShowToast: (
  message: string,
  type?: ToastType,
  duration?: number
) => void;

// Function to set the global toast function
export function setGlobalToast(
  showToastFn: (message: string, type?: ToastType, duration?: number) => void
) {
  globalShowToast = showToastFn;
}
