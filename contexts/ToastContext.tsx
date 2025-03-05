"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import { Incubator, Colors } from "react-native-ui-lib";
import { setGlobalToast } from "@/utils";

// Define toast types
export type ToastType = "success" | "error" | "info" | "warning";

// Define toast context interface
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

// Define props for ToastProvider
interface ToastProviderProps {
  children: ReactNode;
}

// Toast colors based on type
const toastColors = {
  success: Colors.green30,
  error: Colors.red30,
  info: Colors.blue30,
  warning: Colors.orange30,
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [duration, setDuration] = useState(3000);

  // Function to show toast
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      setMessage(message);
      setType(type);
      setDuration(duration);
      setVisible(true);
    },
    []
  );

  // Function to hide toast
  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  // Set global toast function for use outside of React components
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Incubator.Toast
        visible={visible}
        position={"top"}
        message={message}
        backgroundColor={toastColors[type]}
        messageStyle={{ color: Colors.white }}
        onDismiss={hideToast}
        autoDismiss={duration}
        zIndex={1000}
        style={{
          marginTop: 50, // Add some top margin to avoid status bar
          width: "90%",
          alignSelf: "center",
          borderRadius: 8,
        }}
      />
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
