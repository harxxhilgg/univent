import { useToast } from "./useToast";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";

const useInternetMonitor = () => {
  const toastShowRef = useRef(false);
  const [isConnected, setIsConnected] = useState(true);
  const { showError, showSuccess }: any = useToast;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;

      setIsConnected(online);

      if (!online && !toastShowRef.current) {
        toastShowRef.current = true;
        showError(3000, "No internet connection");
      }

      if (online) {
        toastShowRef.current = false;
        showSuccess(3000, "Your internet connection has been restored");
      }

      return () => unsubscribe();
    });
  }, [showError, showSuccess]);

  return isConnected;
};

export default useInternetMonitor;
