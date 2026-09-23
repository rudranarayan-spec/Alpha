import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/client";
import { forgotPasswordService } from "@/services/auth.service"; // <-- Import the new service
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
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

    // Forgot Password Modal States
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSendingForgot, setIsSendingForgot] = useState(false);
    const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
    const [forgotErrorMessage, setForgotErrorMessage] = useState<string | null>(null);

    const isTablet = width >= 768;
    const isSmallPhone = width < 360;

    const handleLogin = async () => {
        if (isSigningIn) return;

        const cleanEmail = email.trim();
        const cleanPassword = password;

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
                // console.log("Login failed:", data.message);
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
            // console.error("Login Error:", error);

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

    const handleForgotPassword = async () => {
        if (isSendingForgot) return;

        const cleanForgotEmail = forgotEmail.trim();
        if (!cleanForgotEmail) {
            setForgotErrorMessage("Please enter your email address.");
            if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            return;
        }

        try {
            setIsSendingForgot(true);
            setForgotErrorMessage(null);
            setForgotSuccessMessage(null);

            if (Platform.OS !== "web") {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            // --- Using the modularized service here ---
            const data = await forgotPasswordService({
                email: cleanForgotEmail,
            });

            setForgotSuccessMessage(
                data.message || "A new password has been sent to your email address"
            );

            if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error: any) {
            // console.error("Forgot Password Error:", error);
            const serverMessage = error?.message || error?.response?.data?.message;
            setForgotErrorMessage(
                serverMessage || "Failed to send reset email. Please try again."
            );
            if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } finally {
            setIsSendingForgot(false);
        }
    };

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

            {/* Subtle soft decorative background shapes matching brand */}
            <View
                pointerEvents="none"
                className="absolute -right-20 top-12 h-64 w-64 rounded-full bg-[#EE9F19]/5"
            />
            <View
                pointerEvents="none"
                className="absolute -left-24 top-36 h-56 w-56 rounded-full bg-[#1C3516]/5"
            />

            <SafeAreaView className="flex-1 pt-12">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: isTablet ? "center" : "space-between",
                        paddingBottom: Math.max(insets.bottom, 24),
                        paddingTop: isTablet ? 24 : 0,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <View
                        className={`w-full ${isTablet
                            ? "flex-row flex-wrap items-center justify-center px-8 lg:px-12 gap-8" // Added flex-wrap and gap
                            : "px-5"
                            }`}
                    >
                        {/* Top branding area with large logo (Smooth clean fade-in) */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "timing", duration: 350 }}
                            className={
                                isTablet
                                    ? "max-w-md flex-1 items-start min-w-[300px]" // Added min-w to prevent crushing
                                    : "items-center pb-6 pt-2"
                            }
                        >
                            <View className="items-center justify-center py-2">
                                <Image
                                    source={require("@/assets/images/logo-removed-bg.png")}
                                    style={{
                                        width: isTablet ? 400 : 350,
                                        height: isTablet ? 160 : 125,
                                    }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text
                                className={`mt-3 font-medium leading-5 text-[#1C3516]/70 ${isTablet
                                    ? "max-w-sm text-left text-base"
                                    : "max-w-[320px] text-center text-xs"
                                    }`}
                            >
                                Sign in to access your dashboard, operations, and account settings.
                            </Text>
                        </MotiView>

                        {/* Login Form Card */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "timing", duration: 350, delay: 50 }}
                            className={`w-full bg-white ${isTablet
                                    ? "max-w-md rounded-[36px] p-10 flex-1 min-w-[380px]" // Added flex-1 and min-w
                                    : "rounded-[32px] px-6 py-6"
                                }`}
                            style={{
                                shadowColor: "#1C3516",
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.06,
                                shadowRadius: 24,
                                elevation: 8,
                            }}
                        >
                            {!isTablet && (
                                <View className="mb-5 h-1.5 w-10 self-center rounded-full bg-slate-200" />
                            )}

                            <View className="mb-5">
                                <Text className="text-2xl font-black tracking-tight text-[#1C3516]">
                                    Welcome back
                                </Text>
                                <Text className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                    Please enter your credentials to sign in.
                                </Text>
                            </View>

                            {errorMessage && (
                                <View className="mb-4 flex-row items-start rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3">
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={18}
                                        color="#DC2626"
                                    />
                                    <Text className="ml-2 flex-1 text-xs font-semibold leading-5 text-red-700">
                                        {errorMessage}
                                    </Text>
                                </View>
                            )}

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="mb-1.5 text-xs font-semibold text-slate-700">
                                    Email Address
                                </Text>
                                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3">
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
                                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3">
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
                                    colors={["#EE9F19", "#D98A0E"]}
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

                            {/* Forgot Password Link Button */}
                            <Pressable
                                onPress={() => {
                                    setForgotEmail(email);
                                    setForgotErrorMessage(null);
                                    setForgotSuccessMessage(null);
                                    setShowForgotModal(true);
                                }}
                                className="mt-4 self-center py-1"
                            >
                                <Text className="text-xs font-semibold text-[#1C3516]/80">
                                    Forgot password?
                                </Text>
                            </Pressable>

                            <Text className="mt-5 text-center text-[10px] font-medium leading-4 text-slate-400">
                                By continuing, you agree to the Trumate Terms of Service and Privacy Policy.
                            </Text>
                        </MotiView>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Forgot Password Modal Overlay */}
            <Modal
                visible={showForgotModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowForgotModal(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/50 px-5">
                    <View className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between pb-4">
                            <View className="flex-row items-center">
                                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#EE9F19]/10">
                                    <Ionicons name="key-outline" size={20} color="#EE9F19" />
                                </View>
                                <Text className="text-lg font-black text-[#1C3516]">
                                    Reset Password
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setShowForgotModal(false)}
                                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                            >
                                <Ionicons name="close" size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        <Text className="mb-4 text-xs font-medium leading-5 text-slate-500">
                            Enter your account email address and we&apos;ll send you instructions to reset your password.
                        </Text>

                        {forgotErrorMessage && (
                            <View className="mb-4 flex-row items-start rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3">
                                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text className="ml-2 flex-1 text-xs font-semibold text-red-700">
                                    {forgotErrorMessage}
                                </Text>
                            </View>
                        )}

                        {forgotSuccessMessage && (
                            <View className="mb-4 flex-row items-start rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                                <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
                                <Text className="ml-2 flex-1 text-xs font-semibold text-emerald-700">
                                    {forgotSuccessMessage}
                                </Text>
                            </View>
                        )}

                        {/* Forgot Email Input */}
                        <View className="mb-5">
                            <Text className="mb-1.5 text-xs font-semibold text-slate-700">
                                Email Address
                            </Text>
                            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3">
                                <Ionicons name="mail-outline" size={18} color="#64748B" />
                                <TextInput
                                    className="ml-2.5 flex-1 text-sm font-medium text-slate-800"
                                    placeholder="name@example.com"
                                    placeholderTextColor="#94A3B8"
                                    value={forgotEmail}
                                    onChangeText={setForgotEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Send Reset Instructions Button */}
                        <Pressable
                            onPress={handleForgotPassword}
                            disabled={isSendingForgot}
                            style={({ pressed }) => ({
                                opacity: isSendingForgot ? 0.72 : pressed ? 0.92 : 1,
                            })}
                            className="overflow-hidden rounded-[18px]"
                        >
                            <LinearGradient
                                colors={["#EE9F19", "#D98A0E"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="flex-row items-center justify-center px-5"
                                style={{ height: 48 }}
                            >
                                {isSendingForgot ? (
                                    <>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text className="ml-3 text-xs font-black uppercase tracking-[1.5px] text-white">
                                            Sending...
                                        </Text>
                                    </>
                                ) : (
                                    <Text className="text-xs font-black uppercase tracking-[1.5px] text-white">
                                        Send Reset Link
                                    </Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}