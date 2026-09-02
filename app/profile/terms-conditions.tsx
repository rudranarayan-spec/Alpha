import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsConditionsScreen() {
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
            Terms & Conditions
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
            User Agreement
          </Text>
          <Text className="text-2xl font-black text-[#0B132B] tracking-tight mb-2">
            Terms of Service
          </Text>
          <Text className="text-slate-400 text-xs font-medium mb-6">
            Last Updated: September 2026
          </Text>

          <Text className="text-slate-600 text-sm font-medium leading-6 mb-6">
            Welcome to Alpha. By browsing, placing orders, or purchasing products on our platform, you agree to comply with and be bound by the following Terms & Conditions.
          </Text>

          {/* SECTION 1 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            1. Account Registration & Security
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
            Users must provide accurate details when configuring their Alpha profile. You are responsible for preserving account credentials and managing access to your device.
          </Text>

          {/* SECTION 2 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            2. Product Catalog & Quality Standards
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
            Alpha offers items across distinct catalog categories including Spices (such as Haldi Powder, Mirchi Powder, and whole spices) and Eco-Friendly Products (such as eco bags, polythene alternatives, butter paper, and biodegradable plates). Weights, colors, and packaging design may vary slightly based on harvest batch or manufacturing runs.
          </Text>

          {/* SECTION 3 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            3. Pricing, Orders & Payments
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
            All prices are listed in INR (₹) and are inclusive of applicable taxes unless stated otherwise. Alpha reserves the right to modify prices or cancel orders affected by technical pricing errors or unexpected stock shortages prior to dispatch.
          </Text>

          {/* SECTION 4 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            4. Shipping & Delivery
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
            Deliveries are made to the address provided during checkout. Estimated delivery dates are non-binding projections and may vary due to regional logistics, weather conditions, or courier transit times.
          </Text>

          {/* SECTION 5 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            5. Returns, Replacement & Refunds
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-6">
            Due to hygiene and safety regulations, edible items (spices) are non-returnable once the safety seal is broken unless delivered damaged or expired. Eco-Friendly products can be replaced or refunded if damaged, defective, or incorrect items were received, provided a claim is raised within 48 hours of delivery.
          </Text>

          {/* SECTION 6 */}
          <Text className="text-[#0B132B] text-base font-black tracking-tight mb-2">
            6. Fair Platform Usage
          </Text>
          <Text className="text-slate-500 text-sm font-medium leading-6 mb-2">
            Any attempt to manipulate coupon codes, submit fraudulent payment claims, create fake accounts, or exploit application workflows will result in immediate, permanent account suspension on Alpha.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}