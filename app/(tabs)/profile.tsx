import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api/client';
import { toast } from 'sonner-native';

interface UserProfile {
  id: number;
  billing_name: string;
  email: string;
  phone: string;
  email_verified_at: string | null;
  role_id: string;
  billing_address: string | null;
  gst_number: string | null;
  due_amount: string;
  order_count: number;
  total_order_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const { logout, token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const isTablet = width >= 768;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch User Profile from GET baseUrl/user using Axios client & React Query
  const { data: user, isLoading, isError, refetch } = useQuery<UserProfile>({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      const response = await api.get('/user');
      return response.data?.user || response.data?.data || response.data;
    },
    enabled: Boolean(token),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/logout');
    },
    onSettled: async () => {
      queryClient.clear();
      await logout();
    },
  });

  const handleOpenDialer = async () => {
    const phoneNumber = "tel:8260348598";

    try {
        const supported = await Linking.canOpenURL(phoneNumber);

        if (supported) {
            await Linking.openURL(phoneNumber);
        } else {
            toast.error("Not Supported", {
                description: "Your device does not support making phone calls.",
            });
        }
    } catch (error) {
        console.error("Failed to open dialer:", error);
        toast.error("Error", {
            description: "Could not open phone dialer.",
        });
    }
};

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const displayName = user?.billing_name || (token ? 'Loading Profile...' : 'Guest User');
  const displayEmail = user?.email || (token ? 'Please wait...' : 'Log in to sync account');
  const avatarUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" animated />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#EE9F19"
            colors={['#EE9F19']}
          />
        }
      >
        {/* HERO BRAND HEADER */}
        <View
          className="bg-[#FDFBF7] px-6 rounded-b-[48px] border-b border-[#1C3516]/10 shadow-sm"
          style={{ paddingTop: insets.top + 24, paddingBottom: isTablet ? 56 : 44 }}
        >
          <View className="max-w-4xl mx-auto w-full flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="relative shadow-md">
                <Image
                  source={{ uri: avatarUri }}
                  className="rounded-2xl bg-slate-200 border-2 border-[#1C3516]/20"
                  style={{ width: isTablet ? 80 : 64, height: isTablet ? 80 : 64 }}
                />
                {Boolean(token) && (
                  <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#EE9F19] rounded-full border-2 border-[#FDFBF7]" />
                )}
              </View>

              <View className="flex-1 ml-4 md:ml-6 pr-2">
                {isLoading && Boolean(token) ? (
                  <ActivityIndicator size="small" color="#1C3516" style={{ alignSelf: 'flex-start' }} />
                ) : isError ? (
                  <Pressable onPress={() => refetch()}>
                    <Text className="text-[#EE9F19] font-medium text-xs">
                      Failed to load profile. Tap to retry.
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <Text
                      className="text-[#1C3516] font-black tracking-tight"
                      style={{ fontSize: isTablet ? 24 : 18 }}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    <Text
                      className="text-[#1C3516]/60 font-medium mt-1"
                      style={{ fontSize: isTablet ? 14 : 12 }}
                      numberOfLines={1}
                    >
                      {displayEmail}
                    </Text>
                    {/* Add GSTIN line here */}
                    {user?.gst_number && (
                      <Text
                        className="text-[#EE9F19] font-bold mt-1"
                        style={{ fontSize: isTablet ? 12 : 10 }}
                        numberOfLines={1}
                      >
                        GSTIN: {user.gst_number}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            {Boolean(token) && (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/profile/edit',
                    params: {
                      billing_name: user?.billing_name || '',
                      phone: user?.phone || '',
                      billing_address: user?.billing_address || '',
                    },
                  });
                }}
                className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-[#1C3516]/15 shadow-sm active:opacity-70"
              >
                <Ionicons name="create-outline" size={18} color="#1C3516" />
              </Pressable>
            )}
          </View>
        </View>

        {/* MAIN CONTAINER */}
        <View className="max-w-4xl mx-auto w-full px-5 -mt-6">
          {/* STATS ROW (ORDERS & DUE AMOUNT) */}
          <View className="bg-white rounded-3xl p-4 sm:p-5 flex-row justify-between items-center shadow-sm border border-[#1C3516]/10">
            {/* Orders Column */}
            <Pressable
              onPress={() => router.push('/(tabs)/orders')}
              className="flex-1 items-center py-1 border-r border-[#1C3516]/10 px-1"
            >
              <Text className="text-[#1C3516] text-base md:text-xl font-black tracking-tight text-center">
                {user?.order_count ?? '0'} Orders
              </Text>
              <Text className="text-[#1C3516]/40 text-[10px] md:text-xs font-bold uppercase mt-1 tracking-wider text-center">
                History
              </Text>
            </Pressable>

            {/* Total Order Amount Column */}
            <View className="flex-1 items-center py-1 px-1">
              <Text className="text-[#1C3516] text-base md:text-xl font-black tracking-tight text-center">
                ₹{user?.total_order_amount ? Number(user.total_order_amount).toFixed(2) : '0.00'}
              </Text>
              <Text className="text-[#1C3516]/40 text-[10px] md:text-xs font-bold uppercase mt-1 tracking-wider text-center" numberOfLines={1}>
                Total Amount
              </Text>
            </View>

            {/* Due Amount Column */}
            <View className="flex-1 items-center py-1 px-1">
              <Text className="text-[#EE9F19] text-base md:text-xl font-black tracking-tight text-center">
                ₹{user?.due_amount ? Number(user.due_amount).toFixed(2) : '0.00'}
              </Text>
              <Text className="text-[#1C3516]/40 text-[10px] md:text-xs font-bold uppercase mt-1 tracking-wider text-center">
                Due Amount
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/explore')}
            className="w-full h-14 bg-[#1C3516] active:bg-[#1C3516]/90 rounded-2xl flex-row items-center justify-center shadow-md shadow-[#1C3516]/20 mb-2 mt-2"
          >
            <Ionicons name="add-circle-outline" size={20} color="#EE9F19" style={{ marginRight: 8 }} />
            <Text className="text-[#EE9F19] font-black text-xs tracking-wider uppercase">
              Create New Order
            </Text>
          </Pressable>

          {/* ACCOUNT MANAGEMENT SECTION */}
          <Text className="text-[#1C3516]/60 font-black text-[11px] md:text-xs uppercase tracking-widest ml-2 mt-8 mb-3">
            Account Management
          </Text>

          <View className="bg-white rounded-3xl border border-[#1C3516]/10 shadow-sm overflow-hidden px-2">
            <ProfileOptionRow
              icon="bag-handle"
              iconColor="#1C3516"
              bgColor="bg-[#1C3516]/5"
              title="My Orders"
              subtitle="Track order history & invoices"
              onPress={() => router.push('/(tabs)/orders')}
              isTablet={isTablet}
            />

            <ProfileOptionRow
              icon="settings"
              iconColor="#1C3516"
              bgColor="bg-[#1C3516]/5"
              title="Settings"
              subtitle="App preferences and notifications"
              onPress={() => router.push('/profile/settings')}
              isTablet={isTablet}
              isLast
            />
          </View>

          {/* SUPPORT & LEGAL SECTION */}
          <Text className="text-[#1C3516]/60 font-black text-[11px] md:text-xs uppercase tracking-widest ml-2 mt-8 mb-3">
            Support & Legal
          </Text>

          <View className="bg-white rounded-3xl border border-[#1C3516]/10 shadow-sm overflow-hidden px-2">
            <ProfileOptionRow
              icon="headset"
              iconColor="#EE9F19"
              bgColor="bg-[#EE9F19]/10"
              title="Help & Support Desk"
              subtitle="24/7 customer service support"
              onPress={handleOpenDialer}
              isTablet={isTablet}
            />
            <ProfileOptionRow
              icon="shield-checkmark"
              iconColor="#1C3516"
              bgColor="bg-[#1C3516]/5"
              title="Privacy Policy"
              subtitle="Review data privacy guidelines"
              onPress={() => router.push('/profile/privacy-policy')}
              isTablet={isTablet}
            />
            <ProfileOptionRow
              icon="document-text"
              iconColor="#1C3516"
              bgColor="bg-[#1C3516]/5"
              title="Terms & Conditions"
              subtitle="Read platform terms of use"
              onPress={() => router.push('/profile/terms-conditions')}
              isTablet={isTablet}
              isLast
            />
          </View>

          {/* AUTHENTICATION ACTION STRIP */}
          <View className="mt-10 px-1">
            {Boolean(token) ? (
              <Pressable
                onPress={handleSignOut}
                disabled={logoutMutation.isPending}
                className="w-full h-14 bg-[#EE9F19]/10 border border-[#EE9F19]/30 rounded-2xl flex-row items-center justify-center active:bg-[#EE9F19]/20 active:scale-[0.99]"
              >
                {logoutMutation.isPending ? (
                  <ActivityIndicator color="#EE9F19" />
                ) : (
                  <>
                    <Ionicons name="log-out-outline" size={18} color="#ee4b19" />
                    <Text className="text-[#ee4b19] font-black text-sm tracking-tight ml-2">
                      Sign Out Account
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className="w-full h-14 bg-[#1C3516] rounded-2xl flex-row items-center justify-center shadow-md shadow-[#1C3516]/10 active:bg-[#1C3516]/90 active:scale-[0.99]"
              >
                <Ionicons name="log-in-outline" size={18} color="#EE9F19" />
                <Text className="text-[#EE9F19] font-black text-sm tracking-tight ml-2">
                  Log In or Register
                </Text>
              </Pressable>
            )}
            <Text className="text-center text-[#1C3516]/40 text-[10px] font-bold uppercase tracking-widest mt-6">
              Trumate • v1.2.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// PROFILE OPTION ROW COMPONENT
interface ProfileOptionRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'] | string;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isTablet: boolean;
  isLast?: boolean;
}

function ProfileOptionRow({
  icon,
  iconColor,
  bgColor,
  title,
  subtitle,
  onPress,
  isTablet,
  isLast,
}: ProfileOptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-4 px-3 active:bg-[#1C3516]/5 border-b border-[#1C3516]/10 ${
        isLast ? 'border-b-0' : ''
      }`}
    >
      <View
        className={`rounded-xl items-center justify-center ${bgColor}`}
        style={{ width: isTablet ? 48 : 40, height: isTablet ? 48 : 40 }}
      >
        <Ionicons name={icon as any} size={isTablet ? 20 : 18} color={iconColor} />
      </View>

      <View className="flex-1 ml-4 pr-4">
        <Text
          className="text-[#1C3516] font-black tracking-tight"
          style={{ fontSize: isTablet ? 15 : 13 }}
        >
          {title}
        </Text>
        <Text
          className="text-[#1C3516]/50 font-medium mt-0.5 leading-none"
          style={{ fontSize: isTablet ? 12 : 11 }}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#1C3516" />
    </Pressable>
  );
}