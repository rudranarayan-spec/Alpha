import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/client";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { toast } from "sonner-native";

export function usePushNotifications() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user && token);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const registerAndSyncToken = async () => {
      if (!isAuthenticated || !token) return;

      try {
        // 2. Android High-Priority Notification Channel Setup with Custom Sound
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default Operations",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#EE9F19", // Matching your app's warm accent theme
            sound: "notification_sound.mp3", // Note: Android looks inside res/raw/ without extension or with depending on config, but usually just the filename or filename without extension. Let's use "notification_sound.mp3" or "notification_sound".
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
          console.log("EXPO PUSH TOKEN:", pushToken);
          console.log("===========================================\n");

          const deviceName =
            Device.modelName || Device.deviceName || `${Platform.OS} Device`;

          // 6. Register Token with Backend API
          const response = await api.post("/notifications/register-token", {
            push_token: pushToken,
            platform: Platform.OS,
            device_name: deviceName,
          });

          if (response.status === 200 || response.status === 201) {
            console.log(
              "[Push] Device token successfully bound to user profile.",
            );
          }
        }
      } catch (error) {
        // Handle error silently or log if needed
      }
    };

    registerAndSyncToken();

    // Attach Foreground Notification Listeners & Toast Trigger
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("[Push] Foreground Notification Received:", notification);

        const title = notification.request.content.title || "New Notification";
        const body = notification.request.content.body;

        // Display visual toast message using sonner-native
        if (body) {
          toast.success(body, {
            description: title,
            duration: 4000,
          });
        } else {
          toast.info(title);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[Push] Notification Response (User Tapped):", response);
        // Handle deep linking or screen routing on tap here if needed
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
