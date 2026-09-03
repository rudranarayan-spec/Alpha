import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { orderService } from '@/services/order.service'; // Import the new order service
import { useCartStore } from '@/store/cart.store';

export default function CartScreen() {
    const router = useRouter();
    const { width: screenWidth } = useWindowDimensions();

    // Responsive Breakpoints
    const isTablet = screenWidth >= 768;
    const maxContentWidth = isTablet ? 720 : screenWidth;

    // Cart Store Hooks
    const cartItemsMap = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const getSubtotal = useCartStore((state) => state.getSubtotal);

    const cartItems = useMemo(() => Object.values(cartItemsMap), [cartItemsMap]);
    const subtotal = getSubtotal();

    // Local state for API order placement & success animation toast/overlay
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    // Mock pre-set user delivery address check
    const hasUserAddress = true;

    const handlePlaceOrder = useCallback(async () => {
        if (!hasUserAddress) {
            router.push('/profile/address' as any);
            return;
        }

        if (cartItems.length === 0) return;

        setIsPlacingOrder(true);

        try {
            const product_name = cartItems.map((item) => item.product.product_name);
            const pack_size = cartItems.map((item) => item.product.pack_size ?? 'Standard');
            const qty = cartItems.map((item) => item.quantity);
            const cost_price = cartItems.map((item) => {
                const priceStr = item.product.selling_price ?? item.product.mrp ?? '0';
                const parsed = parseFloat(priceStr);
                return isNaN(parsed) ? 0 : parsed;
            });
            const order_amount = subtotal;

            const response = await orderService.createOrder({
                product_name,
                pack_size,
                qty,
                cost_price,
                order_amount,
            });

            // Extract order ID safely from the response data string
            const newOrderId = response?.data;
            console.log('LOG Order created successfully via API:', JSON.stringify(response));

            // Update both states together synchronously 
            setCreatedOrderId(newOrderId || null);
            setIsPlacingOrder(false);
            setOrderSuccess(true);
            clearCart();

            setTimeout(() => {
                setOrderSuccess(false);
                setCreatedOrderId(null);
                router.replace('/(tabs)/explore' as any);
            }, 3000);
        } catch (error) {
            console.error('Failed to create order via API:', error);
            setIsPlacingOrder(false);
        }
    }, [cartItems, subtotal, clearCart, router, hasUserAddress]);

    return (
        <View className="flex-1 bg-slate-100">
            <StatusBar style="light" backgroundColor="#0B132B" translucent />

            {/* Premium Dark Header */}
            <View className="bg-[#0B132B] pt-12 pb-4 px-4 border-b border-slate-800 shadow-sm">
                <View
                    style={{ width: '100%', maxWidth: maxContentWidth }}
                    className="self-center flex-row items-center justify-between"
                >
                    <View className="flex-row items-center">
                        <Pressable
                            hitSlop={8}
                            onPress={() => router.back()}
                            className="w-9 h-9 rounded-full bg-slate-800/80 items-center justify-center mr-3 active:bg-slate-700"
                        >
                            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                        </Pressable>
                        <View>
                            <Text className="text-white text-lg font-black tracking-tight">
                                Your Cart
                            </Text>
                            {cartItems.length > 0 && (
                                <Text className="text-slate-400 text-[11px] font-semibold">
                                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} selected
                                </Text>
                            )}
                        </View>
                    </View>

                    {cartItems.length > 0 && (
                        <Pressable
                            hitSlop={8}
                            onPress={clearCart}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 active:bg-rose-500/20"
                        >
                            <Text className="text-rose-400 text-xs font-bold">Clear All</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Main Cart Content */}
            {cartItems.length === 0 ? (
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 200 }}
                        className="items-center justify-center px-8 py-12 self-center"
                        style={{ maxWidth: maxContentWidth }}
                    >
                        <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4 border border-emerald-100">
                            <Ionicons name="cart-outline" size={38} color="#059669" />
                        </View>
                        <Text className="text-slate-900 text-lg font-extrabold mb-1">
                            Nothing in your cart yet
                        </Text>
                        <Text className="text-slate-400 text-xs text-center leading-5 mb-6 max-w-[260px]">
                            Looks like you haven&apos;t added any products to your cart yet.
                        </Text>
                        <Pressable
                            onPress={() => router.replace('/(tabs)/explore' as any)}
                            className="bg-[#0B132B] px-7 py-3.5 rounded-xl flex-row items-center active:bg-slate-800 shadow-xs"
                        >
                            <Text className="text-white text-xs font-extrabold mr-2">
                                Start Shopping
                            </Text>
                            <Ionicons name="arrow-forward" size={14} color="#FFF" />
                        </Pressable>
                    </MotiView>
                </ScrollView>
            ) : (
                <View className="flex-1 items-center">
                    <View style={{ width: '100%', maxWidth: maxContentWidth }} className="flex-1">
                        <ScrollView
                            contentContainerStyle={{
                                padding: 14,
                                paddingBottom: 120,
                            }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Cart Item Cards List */}
                            {cartItems.map((item, index) => {
                                const { product, quantity } = item;
                                const unitPrice = parseFloat(product.selling_price ?? product.mrp ?? '0');
                                const itemTotal = (isNaN(unitPrice) ? 0 : unitPrice) * quantity;

                                return (
                                    <MotiView
                                        key={product.id}
                                        from={{ opacity: 0, translateY: 12 }}
                                        animate={{ opacity: 1, translateY: 0 }}
                                        transition={{
                                            type: 'timing',
                                            duration: 200,
                                            delay: Math.min(index * 50, 300),
                                        }}
                                        className="bg-white rounded-2xl p-3.5 mb-3.5 border border-slate-100 flex-row items-center shadow-xs"
                                    >
                                        <View className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 items-center justify-center mr-3.5">
                                            <Ionicons name="cube-outline" size={32} color="#CBD5E1" />
                                        </View>

                                        <View className="flex-1 justify-between self-stretch py-0.5">
                                            <View>
                                                <View className="flex-row justify-between items-start">
                                                    <Text
                                                        numberOfLines={2}
                                                        className="text-slate-900 text-sm font-bold flex-1 mr-2 leading-5"
                                                    >
                                                        {product.product_name}
                                                    </Text>
                                                    <Pressable
                                                        hitSlop={10}
                                                        onPress={() => removeItem(product.id)}
                                                        className="p-1 -mr-1 rounded-full active:bg-slate-100"
                                                    >
                                                        <Ionicons name="trash-outline" size={17} color="#94A3B8" />
                                                    </Pressable>
                                                </View>

                                                {product.pack_size && (
                                                    <Text className="text-slate-400 text-[11px] font-semibold mt-0.5">
                                                        {product.pack_size}
                                                    </Text>
                                                )}
                                            </View>

                                            <View className="flex-row justify-between items-center mt-2">
                                                <Text className="text-emerald-700 text-base font-extrabold">
                                                    ₹{itemTotal.toFixed(2)}
                                                </Text>

                                                <View className="flex-row items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
                                                    <Pressable
                                                        hitSlop={6}
                                                        onPress={() => updateQuantity(product, -1)}
                                                        className="w-7 h-7 bg-white rounded-lg items-center justify-center shadow-xs active:bg-slate-200"
                                                    >
                                                        <Ionicons name="remove" size={14} color="#0F172A" />
                                                    </Pressable>

                                                    <Text className="text-slate-900 text-xs font-black px-3 min-w-[28px] text-center">
                                                        {quantity}
                                                    </Text>

                                                    <Pressable
                                                        hitSlop={6}
                                                        onPress={() => updateQuantity(product, 1)}
                                                        className="w-7 h-7 bg-emerald-600 rounded-lg items-center justify-center active:bg-emerald-700"
                                                    >
                                                        <Ionicons name="add" size={14} color="#FFFFFF" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </MotiView>
                                );
                            })}

                            {/* Free Delivery Tag Banner */}
                            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 my-2 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-8 h-8 rounded-full bg-emerald-600 items-center justify-center mr-2.5">
                                        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-emerald-950 text-xs font-black">
                                            Free Delivery Unlocked
                                        </Text>
                                        <Text className="text-emerald-700 text-[11px] font-semibold mt-0.5">
                                            No delivery fees apply to this order.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Order Summary Breakdown */}
                            <View className="bg-white rounded-2xl p-4 mt-2 border border-slate-100 shadow-xs">
                                <Text className="text-slate-900 text-[11px] font-black uppercase tracking-widest mb-3">
                                    Order Summary
                                </Text>

                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-500 text-xs font-medium">
                                        Payment Method
                                    </Text>
                                    <View className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                                        <Text className="text-amber-700 text-[11px] font-extrabold">
                                            Cash on Delivery
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-slate-500 text-xs font-medium">
                                        Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                                    </Text>
                                    <Text className="text-slate-900 text-sm font-extrabold">
                                        ₹{subtotal.toFixed(2)}
                                    </Text>
                                </View>

                                <View className="h-px bg-slate-100 my-3" />

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-slate-900 text-sm font-black">
                                        Total Amount
                                    </Text>
                                    <Text className="text-emerald-700 text-lg font-black">
                                        ₹{subtotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}

            {/* Sticky Bottom Place Order Action Bar */}
            <AnimatePresence>
                {cartItems.length > 0 && (
                    <MotiView
                        from={{ translateY: 100 }}
                        animate={{ translateY: 0 }}
                        exit={{ translateY: 100 }}
                        transition={{ type: 'timing', duration: 200 }}
                        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-4 pt-3 shadow-2xl items-center pb-6"
                    >
                        <View
                            style={{ width: '100%', maxWidth: maxContentWidth }}
                            className="flex-row items-center justify-between"
                        >
                            <View>
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                    Total
                                </Text>
                                <Text className="text-slate-900 text-xl font-black">
                                    ₹{subtotal.toFixed(2)}
                                </Text>
                            </View>

                            <Pressable
                                disabled={isPlacingOrder}
                                onPress={handlePlaceOrder}
                                className="bg-emerald-600 px-7 py-3.5 rounded-xl flex-row items-center active:bg-emerald-700 shadow-sm"
                            >
                                {isPlacingOrder ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text className="text-white text-xs font-extrabold mr-1.5">
                                            Place Order (API)
                                        </Text>
                                        <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </MotiView>
                )}
            </AnimatePresence>

            <OrderSuccessModal visible={orderSuccess} orderId={createdOrderId} />
        </View>
    );
}