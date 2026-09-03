import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Order, orderService } from '@/services/order.service';

export default function OrdersScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const isTablet = screenWidth >= 768;
  const maxContentWidth = isTablet ? 720 : screenWidth;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await orderService.getMyOrders();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownloadReceipt = async (order: Order) => {
    try {
      setIsDownloading(true);
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', Arial, sans-serif; padding: 30px; color: #1e293b; }
              .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
              .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; }
              .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
              .meta-table { width: 100%; margin-bottom: 20px; font-size: 12px; }
              .meta-table td { padding: 4px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
              .items-table th { background: #f8fafc; text-align: left; padding: 8px; border-bottom: 1px solid #cbd5e1; }
              .items-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
              .total-section { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">ORDER RECEIPT</h1>
              <div class="subtitle">Order #${order.order_number}</div>
            </div>
            <table class="meta-table">
              <tr><td><strong>Date:</strong> ${order.order_date}</td><td style="text-align: right;"><strong>Status:</strong> ${order.status.toUpperCase()}</td></tr>
              <tr><td><strong>Payment Mode:</strong> ${order.mode_of_payment.toUpperCase()}</td><td style="text-align: right;"><strong>User ID:</strong> #${order.user_id}</td></tr>
            </table>
            <table class="items-table">
              <thead>
                <tr><th>Item</th><th>Pack Size</th><th>Qty</th><th style="text-align: right;">Amount</th></tr>
              </thead>
              <tbody>
                ${order.order_details
                  .map(
                    (d) => `
                  <tr>
                    <td>${d.product_name}</td>
                    <td>${d.pack_size}</td>
                    <td>${d.qty}</td>
                    <td style="text-align: right;">Rs. ${(parseFloat(d.cost_price) * d.qty).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <div class="total-section">
              Total Amount: Rs. ${parseFloat(order.amount).toFixed(2)}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Failed to generate receipt PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'completed' || s === 'delivered') {
      return (
        <View className="bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            {status}
          </Text>
        </View>
      );
    } else if (s === 'pending') {
      return (
        <View className="bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          <Text className="text-amber-700 text-[10px] font-bold uppercase tracking-wider">
            {status}
          </Text>
        </View>
      );
    }
    return (
      <View className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
        <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          {status}
        </Text>
      </View>
    );
  };

  const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
    const totalItems = item.order_details?.reduce((sum, d) => sum + d.qty, 0) || 0;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 150, delay: Math.min(index * 30, 200) }}
        className="w-full self-center mb-3"
        style={{ maxWidth: maxContentWidth }}
      >
        <Pressable
          onPress={() => setSelectedOrder(item)}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs active:bg-slate-50"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                <Ionicons name="receipt-outline" size={18} color="#0F172A" />
              </View>
              <View>
                <Text className="text-slate-900 text-xs font-bold tracking-tight">
                  {item.order_number}
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  {item.order_date} • {totalItems} item{totalItems !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {getStatusBadge(item.status)}
          </View>

          <View className="h-px bg-slate-100 my-2.5" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-slate-500 text-xs mr-1.5">Payment:</Text>
              <Text className="text-slate-800 text-xs font-semibold uppercase">
                {item.mode_of_payment}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-500 text-xs mr-1.5">Total:</Text>
              <Text className="text-emerald-700 text-sm font-bold">
                ₹{parseFloat(item.amount).toFixed(2)}
              </Text>
            </View>
          </View>
        </Pressable>
      </MotiView>
    );
  };

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar style="light" backgroundColor="#0B132B" />

      {/* Header with proper statusbar padding */}
      <View className="bg-[#0B132B] pt-14 pb-4 px-4 border-b border-slate-800">
        <View
          style={{ width: '100%', maxWidth: maxContentWidth }}
          className="self-center flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center mr-3 active:bg-slate-700"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>
            <View>
              <Text className="text-white text-base font-bold tracking-tight">
                My Orders
              </Text>
              <Text className="text-slate-400 text-[11px]">
                Track your active and past purchases
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#059669" />
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center justify-center px-8 py-12 self-center" style={{ maxWidth: maxContentWidth }}>
            <View className="w-16 h-16 rounded-full bg-slate-200/80 items-center justify-center mb-3 border border-slate-300">
              <Ionicons name="receipt-outline" size={30} color="#64748B" />
            </View>
            <Text className="text-slate-900 text-base font-bold mb-1">
              No orders found
            </Text>
            <Text className="text-slate-500 text-xs text-center leading-5 mb-5 max-w-[240px]">
              You haven&apos;t placed any orders yet. Start shopping to see them here.
            </Text>
            <Pressable
              onPress={() => router.replace('/(tabs)/explore' as any)}
              className="bg-[#0B132B] px-6 py-3 rounded-xl flex-row items-center active:bg-slate-800"
            >
              <Text className="text-white text-xs font-bold mr-2">
                Start Shopping
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#FFF" />
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor="#059669"
            />
          }
        />
      )}

      {/* Receipt Bottom Sheet Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 150 }}
            className="absolute inset-0 z-50 justify-end bg-slate-950/60"
          >
            <Pressable className="flex-1" onPress={() => setSelectedOrder(null)} />

            <MotiView
              from={{ translateY: 250 }}
              animate={{ translateY: 0 }}
              exit={{ translateY: 250 }}
              transition={{ type: 'timing', duration: 200 }}
              className="bg-white rounded-t-[28px] p-6 max-h-[85%] w-full self-center shadow-2xl border-t border-slate-200"
              style={{ maxWidth: isTablet ? 720 : screenWidth }}
            >
              <View className="w-10 h-1 bg-slate-300 rounded-full self-center mb-4" />

              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    Order Receipt
                  </Text>
                  <Text className="text-slate-900 text-base font-bold">
                    {selectedOrder.order_number}
                  </Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
                >
                  <Ionicons name="close" size={18} color="#0F172A" />
                </Pressable>
              </View>

              {/* Receipt Summary Box */}
              <View className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200/80 flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">Date</Text>
                  <Text className="text-slate-800 text-xs font-medium mt-0.5">{selectedOrder.order_date}</Text>
                </View>
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">Payment</Text>
                  <Text className="text-slate-800 text-xs font-medium uppercase mt-0.5">{selectedOrder.mode_of_payment}</Text>
                </View>
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">Status</Text>
                  <View className="mt-0.5">{getStatusBadge(selectedOrder.status)}</View>
                </View>
              </View>

              <Text className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">
                Items ({selectedOrder.order_details?.length || 0})
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {selectedOrder.order_details?.map((detail) => (
                  <View
                    key={detail.id}
                    className="flex-row items-center justify-between py-2.5 border-b border-slate-100"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="w-9 h-9 rounded-lg bg-slate-100 items-center justify-center mr-2.5 border border-slate-200">
                        <Ionicons name="cube-outline" size={16} color="#64748B" />
                      </View>
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-slate-900 text-xs font-bold">
                          {detail.product_name}
                        </Text>
                        <Text className="text-slate-500 text-[11px] mt-0.5">
                          {detail.pack_size} • Qty: {detail.qty}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-emerald-700 text-xs font-bold">
                      ₹{(parseFloat(detail.cost_price) * detail.qty).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View className="mt-4 pt-3 border-t border-slate-200 flex-row items-center justify-between mb-4">
                  <Text className="text-slate-900 text-sm font-bold">Total Amount</Text>
                  <Text className="text-emerald-700 text-base font-bold">
                    ₹{parseFloat(selectedOrder.amount).toFixed(2)}
                  </Text>
                </View>

                {/* Download PDF Receipt Button */}
                <Pressable
                  onPress={() => handleDownloadReceipt(selectedOrder)}
                  disabled={isDownloading}
                  className="bg-[#0B132B] py-3.5 rounded-xl flex-row items-center justify-center active:bg-slate-800 shadow-xs"
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text className="text-white text-xs font-bold">Download Receipt (PDF)</Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}