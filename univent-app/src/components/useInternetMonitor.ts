import { useToast } from "./useToast";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";

const useInternetMonitor = () => {
  const toastShowRef = useRef(false);
  const hasShownRestoredRef = useRef(false);
  const [isConnected, setIsConnected] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;

      if (isConnected !== online) {
        setIsConnected(online);

        if (!online && !toastShowRef.current) {
          toastShowRef.current = true;
          hasShownRestoredRef.current = false;
          showError(10000, "No internet connection");
        }

        if (online && toastShowRef.current && !hasShownRestoredRef.current) {
          toastShowRef.current = false;
          hasShownRestoredRef.current = true;
          showSuccess(2500, "Your internet connection has been restored");
        }
      }
    });

    return () => unsubscribe();
  }, [showError, showSuccess, isConnected]);

  return isConnected;
};

export default useInternetMonitor;
