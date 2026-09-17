import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';

import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { orderService } from '@/services/order.service';
import { useCartStore } from '@/store/cart.store';
import { useAudioPlayer } from "expo-audio";
import { toast } from 'sonner-native';

export default function CartScreen() {
    const router = useRouter();
    const { width: screenWidth } = useWindowDimensions();

    // Responsive Breakpoints
    const isTablet = screenWidth >= 768;
    const maxContentWidth = isTablet ? 720 : screenWidth;

    // Cart Store Hooks
    const cartItemsMap = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const dueAmount = useCartStore((state) => state.dueAmount);
    const setQuantity = useCartStore((state) => state.setQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const getSubtotal = useCartStore((state) => state.getSubtotal);

    const [stockWarning, setStockWarning] = useState<string | null>(null);

    const cartItems = useMemo(() => Object.values(cartItemsMap), [cartItemsMap]);
    const subtotal = getSubtotal();

    // Local state for API order placement & success animation toast/overlay
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    // Track local text input values per product ID to allow smooth manual typing (e.g., "99")
    const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

    // Mock pre-set user delivery address check
    const hasUserAddress = true;

    const orderSuccessPlayer = useAudioPlayer(
        require("@/assets/sounds/success_sound1.wav")
    );

    const handlePlaceOrder = useCallback(async () => {
        if (dueAmount > 0) {
            toast.warning("Outstanding Dues", {
                description: `You have an active due amount of ₹${dueAmount.toFixed(2)}. Please clear it to place new orders.`,
                duration: 4000,
            });
            return;
        }

        if (!hasUserAddress) {
            router.push('/profile/address' as any);
            return;
        }

        if (cartItems.length === 0) return;

        toast('Confirm Order', {
            description: `Total amount: ₹${subtotal.toFixed(2)} for ${cartItems.length} item(s).`,
            action: {
                label: 'Confirm',
                onClick: async () => {
                    // 1. Explicitly dismiss the toast notification immediately
                    toast.dismiss();

                    setIsPlacingOrder(true);

                    try {
                        const product_id = cartItems.map((item) => item.product.id);
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
                            product_id,
                            product_name,
                            pack_size,
                            qty,
                            cost_price,
                            order_amount,
                        });

                        const newOrderId = response?.data;
                        console.log('LOG Order created successfully via API:', JSON.stringify(response));

                        setIsPlacingOrder(false);
                        setCreatedOrderId(newOrderId || null);
                        setOrderSuccess(true);
                        clearCart();

                        try {
                            orderSuccessPlayer.seekTo(0);
                            orderSuccessPlayer.play();
                            console.log("AUDIO: Playing")
                        } catch (error) {
                            console.log("Order success sound error:", error);
                        }

                        setTimeout(() => {
                            setOrderSuccess(false);
                            setCreatedOrderId(null);
                            router.replace('/(tabs)/' as any);
                        }, 5000);
                    } catch (error) {
                        // console.error('Failed to create order via API:', error);
                        toast.error('Failed to place order. Please try again later.', {
                            duration: 4000,
                        });
                        setIsPlacingOrder(false);
                        setOrderSuccess(false);
                    }
                },
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {
                    toast.dismiss();
                },
            },
            duration: 10000,
        });
    }, [cartItems, subtotal, clearCart, router, hasUserAddress]);

    // Handle confirming manual input quantity via the arrow/set button
    const handleCommitQuantity = (product: any) => {
        const typedText = localQuantities[product.id] ?? String(cartItemsMap[product.id]?.quantity ?? 1);
        const parsed = parseInt(typedText, 10);

        if (isNaN(parsed) || parsed < 1) {
            setQuantity(product, 1);
            setLocalQuantities((prev) => ({ ...prev, [product.id]: '1' }));
            return;
        }

        if (parsed > product.stock) {
            setStockWarning(`Only ${product.stock} items available in stock for ${product.product_name}`);
            setTimeout(() => setStockWarning(null), 3000);
            setLocalQuantities((prev) => ({ ...prev, [product.id]: String(product.stock) }));
            setQuantity(product, product.stock);
            return;
        }

        setQuantity(product, parsed);
    };

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" backgroundColor="#0B132B" translucent />

            {/* Premium Dark Header */}
            <View className="bg-[#FDFBF7] pt-12 pb-4 px-4 border-b border-[#1C3516]/10 shadow-sm">
                <View
                    style={{ width: '100%', maxWidth: maxContentWidth }}
                    className="self-center flex-row items-center justify-between"
                >
                    <View className="flex-row items-center">
                        <Pressable
                            hitSlop={8}
                            onPress={() => router.back()}
                            className="w-9 h-9 rounded-full bg-white border border-[#1C3516]/15 items-center justify-center mr-3 shadow-sm active:bg-slate-50"
                        >
                            <Ionicons name="chevron-back" size={20} color="#1C3516" />
                        </Pressable>
                        <View className="flex-row items-center flex-wrap">
                            <Text
                                className="text-[#1C3516] text-lg font-black tracking-tight"
                                numberOfLines={1}
                            >
                                Your Cart
                            </Text>

                            {cartItems.length > 0 && (
                                <Text
                                    className="text-[#1C3516]/60 text-[11px] font-semibold ml-2"
                                    numberOfLines={1}
                                >
                                    ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''} selected)
                                </Text>
                            )}
                        </View>
                    </View>

                    {cartItems.length > 0 && (
                        <Pressable
                            hitSlop={8}
                            onPress={clearCart}
                            className="px-2.5 py-1.5 rounded-lg bg-[#EE9F19]/10 border border-[#EE9F19]/20 active:bg-[#EE9F19]/20"
                        >
                            <Text className="text-[#EE9F19] text-xs font-bold">Clear All</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {cartItems.length > 0 && (
                <View className="bg-slate-200/60 px-4 py-2 pt-2 border-b border-slate-200">
                    <View style={{ width: '100%', maxWidth: maxContentWidth }} className="self-center flex-row items-center">
                        <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                        <Text className="text-slate-600 text-[11px] font-medium">
                            You can update item quantities or remove products below.
                        </Text>
                    </View>
                </View>
            )}

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
                            className="bg-orange-500 px-7 py-3.5 rounded-xl flex-row items-center active:bg-slate-800 shadow-xs"
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
                            {/* Stock Warning Banner if triggered */}
                            {stockWarning && (
                                <MotiView
                                    from={{ opacity: 0, translateY: -10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl mb-3 flex-row items-center"
                                >
                                    <Ionicons name="alert-circle" size={18} color="#D97706" style={{ marginRight: 8 }} />
                                    <Text className="text-amber-800 text-xs font-bold flex-1">{stockWarning}</Text>
                                </MotiView>
                            )}

                            {/* Cart Item Cards List */}
                            {cartItems.map((item, index) => {
                                const { product, quantity } = item;
                                const unitPrice = parseFloat(product.selling_price ?? product.mrp ?? '0');
                                const itemTotal = (isNaN(unitPrice) ? 0 : unitPrice) * quantity;
                                const currentTextVal = localQuantities[product.id] ?? String(quantity);

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
                                            {product.image ? (
                                                <Image
                                                    source={{ uri: product.image }}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            ) : (
                                                <Ionicons name="cube-outline" size={32} color="#CBD5E1" />
                                            )}
                                        </View>

                                        <View className="flex-1 justify-between self-stretch py-0.5">
                                            <View>
                                                <View className="flex-row justify-between items-start">
                                                    <Text
                                                        numberOfLines={2}
                                                        className="text-slate-900 text-sm font-bold flex-1 mr-2 leading-5"
                                                    >
                                                        {product.product_name} {product.pack_size}
                                                    </Text>
                                                    <Pressable
                                                        hitSlop={10}
                                                        onPress={() => removeItem(product.id)}
                                                        className="p-1 -mr-1 rounded-full active:bg-slate-100"
                                                    >
                                                        <Ionicons name="trash-outline" size={17} color="#" />
                                                    </Pressable>
                                                </View>

                                                {product.pack_size && (
                                                    <View className="mt-1 flex-row items-center gap-2">
                                                        {/* <Text className="text-[11px] font-semibold text-slate-500">
                                                            {product.pack_size}
                                                        </Text> */}
                                                        {/* <View className="h-1 w-1 rounded-full bg-slate-300" /> */}
                                                        <Text className="text-[11px] font-bold text-slate-700">
                                                            Price: ₹{product.selling_price}
                                                            <Text className="font-normal text-slate-400"> / unit</Text>
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            <View className="flex-row justify-between items-center mt-2">
                                                <Text className="text-emerald-700 text-base font-extrabold">
                                                    ₹{itemTotal.toFixed(2)}
                                                </Text>

                                                {/* Simple Quantity Input Box + Commit Arrow Button */}
                                                <View className="flex-row items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                                    <Text className="text-slate-500 text-[11px] font-black mr-1">
                                                        Qty:
                                                    </Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={currentTextVal}
                                                        onChangeText={(text) => {
                                                            setLocalQuantities((prev) => ({
                                                                ...prev,
                                                                [product.id]: text,
                                                            }));
                                                        }}
                                                        maxLength={4}
                                                        selectionColor="#059669"
                                                        className="text-slate-900 text-xs font-black px-2 min-w-[50px] text-center bg-white rounded-lg border border-slate-300 mx-1 py-1 shadow-xs"
                                                        placeholderTextColor="#94A3B8"
                                                    />

                                                    {/* Arrow button to commit/save the quantity */}
                                                    <Pressable
                                                        hitSlop={6}
                                                        onPress={() => handleCommitQuantity(product)}
                                                        className="w-7 h-7 bg-blue-100 rounded-lg items-center justify-center active:bg-emerald-700 shadow-xs ml-0.5"
                                                    >
                                                        <AntDesign name="enter" size={16} color="black" style={{ fontWeight: 'bold' }} />
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

                                {/* <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-500 text-xs font-medium">
                                        Payment Method
                                    </Text>
                                    <View className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                                        <Text className="text-amber-700 text-[11px] font-extrabold">
                                            Cash on Delivery
                                        </Text>
                                    </View>
                                </View> */}

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
                                            Place Order
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