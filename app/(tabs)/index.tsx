import { dashboardService } from '@/services/dashboard.service';
import { useCartStore } from '@/store/cart.store';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
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

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
}

const MOCK_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'Farm-Fresh Pure Spices',
    subtitle: 'Directly sourced from organic estates with zero artificial additives',
    image: 'https://imgs.search.brave.com/LmMIY-j_v0tlU8UZ-EoNQKvlNWdOBlDzI1acM8wCL5Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ubzEw/c3BpY2UuY29tL2Nk/bi9zaG9wL2FydGlj/bGVzL2Rpc2NvdmVy/LXdoeS1wdXJlLWZy/ZXNobHktZ3JvdW5k/LXNwaWNlcy1jcmVh/dGUtZGVlcGVyLWZs/YXZvdXItbGVhcm4t/aG93LXF1YWxpdHkt/c291cmNpbmctc21h/bGwtYmF0Y2gtZ3Jp/bmRpbmctYW5kLXpl/cm8tZmlsbGVycy1t/YWtlLXRoZS1kaWZm/ZXJlbmNlX2E5OWJi/MGRmLTdhN2UtNGVh/MC1iNjM2LWRmYTE2/M2MyMWZjNS5wbmc_/dj0xNzc0MDM3MDQz/JndpZHRoPTExMDA',
    badge: '100% Chemical-Free',
  },
  {
    id: '2',
    title: 'Eco-Friendly Products',
    subtitle: 'Biodegradable plates, bowls, and sustainable paper packaging',
    image: 'https://imgs.search.brave.com/HuENevq1VSdppGBOjjpUHUhWw3QGV6EP8TckMa_Sp9o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNzIv/MTE0LzA2OS9zbWFs/bC9lY28tZnJpZW5k/bHktemVyby13YXN0/ZS1iYXRocm9vbS1h/bmQta2l0Y2hlbi1l/c3NlbnRpYWxzLWZs/YXQtbGF5LXN1c3Rh/aW5hYmxlLWxpdmlu/Zy1wcm9kdWN0cy1m/cmVlLXBob3RvLmpw/ZWc',
    badge: 'Sustainable Living',
  },
  {
    id: '3',
    title: 'Wholesale Bulk Essentials',
    subtitle: 'Flat 20% OFF on certified organic wholesale orders',
    image: 'https://imgs.search.brave.com/RwQ5FErn7JtRtiZmCYmJRTWV5fGGBcdCnGvWIhEDY5E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rZXJh/bGFzcGljZXN3aG9s/ZXNhbGUuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzEy/L3NwaWNlcy13aG9s/ZXNhbGUtc2NhbGVk/LndlYnA',
    badge: 'Limited Offer',
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Farm-Grade Turmeric Powder',
    packSize: '500g Pack',
    price: 249.00,
    image: 'https://imgs.search.brave.com/NlXNsmoSrXwMU3lwogy2_nA5CL7_Km4tA1Z-ydpsr0o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzgv/OTI1Lzg5Ni9zbWFs/bC9haS1nZW5lcmF0/ZWQtdHVybWVyaWMt/cG93ZGVyLWluLWJv/d2wtb24td29vZGVu/LXRhYmxlLWZyZWUt/cGhvdG8uanBn',
  },
  {
    id: '2',
    name: 'Biodegradable Areca Leaf Plates',
    packSize: 'Pack of 25',
    price: 399.00,
    image: 'https://imgs.search.brave.com/AxdjWEbiawkHpDNyg2k7Ai7C8bjF0adbADuWSMbJ_v0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2U1LzJk/L2U2L2U1MmRlNmYx/OTA2MjFjNTdlZTg2/ZDUxYWQyZTNhNzQw/LmpwZw',
  },
  {
    id: '3',
    name: 'Compostable Kraft Paper Bag',
    packSize: 'Pack of 50',
    price: 299.00,
    image: 'https://imgs.search.brave.com/N6fwkm2eLmuxIg2coBT62qdy_5fk-h2hnQo3U7yxiOI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTMv/NjI5LzcwNS9zbWFs/bC9zZXQtb2YtcGFw/ZXItYmFncy1waG90/by5qcGc',
  },
  {
    id: '4',
    name: 'Organic Kashmiri Red Chilli Powder',
    packSize: '250g Pack',
    price: 320.00,
    image: 'https://imgs.search.brave.com/-2zaJuWRGAUpfuNOt32J9doNfiCgLhVhzEefXp11HaA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTIv/MTE2LzI4OC9zbWFs/bC9hLWJvd2wtb2Yt/cmVkLWNoaWxpLXBv/d2Rlci1hbmQtdHdv/LWNoaWxpLXBlcHBl/cnMtcGhvdG8uanBn',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 720 : width;

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerWidth = contentMaxWidth - 32; // accounting for horizontal padding px-4 (16px * 2)

  const totalCartItems = useCartStore((state) => state.getTotalItemsCount());

  const { data: dashboard, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: dashboardService.getDashboardData,
  });

  // Auto-scroll banner effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((prevIndex) => (prevIndex + 1) % MOCK_BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
            <Text className="text-white text-lg font-black tracking-tight">
              {dashboard?.user_name || 'Loading...'}
            </Text>
          </View>
          <View className="flex-row items-center space-x-3">
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#059669" />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ width: '100%', maxWidth: contentMaxWidth }} className="self-center px-4 pt-5">

          {/* Key Metrics Dashboard Card */}
          <View className="bg-[#0B132B] rounded-3xl p-5 shadow-lg relative overflow-hidden mb-4">
            <View className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
              Overview Summary
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3 border-r border-slate-800">
                <Text className="text-slate-400 text-xs font-semibold mb-1">Total Orders</Text>
                <Text className="text-white text-2xl font-black tracking-tight">
                  {dashboard?.total_orders ?? 0}
                </Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-slate-400 text-xs font-semibold mb-1">Due Amount</Text>
                <Text className="text-red-400 text-2xl font-black tracking-tight">
                  ₹{parseFloat(dashboard?.due_amount || '0').toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

         {/* High-End Modern Action Banner */}
          <Pressable
            onPress={() => router.push('/(tabs)/explore' as any)}
            className="bg-emerald-900 rounded-3xl p-4 flex-row items-center justify-between shadow-xl mb-6 border border-emerald-500/40 relative overflow-hidden active:opacity-95"
          >
            {/* Subtle Inner Highlight Layer */}
            <View className="absolute inset-0 bg-emerald-800/40" />

            <View className="flex-row items-center flex-1 pr-3 relative z-10">
              <View className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center mr-3.5 border border-white/20">
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center space-x-2 mb-0.5">
                  <Text className="text-white text-xs font-black uppercase tracking-wider">Place New Order</Text>
                  <View className="bg-emerald-500/40 px-1.5 py-0.5 rounded text-[9px] border border-emerald-400/30">
                    <Text className="text-emerald-200 text-[9px] font-bold">INSTANT</Text>
                  </View>
                </View>
                <Text className="text-emerald-100/90 text-[11px] font-medium leading-tight">
                  Explore certified organic spices & eco-catalog
                </Text>
              </View>
            </View>

            <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/10 relative z-10">
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

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
            {dashboard?.latest_orders && dashboard.latest_orders.length > 0 ? (
              dashboard.latest_orders.map((order, index) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push('/(tabs)/orders' as any)}
                  className={`flex-row items-center justify-between p-3 ${index !== dashboard.latest_orders.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                      <Ionicons name="receipt-outline" size={16} color="#0F172A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 text-xs font-bold">{order.order_number}</Text>
                      <Text className="text-slate-400 text-[11px] mt-0.5">{order.order_date}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-emerald-700 text-xs font-black mb-1">
                      ₹{parseFloat(order.amount).toFixed(2)}
                    </Text>
                    {getStatusBadge(order.status)}
                  </View>
                </Pressable>
              ))
            ) : (
              <View className="py-6 items-center justify-center">
                <Text className="text-slate-400 text-xs font-medium">No recent orders found</Text>
              </View>
            )}
          </View>

          {/* Promotional Banner Carousel */}
          <View className="mb-6">
            <FlatList
              data={MOCK_BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              snapToInterval={bannerWidth + 12}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 2 }}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + 12));
                setActiveBannerIndex(newIndex);
              }}
              renderItem={({ item, index }) => (
                <View
                  style={{ width: bannerWidth }}
                  className={`h-48 rounded-3xl overflow-hidden relative justify-end p-5 bg-[#0B132B] shadow-md border border-slate-800/60 ${index !== MOCK_BANNERS.length - 1 ? 'mr-3' : ''
                    }`}
                >
                  {/* Background Image - Absolute fill matching container bounds properly */}
                  <View className="absolute inset-0 overflow-hidden rounded-3xl">
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-full opacity-45"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent" />

                  {/* Decorative Glow accent */}
                  <View className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/15 rounded-full blur-xl" />

                  <View className="relative z-10">
                    <View className="self-start bg-emerald-500/90 px-3 py-1 rounded-full mb-2.5 shadow-xs border border-emerald-400/30">
                      <Text className="text-white text-[10px] font-black uppercase tracking-widest">{item.badge}</Text>
                    </View>
                    <Text className="text-white text-lg font-black tracking-tight mb-1">{item.title}</Text>
                    <Text className="text-slate-300 text-xs font-medium leading-relaxed">{item.subtitle}</Text>
                  </View>
                </View>
              )}
            />

            {/* Modern Pill Pagination Dots */}
            <View className="flex-row justify-center items-center mt-3.5 space-x-1.5">
              {MOCK_BANNERS.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === index ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-300'
                    }`}
                />
              ))}
            </View>
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