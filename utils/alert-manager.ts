import { Alert } from "react-native";
import { resolveError } from "./error-handler";

type AlertAction = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

/**
 * Shows a user-friendly error alert with options to take action
 *
 * @param error The error object or message
 * @param title Optional custom title for the alert
 * @param actions Optional array of actions the user can take
 */
export const showErrorAlert = (
  error: any,
  title = "Error",
  actions: AlertAction[] = []
): void => {
  const errorMessage = resolveError(error);

  // Default actions if none provided
  const defaultActions: AlertAction[] = [{ text: "OK", style: "default" }];

  // Use provided actions or default ones
  const alertActions = actions.length > 0 ? actions : defaultActions;

  // Show the alert
  Alert.alert(title, errorMessage, alertActions, { cancelable: true });
};

/**
 * Shows a network error alert with retry option
 *
 * @param error The error object
 * @param retryAction Function to call when user chooses to retry
 * @param cancelAction Optional function to call when user cancels
 */
export const showNetworkErrorAlert = (
  error: any,
  retryAction: () => void,
  cancelAction?: () => void
): void => {
  const errorMessage = resolveError(error);

  Alert.alert(
    "Connection Error",
    `${errorMessage}\n\nWould you like to try again?`,
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: cancelAction,
      },
      {
        text: "Retry",
        style: "default",
        onPress: retryAction,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Shows an authentication error alert with login option
 *
 * @param error The error object
 * @param loginAction Function to navigate to login screen
 * @param cancelAction Optional function to call when user cancels
 */
export const showAuthErrorAlert = (
  error: any,
  loginAction: () => void,
  cancelAction?: () => void
): void => {
  const errorMessage = resolveError(error);

  Alert.alert(
    "Session Expired",
    `${errorMessage}\n\nPlease log in again to continue.`,
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: cancelAction,
      },
      {
        text: "Log In",
        style: "default",
        onPress: loginAction,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Shows a permission error alert
 *
 * @param error The error object
 * @param goBackAction Function to navigate back
 */
export const showPermissionErrorAlert = (
  error: any,
  goBackAction: () => void
): void => {
  const errorMessage = resolveError(error);

  Alert.alert(
    "Access Denied",
    `${errorMessage}\n\nYou don't have permission to access this resource.`,
    [
      {
        text: "Go Back",
        style: "default",
        onPress: goBackAction,
      },
    ],
    { cancelable: true }
  );
};
