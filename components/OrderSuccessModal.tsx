import { Ionicons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

interface OrderSuccessModalProps {
  visible: boolean;
  orderId?: string | null;
  onClose?: () => void;
}

export function OrderSuccessModal({
  visible,
  orderId,
  onClose,
}: OrderSuccessModalProps) {
  // Console log the orderID properly whenever the modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('🎉 Order Success Modal Triggered | Order ID:', orderId || 'Not Generated / Provided');
    }
  }, [visible, orderId]);

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 250 }}
          className="absolute inset-0 z-50 items-center justify-center bg-slate-950/70 px-5 backdrop-blur-sm"
        >
          <MotiView
            from={{ opacity: 0, scale: 0.85, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.85, translateY: 20 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="bg-white rounded-[32px] p-7 items-center shadow-2xl border border-slate-100 w-full max-w-xs sm:max-w-sm overflow-hidden relative"
          >
            {/* Background Glow Ring */}
            <View className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <View className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />

            {/* Success Check Icon with Scale/Bounce Moti Animation */}
            <MotiView
              from={{ scale: 0, rotate: '-45deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{ type: 'spring', damping: 12, delay: 100 }}
              className="w-20 h-20 rounded-full bg-emerald-500 items-center justify-center mb-5 shadow-lg shadow-emerald-600/30 border-4 border-emerald-50"
            >
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </MotiView>

            <View className="items-center w-full">
              <Text className="text-slate-900 text-lg font-black mb-2 text-center tracking-tight">
                Order Created Successfully!
              </Text>

              {/* Enhanced Order ID Badge / Display Box */}
              {orderId ? (
                <View className="bg-emerald-50 border border-emerald-200/80 rounded-2xl py-2.5 px-4 w-full mb-3.5 items-center shadow-xs">
                  <Text className="text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest mb-0.5">
                    Assigned Order ID
                  </Text>
                  <Text className="text-emerald-700 text-base font-black tracking-wide">
                    {orderId}
                  </Text>
                </View>
              ) : (
                <View className="bg-amber-50 border border-amber-200/80 rounded-2xl py-2 px-4 w-full mb-3.5 items-center">
                  <Text className="text-amber-700 text-[11px] font-bold">
                    Order ID processing...
                  </Text>
                </View>
              )}

              <Text className="text-slate-500 text-xs text-center leading-5 px-1 mb-2">
                Your Cash on Delivery order has been successfully registered and queued for dispatch.
              </Text>
            </View>

            {/* Optional Manual Dismiss Action Button if needed */}
            {onClose && (
              <Pressable
                onPress={onClose}
                className="mt-2 bg-slate-900 w-full py-3 rounded-xl items-center active:bg-slate-800"
              >
                <Text className="text-white text-xs font-extrabold">Done</Text>
              </Pressable>
            )}

            {/* Subtle Progress Bar Loader Indicator */}
            <View className="w-full h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ type: 'timing', duration: 2600 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </View>
          </MotiView>
        </MotiView>
      )}
    </AnimatePresence>
  );
}