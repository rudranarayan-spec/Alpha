import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrderSuccessModalProps {
    visible: boolean;
    orderId?: string | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ visible, orderId }) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View
                style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
                className="flex-1 bg-[#0B132B]/70 items-center justify-center px-8"
            >
                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 12 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 260 }}
                    className="bg-white rounded-3xl w-full max-w-[360px] items-center px-7 py-9"
                >
                    <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 11, mass: 0.7, delay: 120 }}
                        className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 items-center justify-center mb-5"
                    >
                        <View className="w-14 h-14 rounded-full bg-emerald-600 items-center justify-center">
                            <Ionicons name="checkmark" size={30} color="#FFFFFF" />
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 220, delay: 240 }}
                        className="items-center"
                    >
                        <Text className="text-slate-900 text-lg font-black tracking-tight mb-1.5">
                            Order placed
                        </Text>
                        <Text className="text-slate-400 text-xs text-center leading-5 mb-4 max-w-[240px]">
                            We&apos;re getting your order ready. You&apos;ll be notified as it moves along.
                        </Text>

                        {orderId && (
                            <View className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider text-center mb-0.5">
                                    Order ID
                                </Text>
                                <Text className="text-slate-900 text-sm font-black text-center">
                                    #{orderId}
                                </Text>
                            </View>
                        )}
                    </MotiView>
                </MotiView>
            </View>
        </Modal>
    );
};