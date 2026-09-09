import { CategoryService } from '@/services/category.service';
import { dashboardService } from '@/services/dashboard.service';
import { useCartStore } from '@/store/cart.store';
import { Category } from '@/types/category.types';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 720 : width;
  const setDueAmount = useCartStore((state) => state.setDueAmount);


  const totalCartItems = useCartStore((state) => state.getTotalItemsCount());

  // 1. Fetch Dashboard Metrics
  const { data: dashboard, refetch: refetchDashboard, isRefetching: isRefetchingDashboard } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: dashboardService.getDashboardData,
  });

  // 2. Fetch Actual Categories from Backend
  const {
    data: categories = [],
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories
  } = useQuery<Category[]>({
    queryKey: ['categories-home'],
    queryFn: CategoryService.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  const handleRefresh = async () => {
    await Promise.all([refetchDashboard(), refetchCategories()]);
  };
  
  React.useEffect(() => {
    if (dashboard?.due_amount) {
      setDueAmount(parseFloat(dashboard.due_amount));
    } else {
      setDueAmount(0);
    }
  }, [dashboard?.due_amount]);

  const isRefreshing = isRefetchingDashboard || isRefetchingCategories;

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
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#059669" />
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
              {/* Total Orders */}
              <View className="flex-1 pr-2 border-r border-slate-800">
                <Text className="text-slate-400 text-[11px] font-semibold mb-1" numberOfLines={1}>
                  Orders
                </Text>
                <Text className="text-white text-lg font-black tracking-tight">
                  {dashboard?.total_orders ?? 0}
                </Text>
              </View>

              {/* Total Order Amount */}
              <View className="flex-1 px-2 border-r border-slate-800">
                <Text className="text-slate-400 text-[11px] font-semibold mb-1" numberOfLines={1}>
                  Total Amount
                </Text>
                <Text className="text-emerald-400 text-lg font-black tracking-tight" numberOfLines={1}>
                  {`₹${parseFloat(dashboard?.total_order_amount || '0').toFixed(2)}`}
                </Text>
              </View>

              {/* Due Amount */}
              <View className="flex-1 pl-2">
                <Text className="text-slate-400 text-[11px] font-semibold mb-1" numberOfLines={1}>
                  Due Amount
                </Text>
                <Text className="text-red-400 text-lg font-black tracking-tight" numberOfLines={1}>
                  {`₹${parseFloat(dashboard?.due_amount || '0').toFixed(2)}`}
                </Text>
              </View>
            </View>
          </View>

          {/* High-End Modern Action Banner */}
          <Pressable
            onPress={() => router.push('/(tabs)/explore' as any)}
            className="bg-emerald-900 rounded-3xl p-4 flex-row items-center justify-between shadow-xl mb-6 border border-emerald-500/40 relative overflow-hidden active:opacity-95"
          >
            <View className="absolute inset-0 bg-emerald-800/40" />

            <View className="flex-row items-center flex-1 pr-3 relative z-10">
              <View className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center mr-3.5 border border-white/20">
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center space-x-2 mb-0.5 gap-2">
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
                  className={`flex-row items-center justify-between p-3 ${index !== dashboard.latest_orders.length - 1 ? 'border-b border-slate-100' : ''}`}
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

          {/* Catalog Categories Showcase */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-slate-900 text-xs font-black uppercase tracking-wider">
              Featured Categories
            </Text>
            <Pressable onPress={() => router.replace('/(tabs)/explore' as any)}>
              <Text className="text-emerald-700 text-xs font-bold">Explore More</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {categories.length > 0 ? (
              categories.slice(0, 4).map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => router.push('/(tabs)/explore' as any)}
                  className="w-[48%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs mb-4 active:opacity-90"
                >
                  {category.img_path ? (
                    <Image
                      source={{ uri: category.img_path }}
                      className="w-full h-32 rounded-xl bg-slate-100 mb-3"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-32 rounded-xl bg-slate-100 mb-3 items-center justify-center">
                      <Ionicons name="grid-outline" size={24} color="#CBD5E1" />
                    </View>
                  )}
                  <Text numberOfLines={1} className="text-slate-900 text-xs font-bold tracking-tight mb-1">
                    {category.title}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-slate-100">
                    <Text className="text-slate-400 text-[11px] font-medium">Items</Text>
                    <Text className="text-emerald-700 text-xs font-semibold">
                      {category.products_count ?? 0} Available
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View className="w-full py-6 items-center bg-white rounded-2xl border border-slate-200/80">
                <Text className="text-slate-400 text-xs font-medium">No categories available</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}