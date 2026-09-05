import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Redirect, Stack, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 1. Import GestureHandler
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native"; // 2. Import Toaster

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { setAuthTokenGetter } from "@/lib/api/client";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import "./global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppInitializer() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    setAuthTokenGetter(async () => {
      return token;
    });
  }, [token, isLoading]);

  usePushNotifications();

  return null;
}

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Service Details",
        }}
      />
    </Stack>
  );
}

function AuthGate() {
  const { user, token, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B132B" />
      </View>
    );
  }

  const isAuthenticated = Boolean(user && token);
  const currentGroup = segments[0];
  const inAuthGroup = currentGroup === "(auth)";

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* 3. Wrap root with GestureHandler */}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppInitializer />
            <AuthGate />
            <Toaster /> {/* 4. Place Toaster globally here */}
          </SafeAreaProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}