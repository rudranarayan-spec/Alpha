import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" backgroundColor="#0B132B" animated />

            {/* BRAND THEME HEADER ARC */}
            <View
                className="bg-[#0B132B] px-6 rounded-b-[40px] shadow-xl shadow-slate-900/10 z-10"
                style={{ paddingTop: insets.top + 16, paddingBottom: 36 }}
            >
                <View className="max-w-4xl mx-auto w-full flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/10 active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={18} color="white" />
                    </Pressable>
                    <Text className="text-white text-lg md:text-xl font-black ml-4 tracking-tight">
                        Privacy Policy
                    </Text>
                </View>
            </View>

            {/* LEGAL CONTENT STREAM CONTAINER */}
            <ScrollView
                className="flex-1 -mt-4 z-20"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 40
                }}
            >
                <View className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-sm">
                    <Text className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                        Privacy Protection
                    </Text>
                    <Text className="text-2xl font-black text-[#0B132B] tracking-tight mb-2">
                        Data Privacy Standards
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium mb-6">
                        Last Updated: September 2026
                    </Text>

                    <Text className="text-slate-600 text-sm font-medium leading-6 mb-6">
                        At Alpha, we value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, process, share, and safeguard your data when you browse our catalog, purchase spices, or order eco-friendly packaging products.
                    </Text>

                    {/* SECTION 1 */}
                    <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
                        1. Information We Collect
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium leading-6 mb-5">
                        • <Text className="font-bold text-slate-700">Account & Profile Info:</Text> Your name, phone number, email address, and billing details provided during account creation.{"\n\n"}
                        • <Text className="font-bold text-slate-700">Delivery & Address Data:</Text> Saved shipping coordinates, landmark details, and contact numbers used for product dispatch.{"\n\n"}
                        • <Text className="font-bold text-slate-700">Order & Commerce Metrics:</Text> Purchase history, cart items, preferred item categories (Spices, Eco-friendly packaging), and saved preferences.{"\n\n"}
                        • <Text className="font-bold text-slate-700">Payment & Security Tokens:</Text> Encrypted transaction identifiers processed through verified PCI-DSS compliant payment gateways.
                    </Text>

                    {/* SECTION 2 */}
                    <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
                        2. How Your Data Is Used
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
                        Your information is used strictly to process orders, package and dispatch goods (Spices and Eco-friendly items), send real-time order tracking updates via push notifications, process refunds, and improve platform performance on Alpha.
                    </Text>

                    {/* SECTION 3 */}
                    <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
                        3. Logistics & Third-Party Sharing
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
                        We share necessary delivery details (name, address, and phone number) exclusively with our logistics and courier partners to fulfill door-step deliveries. We never sell, trade, or rent out personal user data to third-party advertising networks.
                    </Text>

                    {/* SECTION 4 */}
                    <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
                        4. Security & Data Protection
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
                        All application network traffic is protected using Transport Layer Security (TLS/SSL). Personal information, account data, and order databases are stored securely behind encrypted server networks.
                    </Text>

                    {/* SECTION 5 */}
                    <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
                        5. User Rights & Account Control
                    </Text>
                    <Text className="text-slate-500 text-sm font-medium leading-6 mb-2">
                        You maintain full authority over your data. You may update saved addresses, clear your search history, or request full account and data deletion at any time by contacting our support desk.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}