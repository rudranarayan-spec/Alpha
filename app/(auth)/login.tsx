import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/client";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isTablet = width >= 768;
    const isSmallPhone = width < 360;

    const handleLogin = async () => {
        if (isSigningIn) return;

        const cleanEmail = email.trim();
        const cleanPassword = password; // Do not trim if passwords accept whitespace

        if (!cleanEmail || !cleanPassword) {
            setErrorMessage("Please enter both email and password.");
            if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            return;
        }

        try {
            setIsSigningIn(true);
            setErrorMessage(null);
            if (Platform.OS !== "web") {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            const response = await api.post("/login", {
                email: cleanEmail,
                password: cleanPassword,
            });

            const data = response.data;

            if (data.status === "success") {
                await login(data.token, data.user);

                if (Platform.OS !== "web") {
                    await Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                    );
                }
            } else {
                setErrorMessage(
                    data.message || "Invalid credentials. Please try again."
                );
                if (Platform.OS !== "web") {
                    await Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                    );
                }
            }
        } catch (error: any) {
            console.error("Login Error:", error);

            const serverMessage = error.response?.data?.message;
            setErrorMessage(
                serverMessage || "Network error. Please check your connection."
            );

            if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

            {/* Top Gradient Background */}
            <LinearGradient
                colors={["#0B132B", "#13224A", "#17336F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isTablet ? height * 0.45 : height * 0.42,
                }}
            />

            {/* Decorative background shapes */}
            <View
                pointerEvents="none"
                className="absolute -right-20 top-12 h-64 w-64 rounded-full bg-white/5"
            />
            <View
                pointerEvents="none"
                className="absolute -left-24 top-36 h-56 w-56 rounded-full bg-blue-300/5"
            />

            <SafeAreaView className="flex-1 pt-12">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: isTablet ? "center" : "space-between",
                        paddingBottom: Math.max(insets.bottom, 24),
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <View
                        className={`w-full ${isTablet
                            ? "flex-row items-center justify-center px-12"
                            : "px-5"
                            }`}
                    >
                        {/* Top branding area */}
                        <MotiView
                            from={{ opacity: 0, translateY: -12 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: "timing", duration: 500 }}
                            className={
                                isTablet
                                    ? "mr-12 max-w-md flex-1"
                                    : "items-center pb-6 pt-2"
                            }
                        >
                            <View
                                className={`mb-4 flex-row items-center ${isTablet ? "justify-start" : "justify-center"
                                    }`}
                            >
                                <View className="h-12 w-12 items-center justify-center rounded-[18px] border border-white/15 bg-white/10">
                                    <Text className="text-xl font-black tracking-tight text-white">
                                        A
                                    </Text>
                                </View>

                                <View className="ml-3">
                                    <Text className="text-xl font-black tracking-tight text-white">
                                        Alpha<Text className="text-[#66A6FF]">Services</Text>
                                    </Text>
                                    <Text className="mt-0.5 text-[9px] font-bold uppercase tracking-[2px] text-white/50">
                                        Enterprise Platform
                                    </Text>
                                </View>
                            </View>

                            <Text
                                className={`font-black tracking-[-1px] text-white ${isTablet
                                    ? "text-left text-5xl leading-[56px]"
                                    : isSmallPhone
                                        ? "text-center text-2xl leading-8"
                                        : "text-center text-3xl leading-10"
                                    }`}
                            >
                                Powered by{"\n"}Alpha Performance.
                            </Text>

                            <Text
                                className={`mt-2.5 font-medium leading-5 text-blue-100/70 ${isTablet
                                    ? "max-w-sm text-left text-base"
                                    : "max-w-[300px] text-center text-xs"
                                    }`}
                            >
                                Sign in to access your dashboard, operations, and account settings.
                            </Text>
                        </MotiView>

                        {/* Login Form Card */}
                        <MotiView
                            from={{ opacity: 0, translateY: 28, scale: 0.97 }}
                            animate={{ opacity: 1, translateY: 0, scale: 1 }}
                            transition={{ type: "timing", duration: 550, delay: 120 }}
                            className={`w-full bg-white ${isTablet
                                ? "max-w-md rounded-[36px] p-10"
                                : "rounded-[32px] px-6 py-6"
                                }`}
                            style={{
                                shadowColor: "#0B132B",
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.08,
                                shadowRadius: 24,
                                elevation: 8,
                            }}
                        >
                            {!isTablet && (
                                <View className="mb-5 h-1.5 w-10 self-center rounded-full bg-slate-200" />
                            )}

                            <View className="mb-5">
                                <Text className="text-2xl font-black tracking-tight text-[#0B132B]">
                                    Welcome back
                                </Text>
                                <Text className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                    Please enter your credentials to sign in.
                                </Text>
                            </View>

                            {errorMessage && (
                                <MotiView
                                    from={{ opacity: 0, translateY: -8 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    className="mb-4 flex-row items-start rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3"
                                >
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={18}
                                        color="#DC2626"
                                    />
                                    <Text className="ml-2 flex-1 text-xs font-semibold leading-5 text-red-700">
                                        {errorMessage}
                                    </Text>
                                </MotiView>
                            )}

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="mb-1.5 text-xs font-semibold text-slate-700">
                                    Email Address
                                </Text>
                                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 focus:border-[#132B59]">
                                    <Ionicons name="mail-outline" size={18} color="#64748B" />
                                    <TextInput
                                        className="ml-2.5 flex-1 text-sm font-medium text-slate-800"
                                        placeholder="name@example.com"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View className="mb-6">
                                <Text className="mb-1.5 text-xs font-semibold text-slate-700">
                                    Password
                                </Text>
                                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 focus:border-[#132B59]">
                                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                    <TextInput
                                        className="ml-2.5 flex-1 text-sm font-medium text-slate-800"
                                        placeholder="Enter your password"
                                        placeholderTextColor="#94A3B8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color="#64748B"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <Pressable
                                onPress={handleLogin}
                                disabled={isSigningIn}
                                accessibilityRole="button"
                                accessibilityLabel="Sign In"
                                style={({ pressed }) => ({
                                    opacity: isSigningIn ? 0.72 : pressed ? 0.92 : 1,
                                    transform: [
                                        { scale: pressed && !isSigningIn ? 0.985 : 1 },
                                    ],
                                })}
                                className="overflow-hidden rounded-[18px]"
                            >
                                <LinearGradient
                                    colors={["#0B132B", "#132B59"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="flex-row items-center justify-center px-5"
                                    style={{ height: 52 }}
                                >
                                    {isSigningIn ? (
                                        <>
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                            <Text className="ml-3 text-xs font-black uppercase tracking-[1.6px] text-white">
                                                Signing In...
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text className="text-xs font-black uppercase tracking-[1.5px] text-white">
                                                Sign In
                                            </Text>
                                            <Ionicons
                                                name="arrow-forward"
                                                size={16}
                                                color="#FFFFFF"
                                                style={{ marginLeft: 8 }}
                                            />
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>

                            <Text className="mt-6 text-center text-[10px] font-medium leading-4 text-slate-400">
                                By continuing, you agree to the Alpha Terms of Service and Privacy Policy.
                            </Text>
                        </MotiView>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}