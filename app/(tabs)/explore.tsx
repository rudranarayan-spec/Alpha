import { CategoryService } from '@/services/category.service';
import { Category, Product } from '@/types/category.types';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

// Dynamic Icon Resolver for Categories
const getCategoryIcon = (slug: string): string => {
  const iconMap: Record<string, string> = {
    spices: 'pepper-hot',
    'eco-friendly': 'leaf',
    biodegradable: 'leaf',
    'biodegradable-sustainable-products': 'leaf',
    'organic-essentials': 'seedling',
  };
  return iconMap[slug] || 'store';
};

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});

  // 1. FETCH CATEGORIES USING CATEGORY SERVICE
  const {
    data: rawCategories = [],
    isLoading: isLoadingCategories,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Set default active category tab once categories load
  useEffect(() => {
    if (rawCategories.length > 0 && !selectedSlug) {
      setSelectedSlug(rawCategories[0].slug);
    }
  }, [rawCategories, selectedSlug]);

  // 2. FETCH ACTIVE CATEGORY DETAILS (INCLUDING PRODUCTS) BY SLUG
  const { data: activeCategoryData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['category', selectedSlug],
    queryFn: () => CategoryService.getCategoryBySlug(selectedSlug),
    enabled: !!selectedSlug,
  });

  // Extract products array from active category data
  const currentProducts = useMemo(() => {
    return activeCategoryData?.products || [];
  }, [activeCategoryData]);

  // 3. SEARCH FILTER ENGINE
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return currentProducts;
    const query = searchQuery.toLowerCase();
    return currentProducts.filter(
      (product: Product) =>
        product.title?.toLowerCase().includes(query) ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [currentProducts, searchQuery]);

  const activeCategoryName = useMemo(() => {
    const found = rawCategories.find((cat) => cat.slug === selectedSlug);
    return found ? found.title : 'Catalog';
  }, [rawCategories, selectedSlug]);

  // Helper: Cart Quantity Adjuster
  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[productId] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: updated };
    });
  };

  if (isLoadingCategories) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-slate-400 text-xs font-semibold mt-3">
          Loading catalog categories...
        </Text>
      </View>
    );
  }

  if (isCategoryError || rawCategories.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="cloud-offline-outline" size={48} color="#94A3B8" />
        <Text className="text-[#0B132B] font-bold text-base mt-4">
          Failed to Sync Catalog
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          Please check your network connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="w-full h-full bg-slate-50 relative flex-1">
        {/* HEADER & SEARCH BAR */}
        <View className="bg-[#0B132B] pt-14 pb-5 px-5 md:px-12 rounded-b-[36px] shadow-xl shadow-slate-900/20 z-10">
          <View className="max-w-7xl mx-auto w-full">
            <View className="mb-4">
              <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Explore Catalog
              </Text>
              <Text className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                Pure organic spices & eco-friendly essentials
              </Text>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-white/10 border border-white/15 h-12 rounded-2xl px-4 max-w-2xl">
              <Ionicons name="search-sharp" size={18} color="#94A3B8" />
              <TextInput
                placeholder={`Search in ${activeCategoryName}...`}
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 font-semibold text-white text-xs"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* TWO-COLUMN LAYOUT */}
        <View className="flex-1 max-w-7xl w-full mx-auto flex-row">
          {/* LEFT SIDEBAR: CATEGORY NAVIGATION */}
          <View className="w-24 md:w-32 bg-slate-50 border-r border-slate-200/60">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
            >
              {rawCategories.map((category: Category) => {
                const isSelected = selectedSlug === category.slug;
                const itemCount = category.products ? category.products.length : 0;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setSelectedSlug(category.slug);
                      setSearchQuery('');
                    }}
                    className={`items-center justify-center py-4 px-1 mb-1 relative ${
                      isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isSelected && (
                      <MotiView
                        from={{ opacity: 0, scaleY: 0.3 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full"
                      />
                    )}

                    <View
                      className={`w-11 h-11 rounded-xl items-center justify-center mb-1.5 ${
                        isSelected ? 'bg-emerald-50' : 'bg-slate-200/50'
                      }`}
                    >
                      <FontAwesome6
                        name={getCategoryIcon(category.slug)}
                        size={16}
                        color={isSelected ? '#059669' : '#64748B'}
                      />
                    </View>

                    <Text
                      className={`text-[10px] md:text-xs text-center font-bold tracking-tight px-1 ${
                        isSelected ? 'text-[#0B132B]' : 'text-slate-500'
                      }`}
                      numberOfLines={2}
                    >
                      {category.title}
                    </Text>

                    {itemCount > 0 && (
                      <View className="bg-slate-200/60 px-1.5 py-0.5 rounded-full mt-1">
                        <Text className="text-[8px] text-slate-600 font-bold">
                          {itemCount}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* RIGHT PANEL: PRODUCT GRID */}
          <View className="flex-1 bg-white px-3 md:px-8 pt-5">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                {activeCategoryName}
              </Text>
              <Text className="text-emerald-600 text-[10px] font-bold">
                {filteredProducts.length} Items
              </Text>
            </View>

            {isLoadingProducts ? (
              <View className="flex-1 items-center justify-center pb-20">
                <ActivityIndicator size="small" color="#059669" />
              </View>
            ) : (
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={selectedSlug}
                  from={{ opacity: 0, translateY: 6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -6 }}
                  transition={{ type: 'timing', duration: 180 }}
                  className="flex-1"
                >
                  {filteredProducts.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-12 px-4">
                      <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                      <Text className="text-slate-400 text-xs font-medium text-center mt-2">
                        {searchQuery
                          ? `No products match "${searchQuery}"`
                          : 'No products available in this category.'}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredProducts}
                      key={IS_TABLET ? 'tablet-grid' : 'mobile-grid'}
                      numColumns={IS_TABLET ? 3 : 2}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 100 }}
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }: { item: Product }) => {
                        const qty = cartQuantities[item.id] || 0;
                        const itemTitle = item.title || item.name || 'Product';
                        const itemImage = item.img_path || item.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=300';
                        const itemPrice = item.price || item.basePrice || 0;

                        return (
                          <Pressable
                            onPress={() => router.push(`/services/${item.slug || item.id}`)}
                            className="w-[48.5%] md:w-[31.5%] bg-white rounded-2xl p-2.5 mb-4 border border-slate-100 shadow-sm items-start justify-between"
                          >
                            {/* Product Image */}
                            <View className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative">
                              <Image
                                source={{ uri: itemImage }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            </View>

                            {/* Product Info */}
                            <Text
                              className="text-[#0B132B] text-xs font-black tracking-tight"
                              numberOfLines={1}
                            >
                              {itemTitle}
                            </Text>

                            <Text className="text-slate-400 text-[10px] font-semibold mt-0.5">
                              ₹{itemPrice}
                            </Text>

                            {/* Add / Quantity Stepper Button */}
                            <View className="w-full mt-2.5">
                              {qty > 0 ? (
                                <View className="flex-row items-center justify-between bg-slate-100 rounded-xl px-2 py-1 border border-slate-200 w-full">
                                  <Pressable
                                    onPress={() => handleUpdateQuantity(item.id, -1)}
                                    hitSlop={6}
                                    className="w-5 h-5 bg-white rounded-md items-center justify-center"
                                  >
                                    <Ionicons name="remove" size={12} color="#0B132B" />
                                  </Pressable>
                                  <Text className="text-xs font-black text-[#0B132B]">
                                    {qty}
                                  </Text>
                                  <Pressable
                                    onPress={() => handleUpdateQuantity(item.id, 1)}
                                    hitSlop={6}
                                    className="w-5 h-5 bg-emerald-600 rounded-md items-center justify-center"
                                  >
                                    <Ionicons name="add" size={12} color="white" />
                                  </Pressable>
                                </View>
                              ) : (
                                <Pressable
                                  onPress={() => handleUpdateQuantity(item.id, 1)}
                                  className="bg-emerald-50 border border-emerald-200/60 py-1.5 rounded-xl w-full items-center active:bg-emerald-100"
                                >
                                  <Text className="text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                                    + Add
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          </Pressable>
                        );
                      }}
                    />
                  )}
                </MotiView>
              </AnimatePresence>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}