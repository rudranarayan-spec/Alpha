import { Ionicons } from '@expo/vector-icons';
import { MotiText, MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

// Category Metadata
const CATEGORY_TABS = [
  { id: 'all', label: 'All Essentials', icon: 'grid-outline' },
  { id: 'spices', label: 'Spices', icon: 'nutrition-outline' },
  { id: 'bio', label: 'Biodegradable Products', icon: 'leaf-outline' },
];

// Curated Mock Product Data
const MOCK_PRODUCTS = [
  {
    id: 'sp-1',
    name: 'Pure Turmeric (Haldi) Powder',
    categoryKey: 'spices',
    categoryLabel: 'Spices',
    price: 140,
    weight: '500g Pack',
    rating: 4.9,
    reviews: 128,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80',
  },
  {
    id: 'bio-1',
    name: 'Biodegradable Carrier Bags',
    categoryKey: 'bio',
    categoryLabel: 'Biodegradable',
    price: 299,
    weight: 'Pack of 50',
    rating: 4.8,
    reviews: 94,
    badge: '100% Eco',
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=500&q=80',
  },
  {
    id: 'sp-2',
    name: 'Premium Red Chilli (Mirchi) Powder',
    categoryKey: 'spices',
    categoryLabel: 'Spices',
    price: 180,
    weight: '500g Pack',
    rating: 4.9,
    reviews: 210,
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80',
  },
  {
    id: 'bio-2',
    name: 'Food-Grade Butter Paper Roll',
    categoryKey: 'bio',
    categoryLabel: 'Biodegradable',
    price: 199,
    weight: '20 Meters Roll',
    rating: 4.7,
    reviews: 56,
    badge: 'Non-Toxic',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80',
  },
  {
    id: 'bio-3',
    name: 'Areca Palm Leaf Plates',
    categoryKey: 'bio',
    categoryLabel: 'Biodegradable',
    price: 349,
    weight: 'Pack of 25 (10-inch)',
    rating: 4.9,
    reviews: 312,
    badge: 'Compostable',
    image: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=500&q=80',
  },
  {
    id: 'sp-3',
    name: 'Organic Coriander (Dhania) Powder',
    categoryKey: 'spices',
    categoryLabel: 'Spices',
    price: 130,
    weight: '500g Pack',
    rating: 4.8,
    reviews: 87,
    badge: 'Farm Fresh',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80',
  },
];

// Promotional Mock Banners
const MOCK_PROMOS = [
  {
    id: 'p1',
    title: 'Pure Farm Spices',
    subtitle: 'Zero Adulteration Haldi & Mirchi',
    tag: 'ORGANIC GUARANTEE',
    bg: 'bg-[#0B132B]',
    accent: 'text-amber-400',
    buttonBg: 'bg-amber-400',
    buttonText: 'text-[#0B132B]',
  },
  {
    id: 'p2',
    title: 'Sustainable Packaging',
    subtitle: 'Eco Bags, Butter Paper & Palm Plates',
    tag: 'PLASTIC FREE',
    bg: 'bg-emerald-900',
    accent: 'text-emerald-300',
    buttonBg: 'bg-emerald-400',
    buttonText: 'text-emerald-950',
  },
];

export default function AlphaHomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartCount, setCartCount] = useState<number>(3);

  // Filter items based on active Tab + Search input
  const filteredProducts = MOCK_PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.categoryKey === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" animated />

      <View className="w-full h-full bg-slate-50 relative">
        {/* 1. TOP NAVBAR */}
        <View className="bg-[#0B132B] pt-14 pb-4 px-6 md:px-12 z-10">
          <View className="flex-row justify-between items-center max-w-7xl mx-auto w-full">
            <MotiView
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-black tracking-tight">
                  Alpha
                </Text>
                <View className="w-2 h-2 rounded-full bg-emerald-400 ml-1 mt-2" />
              </View>
              <Pressable className="flex-row items-center mt-0.5">
                <Ionicons name="location-sharp" size={12} color="#10B981" />
                <Text className="text-slate-300 text-xs font-semibold ml-1">
                  Deliver to Odisha, IN
                </Text>
                <Ionicons name="chevron-down" size={12} color="#94A3B8" className="ml-1" />
              </Pressable>
            </MotiView>

            {/* HEADER ACTIONS */}
            <View className="flex-row items-center gap-x-3">
              <Pressable className="bg-white/10 p-2.5 rounded-2xl border border-white/10 active:scale-95">
                <Ionicons name="notifications-outline" size={20} color="white" />
              </Pressable>

              <Pressable className="bg-emerald-600 px-3.5 py-2.5 rounded-2xl flex-row items-center border border-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/30">
                <Ionicons name="bag-handle-outline" size={18} color="white" />
                <View className="bg-white px-1.5 py-0.5 rounded-full ml-2">
                  <Text className="text-[#0B132B] text-xs font-black">
                    {cartCount}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* HERO HEADER & SEARCH BANNER */}
          <View className="bg-[#0B132B] pb-10 px-6 md:px-12 md:pb-14 rounded-b-[40px] shadow-2xl shadow-slate-900/40">
            <View className="max-w-7xl mx-auto w-full">
              <MotiText
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="text-white text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight pt-2"
              >
                Organic Spices &{"\n"}
                <Text className="text-emerald-400">Eco-Friendly Essentials</Text>
              </MotiText>

              {/* SEARCH BAR */}
              <View className="flex-row items-center bg-slate-900/80 border border-white/10 h-14 rounded-2xl px-4 md:max-w-2xl shadow-inner">
                <Ionicons name="search-sharp" size={20} color="#94A3B8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Haldi, Mirchi, Eco Bags, Plates..."
                  placeholderTextColor="#64748B"
                  className="flex-1 ml-3 font-semibold text-white text-sm"
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                ) : (
                  <View className="bg-white/10 p-2 rounded-xl">
                    <Ionicons name="options-outline" size={16} color="white" />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* MAIN CONTAINER STREAM */}
          <View className="w-full max-w-7xl mx-auto px-6 md:px-12 mt-6">
            {/* 2. PROMOTIONAL SLIDER */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-8"
              decelerationRate="fast"
              snapToInterval={316}
            >
              {MOCK_PROMOS.map((promo) => (
                <View
                  key={promo.id}
                  className={`${promo.bg} w-[300px] md:w-[420px] p-6 rounded-3xl mr-4 justify-between border border-white/10 shadow-lg`}
                >
                  <View className="self-start bg-white/10 px-3 py-1 rounded-full border border-white/10 mb-4">
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${promo.accent}`}>
                      {promo.tag}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-black tracking-tight mb-1">
                      {promo.title}
                    </Text>
                    <Text className="text-slate-300 text-xs font-medium mb-5 leading-5">
                      {promo.subtitle}
                    </Text>
                  </View>
                  <Pressable className={`${promo.buttonBg} py-2.5 px-5 rounded-xl self-start active:opacity-90`}>
                    <Text className={`${promo.buttonText} font-black text-xs`}>
                      Explore Collection
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            {/* 3. CATEGORY SELECTION TABS */}
            <View className="mb-6">
              <Text className="text-[#0B132B] text-xl font-black tracking-tight mb-4">
                Browse Categories
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setSelectedCategory(tab.id)}
                      className={`flex-row items-center px-4 py-3 rounded-2xl mr-3 border ${
                        isActive
                          ? 'bg-[#0B132B] border-[#0B132B] shadow-md shadow-slate-900/20'
                          : 'bg-white border-slate-200 active:bg-slate-100'
                      }`}
                    >
                      <Ionicons
                        name={tab.icon as any}
                        size={18}
                        color={isActive ? '#10B981' : '#64748B'}
                      />
                      <Text
                        className={`ml-2 text-xs font-bold ${
                          isActive ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. PRODUCT CATALOG GRID */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[#0B132B] text-xl font-black tracking-tight">
                Featured Catalog
              </Text>
              <Text className="text-emerald-600 text-xs font-bold">
                Showing {filteredProducts.length} Items
              </Text>
            </View>

            {filteredProducts.length === 0 ? (
              <View className="bg-white p-8 rounded-3xl border border-slate-100 items-center justify-center my-4">
                <Ionicons name="search-outline" size={36} color="#94A3B8" />
                <Text className="text-[#0B132B] font-bold text-base mt-2">
                  No products found
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                  Try searching for another keyword or category.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {filteredProducts.map((product) => (
                  <View
                    key={product.id}
                    className="w-[48%] md:w-[31%] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm justify-between"
                  >
                    {/* PRODUCT IMAGE & BADGE */}
                    <View className="relative">
                      <Image
                        source={{ uri: product.image }}
                        className="w-full h-40 bg-slate-100"
                        resizeMode="cover"
                      />
                      <View className="absolute top-3 left-3 bg-[#0B132B]/85 px-2.5 py-1 rounded-lg border border-white/10">
                        <Text className="text-emerald-400 text-[9px] font-black uppercase">
                          {product.badge}
                        </Text>
                      </View>
                      <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex-row items-center border border-slate-200">
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text className="text-slate-900 font-bold text-[10px] ml-1">
                          {product.rating}
                        </Text>
                      </View>
                    </View>

                    {/* PRODUCT DETAILS */}
                    <View className="p-4">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        {product.categoryLabel}
                      </Text>
                      <Text
                        className="text-[#0B132B] font-black text-sm tracking-tight mb-1"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text className="text-slate-500 text-xs font-medium mb-3">
                        {product.weight}
                      </Text>

                      {/* PRICE & ADD ACTION */}
                      <View className="flex-row justify-between items-center pt-2 border-t border-slate-100">
                        <View>
                          <Text className="text-[10px] text-slate-400 font-semibold uppercase">
                            Price
                          </Text>
                          <Text className="text-[#0B132B] font-black text-base">
                            ₹{product.price}
                          </Text>
                        </View>
                        <Pressable
                          onPress={handleAddToCart}
                          className="bg-emerald-600 p-2.5 rounded-xl active:scale-95 shadow-sm shadow-emerald-700/30"
                        >
                          <Ionicons name="add" size={18} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}