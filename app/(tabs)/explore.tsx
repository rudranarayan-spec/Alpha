import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryService } from '@/services/category.service';
import { useCartStore } from '@/store/cart.store';
import { Category, Product } from '@/types/category.types';

import { CategoryTabs } from '@/components/explore/CategoryTabs';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ProductCard } from '@/components/explore/ProductCard';
import { StatusBar } from 'expo-status-bar';
import { toast } from 'sonner-native';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const dueAmount = useCartStore((state) => state.dueAmount);

  // Cart Store Selectors
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalItemsCount = useCartStore((state) => state.getTotalItemsCount);
  const [processingProductIds, setProcessingProductIds] = useState<Record<number, boolean>>({});

  const isTablet = screenWidth >= 768;
  const numColumns = isTablet ? 3 : 2;

  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Dynamic card width calculation
  const cardWidth = useMemo(() => {
    const horizontalPadding = 28;
    const gap = isTablet ? 24 : 12;
    return (screenWidth - horizontalPadding - gap) / numColumns;
  }, [screenWidth, isTablet, numColumns]);

  // 1. FETCH ALL CATEGORIES
  const {
    data: categories = [],
    isPending: isPendingCategories,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Resolve active slug immediately without useEffect delay
  const activeSlug = useMemo(() => {
    if (selectedSlug && categories.some((c) => c.slug === selectedSlug)) {
      return selectedSlug;
    }
    return categories[0]?.slug ?? '';
  }, [categories, selectedSlug]);

  // 2. FETCH ACTIVE CATEGORY DETAILS WITH PRODUCTS
  const {
    data: activeCategory,
    isFetching: isFetchingProducts,
    refetch: refetchActiveCategory,
  } = useQuery<Category>({
    queryKey: ['category', activeSlug],
    queryFn: () => CategoryService.getCategoryBySlug(activeSlug),
    enabled: Boolean(activeSlug),
    staleTime: 1000 * 60 * 5,
  });

  const currentProducts: Product[] = useMemo(
    () => activeCategory?.products ?? [],
    [activeCategory]
  );

  // 3. SEARCH FILTER
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return currentProducts;
    const q = searchQuery.toLowerCase();
    return currentProducts.filter(
      (p) =>
        p.product_name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.hsn?.toLowerCase().includes(q) ||
        p.pack_size?.toLowerCase().includes(q)
    );
  }, [currentProducts, searchQuery]);

  const activeCategoryTitle = useMemo(
    () => categories.find((c) => c.slug === activeSlug)?.title ?? 'Catalog',
    [categories, activeSlug]
  );

  const totalCartItems = getTotalItemsCount();

  const subtotal = useMemo(() => {
    return Object.values(cartItems).reduce((sum, cartItem) => {
      const priceStr = cartItem.product.selling_price ?? cartItem.product.mrp ?? '0';
      const price = parseFloat(priceStr) || 0;
      return sum + price * cartItem.quantity;
    }, 0);
  }, [cartItems]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchActiveCategory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCategories, refetchActiveCategory]);

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setSearchQuery('');
  }, []);

  // INITIAL LOADING CHECK (Placed AFTER all hooks are declared)
  if (isPendingCategories && categories.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-slate-400 text-xs font-semibold mt-3">
          Loading catalog...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 relative">
      <StatusBar
        style={colorScheme === 'light' ? 'light' : 'dark'}
        backgroundColor="#0B132B"
      />

      <ExploreHeader
        insets={insets}
        totalCartItems={totalCartItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategoryTitle={activeCategoryTitle}
      />

      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selectedSlug={activeSlug}
          onSelectCategory={handleSelectCategory}
        />
      )}

      <View className="flex-1 px-3.5 pt-3">
        <View className="flex-row justify-between items-center mb-2.5 px-0.5">
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            {activeCategoryTitle}
          </Text>
          <Text className="text-emerald-700 text-[10px] font-extrabold">
            {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {isFetchingProducts && !isRefreshing && currentProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#059669" />
            <Text className="text-slate-400 text-xs mt-2 font-medium">
              Loading products...
            </Text>
          </View>
        ) : (
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={activeSlug}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -6 }}
              transition={{ type: 'timing', duration: 180 }}
              className="flex-1"
            >
              {filteredProducts.length === 0 ? (
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: 100,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#059669']}
                      tintColor="#059669"
                    />
                  }
                >
                  <View className="items-center justify-center p-8">
                    <View className="w-14 h-14 rounded-full bg-white items-center justify-center mb-3 border border-slate-200">
                      <Ionicons name="search-outline" size={24} color="#CBD5E1" />
                    </View>
                    <Text className="text-slate-800 text-sm font-bold mb-1">
                      {searchQuery ? 'No results found' : 'No products available'}
                    </Text>
                    <Text className="text-slate-400 text-xs text-center leading-4">
                      {searchQuery
                        ? `Nothing matched "${searchQuery}".`
                        : 'Products for this category will appear here soon.'}
                    </Text>
                    {searchQuery.length > 0 && (
                      <Pressable
                        onPress={() => setSearchQuery('')}
                        className="mt-4 bg-[#0B132B] px-5 py-2.5 rounded-xl"
                      >
                        <Text className="text-white text-xs font-bold">Clear search</Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              ) : (
                <FlatList
                  data={filteredProducts}
                  key={`grid-${numColumns}`}
                  numColumns={numColumns}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  keyExtractor={(item) => item.id.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#059669']}
                      tintColor="#059669"
                    />
                  }
                  renderItem={({ item }: { item: Product }) => {
                    const currentQty = cartItems[item.id]?.quantity ?? 0;
                    const isProcessing = processingProductIds[item.id];

                    return (
                      <ProductCard
                        product={item}
                        qty={currentQty}
                        disabled={isProcessing}
                        onAddPress={async () => {
                          if (isProcessing || currentQty > 0) return;
                          if (dueAmount > 0) {
                            toast.warning("Outstanding Dues", {
                              description: `You have an active due amount of ₹${dueAmount.toFixed(2)}. Please clear it to place new orders.`,
                              duration: 4000,
                            });
                            return;
                          }
                          if (item.stock <= 0) {
                            toast.error('This item is out of stock!');
                            return;
                          }

                          setProcessingProductIds(prev => ({ ...prev, [item.id]: true }));
                          try {
                            updateQuantity(item, 1);
                          } finally {
                            setTimeout(() => {
                              setProcessingProductIds(prev => ({ ...prev, [item.id]: false }));
                            }, 300);
                          }
                        }}
                        cardWidth={cardWidth}
                      />
                    );
                  }}
                />
              )}
            </MotiView>
          </AnimatePresence>
        )}
      </View>

      {/* SWIGGY-STYLE FLOATING CART BAR */}
      {totalCartItems > 0 && (
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-transparent pointer-events-box-none"
        >
          <Pressable
            onPress={() => router.push('/cart' as any)}
            className="bg-[#0B132B] flex-row items-center justify-between px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700/50"
          >
            <View className="flex-row items-center gap-2">
              <View className="bg-emerald-600 px-2.5 py-1 rounded-lg">
                <Text className="text-white text-xs font-black">
                  {totalCartItems} {totalCartItems === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
              </View>
              <View>
                <Text className="text-white text-xs font-bold">
                  ₹{subtotal.toFixed(2)}
                </Text>
                <Text className="text-slate-400 text-[10px]">
                  Extra charges may apply
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-1.5 bg-emerald-700 px-4 py-2 rounded-xl">
              <Text className="text-white text-xs font-bold">View Cart</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}