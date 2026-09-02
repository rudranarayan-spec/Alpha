import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/client";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

export function usePushNotifications() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user && token);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const registerAndSyncToken = async () => {
      // 1. Authentication Interceptor
      if (!isAuthenticated || !token) return;

      try {
        // 2. Android High-Priority Notification Channel Setup
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default Operations",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#2563EB",
          });
        }

        // 3. Request Device Permissions Defensively
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.warn("[Push] Permission denied by the device user.");
          return;
        }

        // 4. EAS Project ID Resolution
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.error(
            "[Push] Setup aborted: Missing EAS Project ID in app.json.",
          );
          return;
        }

        // 5. Fetch Expo Push Token
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const pushToken = tokenResponse.data;

        if (pushToken) {
          console.log("\n===========================================");
          console.log("EXPO PUSH TOKEN:");
          console.log(pushToken);
          console.log("===========================================\n");

          // 6. Register Token with Backend API
          const response = await api.post("/notifications/register-token", {
            token: pushToken,
            platform: Platform.OS,
          });

          if (response.status === 200 || response.status === 201) {
            console.log(
              "[Push] Device token successfully bound to user cloud profile.",
            );
          } else {
            console.error(
              "[Push] Remote enrollment failed with status:",
              response.status,
            );
          }
        }
      } catch (error) {
        console.error(
          "[Push] Production setup pipeline encountered an error:",
          error,
        );
      }
    };

    registerAndSyncToken();

    // Attach Foreground Notification Listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("[Push] Foreground Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[Push] Notification Response (User Tapped):", response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, token]);
}
