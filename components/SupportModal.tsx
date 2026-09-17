import { siteService } from '@/services/platform.services';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';

interface SupportModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SupportModal({ visible, onClose }: SupportModalProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['site-setting'],
        queryFn: siteService.getSiteSetting,
        enabled: visible, 
        staleTime: 1000 * 60 * 5, 
    });

    const supportNumber = data?.status === 'success' && data?.support_number ? data.support_number : '020 3957 7573';
    // Fallback to support@trumate.com if API response doesn't provide an email
    const supportEmail = (data as any)?.support_email || 'support@trumate.com';

    const handleCallNow = () => {
        if (supportNumber && !isLoading) {
            const cleanNumber = supportNumber.replace(/\s+/g, '');
            Linking.openURL(`tel:${cleanNumber}`);
        }
    };

    const handleEmailSupport = () => {
        Linking.openURL(`mailto:${supportEmail}?subject=Support Request - Alpha`);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-center items-center px-4 sm:px-6">
                {/* Responsive container: Adapts width smoothly for phones and tablets */}
                <View className="bg-[#FAF8F5] w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-8 border border-[#1C3516]/10 shadow-2xl">

                    {/* Header Icon & Title */}
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 rounded-full bg-[#EE9F19]/15 justify-center items-center mb-3">
                            <Ionicons name="headset" size={32} color="#EE9F19" />
                        </View>
                        <Text className="text-xl sm:text-2xl font-bold text-[#1C3516]">Help & Support Desk</Text>
                        <Text className="text-xs sm:text-sm text-neutral-500 mt-1 text-center">
                            We are here for you 24/7 with dedicated customer service support.
                        </Text>
                    </View>

                    {isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#EE9F19" />
                            <Text className="text-xs text-neutral-400 mt-2">Loading contact details...</Text>
                        </View>
                    ) : (
                        <View className="space-y-3">
                            {/* Phone Support Box */}
                            <TouchableOpacity 
                                onPress={handleCallNow}
                                activeOpacity={0.8}
                                className="bg-white rounded-2xl p-4 border border-neutral-200 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-[#1C3516]/5 justify-center items-center">
                                        <Ionicons name="call-outline" size={20} color="#1C3516" />
                                    </View>
                                    <View>
                                        <Text className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Call Us</Text>
                                        <Text className="text-[14px] sm:text-lg font-black text-[#1C3516]">
                                            {supportNumber}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#EE9F19" />
                            </TouchableOpacity>

                            {/* Email Support Box */}
                            <TouchableOpacity 
                                onPress={handleEmailSupport}
                                activeOpacity={0.8}
                                className="bg-white rounded-2xl p-4 border border-neutral-200 flex-row items-center justify-between shadow-sm mt-3"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-[#1C3516]/5 justify-center items-center">
                                        <Ionicons name="mail-outline" size={20} color="#1C3516" />
                                    </View>
                                    <View className="flex-1 pr-2">
                                        <Text className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Email Us</Text>
                                        <Text className="text-sm sm:text-base font-bold text-[#1C3516]" numberOfLines={1}>
                                            {supportEmail}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 bg-neutral-200 py-3.5 rounded-xl items-center"
                        >
                            <Text className="font-semibold text-neutral-700 text-sm sm:text-base">Close</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCallNow}
                            disabled={isLoading}
                            className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
                                isLoading ? 'bg-[#EE9F19]/50' : 'bg-[#EE9F19]'
                            }`}
                        >
                            <Ionicons name="call" size={18} color="#FFFFFF" />
                            <Text className="font-bold text-white text-sm sm:text-base">Call Now</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}