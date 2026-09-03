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

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();

  // Cart Store Selectors
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalItemsCount = useCartStore((state) => state.getTotalItemsCount);

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

  // Initial loading only blocks when we have zero categories fetched
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
    <View className="flex-1 bg-slate-100">
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
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

        {/* Product Loader shows inline without replacing full UI structure */}
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
                  contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
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
                  renderItem={({ item }: { item: Product }) => (
                    <ProductCard
                      product={item}
                      qty={cartItems[item.id]?.quantity ?? 0}
                      onUpdateQty={(delta) => updateQuantity(item, delta)}
                      cardWidth={cardWidth}
                    />
                  )}
                />
              )}
            </MotiView>
          </AnimatePresence>
        )}
      </View>
    </View>
  );
}