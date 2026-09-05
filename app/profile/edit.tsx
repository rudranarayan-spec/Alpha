import { updateUserProfile, UpdateUserProfilePayload } from '@/services/user.service';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function UpdateProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // Initialize local state directly from router params passed from profile screen
    const [billingName, setBillingName] = useState((params.billing_name as string) || '');
    const [phone, setPhone] = useState((params.phone as string) || '');
    const [billingAddress, setBillingAddress] = useState((params.billing_address as string) || '');

    // Mutation for updating profile
    const updateMutation = useMutation({
        mutationFn: (payload: UpdateUserProfilePayload) => updateUserProfile(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success(data.message || 'Profile updated successfully');
            router.back();
        },
        onError: (error: any) => {
            const responseData = error?.response?.data;
            if (responseData?.errors) {
                const errorKeys = Object.keys(responseData.errors);
                const firstErrorKey = errorKeys[0];
                const firstErrorMessage = responseData.errors[firstErrorKey]?.[0];
                toast.error(`${firstErrorKey}: ${firstErrorMessage}` || 'Validation error occurred.');
            } else {
                const errorMsg = responseData?.message || 'Failed to update profile. Please try again.';
                toast.error(errorMsg);
            }
        },
    });

    const handleSubmit = () => {
        if (!billingName.trim() || !phone.trim() || !billingAddress.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const payload: UpdateUserProfilePayload = {
            billing_name: billingName.trim(),
            phone: String(phone).trim(),
            billing_address: billingAddress.trim(),
        };

        console.log('📤 Sending Profile Update Payload:', JSON.stringify(payload, null, 2));

        updateMutation.mutate(payload);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <StatusBar style="dark" backgroundColor="#F8FAFC" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: Math.max(insets.top + 12, 20),
                    paddingBottom: Math.max(insets.bottom + 24, 32),
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Navigation Bar */}
                <View className="flex-row items-center mb-6">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-2xl bg-white border border-slate-200 items-center justify-center mr-3.5 shadow-xs active:bg-slate-100"
                    >
                        <Ionicons name="arrow-back" size={20} color="#0F172A" />
                    </Pressable>
                    <View className="flex-1">
                        <Text className="text-slate-900 text-lg font-black tracking-tight">Edit Profile</Text>
                        <Text className="text-slate-500 text-xs font-medium">Update your billing and contact details</Text>
                    </View>
                </View>

                {/* Form Card Container */}
                <View className="bg-white border border-slate-200/80 rounded-3xl p-5 mb-6 shadow-sm">
                    {/* Billing Name Field */}
                    <View className="mb-4">
                        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Billing Name</Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                            <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                value={billingName}
                                onChangeText={setBillingName}
                                placeholder="Enter full name"
                                placeholderTextColor="#94A3B8"
                                className="flex-1 text-slate-900 text-sm font-semibold"
                            />
                        </View>
                    </View>

                    {/* Phone Number Field */}
                    <View className="mb-4">
                        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                            <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter phone number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                className="flex-1 text-slate-900 text-sm font-semibold"
                            />
                        </View>
                    </View>

                    {/* Billing Address Field */}
                    <View className="mb-1">
                        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Billing Address</Text>
                        <View className="flex-row items-start bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[100px]">
                            <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginRight: 10, marginTop: 2 }} />
                            <TextInput
                                value={billingAddress}
                                onChangeText={setBillingAddress}
                                placeholder="Enter complete billing address"
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                className="flex-1 text-slate-900 text-sm font-semibold pt-0"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Action Button */}
                <Pressable
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending}
                    className="bg-emerald-600 active:bg-emerald-700 h-14 rounded-2xl flex-row items-center justify-center shadow-md shadow-emerald-600/20"
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-sharp" size={18} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-black text-xs tracking-wider uppercase">Save Changes</Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}