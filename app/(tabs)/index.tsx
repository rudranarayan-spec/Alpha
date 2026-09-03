import { useCartStore } from '@/store/cart.store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

interface Product {
  id: string;
  name: string;
  packSize: string;
  price: number;
  image: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  amount: number;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Premium Honey',
    packSize: '500g',
    price: 349.00,
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    name: 'Artisan Cold-Pressed Oil',
    packSize: '1L',
    price: 599.00,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    name: 'Handcrafted Cashew Butter',
    packSize: '250g',
    price: 299.00,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    name: 'Single-Origin Arabica Coffee',
    packSize: '250g',
    price: 499.00,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80',
  },
];

const MOCK_RECENT_ORDERS: OrderItem[] = [
  {
    id: '101',
    orderNumber: 'ORD-2026-9012',
    date: '02 Sep 2026',
    status: 'Delivered',
    amount: 948.00,
  },
  {
    id: '102',
    orderNumber: 'ORD-2026-8834',
    date: '28 Aug 2026',
    status: 'Pending',
    amount: 599.00,
  },
  {
    id: '103',
    orderNumber: 'ORD-2026-7721',
    date: '24 Aug 2026',
    status: 'Processing',
    amount: 1298.00,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 720 : width;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalOrders] = useState(28);
  const [pendingAmount] = useState(1897.50);

  const totalCartItems = useCartStore((state) => state.getTotalItemsCount());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'success') {
      return (
        <View className="bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
          <Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">{status}</Text>
        </View>
      );
    } else if (s === 'pending') {
      return (
        <View className="bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
          <Text className="text-amber-700 text-[10px] font-bold uppercase tracking-wider">{status}</Text>
        </View>
      );
    }
    return (
      <View className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
        <Text className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">{status}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" backgroundColor="#0B132B" />

      {/* Header */}
      <View className="bg-[#0B132B] pt-14 pb-5 px-5 border-b border-slate-800">
        <View style={{ width: '100%', maxWidth: contentMaxWidth }} className="self-center flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-[11px] font-medium tracking-tight">Welcome back,</Text>
            <Text className="text-white text-lg font-black tracking-tight">Rudranarayan Sahu</Text>
          </View>
          <View className="flex-row items-center space-x-3">

            {/* Cart Icon Button with Dynamic Badge */}
            <Pressable
              onPress={() => router.push('/cart' as any)}
              className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700 relative"
            >
              <Ionicons name="cart-outline" size={20} color="#FFFFFF" />

              {totalCartItems > 0 && (
                <View className="absolute -top-1.5 -right-1.5 bg-emerald-500 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center border-2 border-[#0B132B]">
                  <Text className="text-white text-[9px] font-black">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/profile' as any)}
              className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700 ml-3"
            >
              <Ionicons name="person-outline" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#059669" />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ width: '100%', maxWidth: contentMaxWidth }} className="self-center px-4 pt-5">

          {/* Key Metrics Dashboard Card */}
          <View className="bg-[#0B132B] rounded-3xl p-5 shadow-lg relative overflow-hidden mb-6">
            <View className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
              Overview Summary
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3 border-r border-slate-800">
                <Text className="text-slate-400 text-xs font-semibold mb-1">Total Orders</Text>
                <Text className="text-white text-2xl font-black tracking-tight">{totalOrders}</Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-slate-400 text-xs font-semibold mb-1">Pending Amount</Text>
                <Text className="text-emerald-400 text-2xl font-black tracking-tight">₹{pendingAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Recent Orders Section */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-slate-900 text-xs font-black uppercase tracking-wider">
              Recent Orders
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/orders' as any)}>
              <Text className="text-emerald-700 text-xs font-bold">View All</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs mb-6">
            {MOCK_RECENT_ORDERS.map((order, index) => (
              <Pressable
                key={order.id}
                onPress={() => router.push('/(tabs)/orders' as any)}
                className={`flex-row items-center justify-between p-3 ${index !== MOCK_RECENT_ORDERS.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                    <Ionicons name="receipt-outline" size={16} color="#0F172A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 text-xs font-bold">{order.orderNumber}</Text>
                    <Text className="text-slate-400 text-[11px] mt-0.5">{order.date}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-700 text-xs font-black mb-1">₹{order.amount.toFixed(2)}</Text>
                  {getStatusBadge(order.status)}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Catalog Showcase */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-slate-900 text-xs font-black uppercase tracking-wider">
              Featured Catalog
            </Text>
            <Pressable onPress={() => router.replace('/(tabs)/explore' as any)}>
              <Text className="text-emerald-700 text-xs font-bold">Explore More</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {MOCK_PRODUCTS.map((product) => (
              <View
                key={product.id}
                className="w-[48%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs mb-4"
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-36 rounded-xl bg-slate-100 mb-3"
                  resizeMode="cover"
                />
                <Text numberOfLines={1} className="text-slate-900 text-xs font-bold tracking-tight mb-1">
                  {product.name}
                </Text>
                <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-slate-100">
                  <Text className="text-slate-400 text-[11px] font-medium">Pack size</Text>
                  <Text className="text-slate-700 text-xs font-semibold">{product.packSize}</Text>
                </View>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}