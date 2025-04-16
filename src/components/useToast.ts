import Toast from "react-native-toast-message";

type toastType = "success" | "error" | "info";

export const useToast = () => {
  const showToast = (
    type: toastType,
    visibilityTime: number,
    text1: string,
    text2?: string
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime,
      autoHide: true,
    });
  };

  const showSuccess = (
    visibilityTime: number,
    text1: string,
    text2?: string
  ) => {
    showToast("success", visibilityTime, text1, text2);
  };

  const showError = (visibilityTime: number, text1: string, text2?: string) => {
    showToast("error", visibilityTime, text1, text2);
  };

  const showInfo = (visibilityTime: number, text1: string, text2?: string) => {
    showToast("info", visibilityTime, text1, text2);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
  };
};
