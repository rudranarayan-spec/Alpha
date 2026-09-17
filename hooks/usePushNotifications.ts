import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/client";
import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { toast } from "sonner-native";

export function usePushNotifications() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user && token);

  // 🔊 Custom notification sound for foreground notifications only.
  const notificationPlayer = useAudioPlayer(
    require("@/assets/notifications/notification_sound1.wav"),
  );

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Configure Android notification channel ONCE.
    const configureAndroidChannel = async () => {
      if (Platform.OS !== "android") return;

      await Notifications.setNotificationChannelAsync("default", {
        name: "TruMate Notifications",
        importance: Notifications.AndroidImportance.MAX,

        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],

        enableLights: true,
        lightColor: "#EE9F19",

        sound: "notification_sound1.wav",

        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    };

    const registerAndSyncToken = async () => {
      if (!isAuthenticated || !token) return;

      try {
        await configureAndroidChannel();

        // Permission
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.warn("[Push] Notification permission denied.");
          return;
        }

        // Project ID
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.error("[Push] Missing EAS Project ID.");
          return;
        }

        // Expo Push Token
        const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        const deviceName =
          Device.modelName || Device.deviceName || `${Platform.OS} Device`;

        await api.post("/notifications/register-token", {
          push_token: pushToken,
          platform: Platform.OS,
          device_name: deviceName,
        });

        console.log("[Push] Token synced.");
      } catch (err) {
        console.log("[Push] Registration failed:", err);
      }
    };

    registerAndSyncToken();

    // ==========================
    // FOREGROUND NOTIFICATIONS
    // ==========================
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("[Push] Foreground Notification:", notification);

        const title = notification.request.content.title || "New Notification";

        const body = notification.request.content.body || "";

        // 🔊 Play only ONE custom sound.
        try {
          notificationPlayer.seekTo(0);
          notificationPlayer.play();
        } catch (err) {
          console.log("[Push] Sound failed:", err);
        }

        toast.success(body || title, {
          description: title,
          duration: 4000,
        });
      });

    // ==========================
    // USER TAPPED NOTIFICATION
    // ==========================
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[Push] Notification tapped:", response);

        // TODO: Navigate based on response.notification.request.content.data
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, token]);
}
