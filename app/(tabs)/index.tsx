import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// Category Metadata
const CATEGORY_TABS = [
  { id: 'all', label: 'All Essentials', icon: 'grid-outline' },
  { id: 'spices', label: 'Spices', icon: 'nutrition-outline' },
  { id: 'bio', label: 'Biodegradable Products', icon: 'leaf-outline' },
];

// Feature Guarantees Component Data
const QUICK_FEATURES = [
  { id: 'f1', title: '100% Pure', desc: 'Zero Adulteration', icon: 'shield-checkmark-sharp', color: '#10B981' },
  { id: 'f2', title: 'Eco Packaging', desc: '100% Compostable', icon: 'leaf-sharp', color: '#059669' },
  { id: 'f3', title: 'Fast Delivery', desc: 'Direct to Odisha', icon: 'flash-sharp', color: '#F59E0B' },
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
    bg: 'bg-emerald-950',
    accent: 'text-emerald-300',
    buttonBg: 'bg-emerald-400',
    buttonText: 'text-emerald-950',
  },
];

interface AlphaHomeScreenProps {
  onNavigateToCart?: () => void;
}

export default function AlphaHomeScreen({ onNavigateToCart }: AlphaHomeScreenProps) {
  const router = useRouter();
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

  const handleCartPress = () => {
    if (onNavigateToCart) {
      onNavigateToCart();
    } else {
      router.push('/cart');
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" animated />

      <View className="w-full h-full bg-slate-100 relative">
        {/* 1. TOP NAVBAR */}
        <View className="bg-[#0B132B] pt-14 pb-4 px-5 md:px-12 z-10">
          <View className="flex-row justify-between items-center max-w-7xl mx-auto w-full">
            <MotiView
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-black tracking-tight">
                  Alpha
                </Text>
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1.5 mt-2" />
              </View>

              {/* LOCATION SET TO BHUBANESWAR, ODISHA */}
              <Pressable className="flex-row items-center mt-1 bg-white/5 py-1 px-2.5 rounded-full border border-white/10 self-start">
                <Ionicons name="location-sharp" size={13} color="#10B981" />
                <Text className="text-slate-200 text-xs font-semibold ml-1.5">
                  Bhubaneswar, Odisha
                </Text>
                <Ionicons name="chevron-down" size={12} color="#94A3B8" className="ml-1" />
              </Pressable>
            </MotiView>

            {/* HEADER ACTIONS (Notification Removed, Cart Retained) */}
            <View className="flex-row items-center">
              <Pressable
                onPress={handleCartPress}
                className="bg-emerald-600 px-4 py-2.5 rounded-2xl flex-row items-center border border-emerald-500 active:scale-95 shadow-md shadow-emerald-900/40"
              >
                <Ionicons name="bag-handle-outline" size={20} color="white" />
                <View className="bg-white px-2 py-0.5 rounded-full ml-2">
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
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* HERO HEADER & SEARCH BANNER */}
          <View className="bg-[#0B132B] pb-8 px-5 md:px-12 md:pb-12 rounded-b-[36px] shadow-2xl shadow-slate-900/30">
            <View className="max-w-7xl mx-auto w-full">
              <MotiText
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="text-white text-3xl md:text-5xl font-black tracking-tight mb-5 leading-tight pt-1"
              >
                Organic Spices &{"\n"}
                <Text className="text-emerald-400">Eco Essentials</Text>
              </MotiText>

              {/* SEARCH BAR */}
              <View className="flex-row items-center bg-slate-900/90 border border-slate-700/60 h-14 rounded-2xl px-4 md:max-w-2xl shadow-inner">
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
          <View className="w-full max-w-7xl mx-auto px-5 md:px-12 mt-6">
            
            {/* PROMOTIONAL SLIDER */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
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

            {/* NEW ADDED COMPONENT: QUICK FEATURE GUARANTEES STRIP */}
            <View className="bg-white p-4 rounded-3xl border border-slate-200/80 mb-8 shadow-sm flex-row justify-between items-center">
              {QUICK_FEATURES.map((feat, index) => (
                <View key={feat.id} className={`flex-1 items-center px-1 ${index !== QUICK_FEATURES.length - 1 ? 'border-r border-slate-100' : ''}`}>
                  <View className="p-2 rounded-2xl bg-slate-50 mb-1.5">
                    <Ionicons name={feat.icon as any} size={20} color={feat.color} />
                  </View>
                  <Text className="text-[#0B132B] font-extrabold text-xs text-center">{feat.title}</Text>
                  <Text className="text-slate-400 text-[10px] font-medium text-center">{feat.desc}</Text>
                </View>
              ))}
            </View>

            {/* CATEGORY SELECTION TABS */}
            <View className="mb-6">
              <Text className="text-[#0B132B] text-xl font-black tracking-tight mb-3.5">
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
                          : 'bg-white border-slate-200/80 active:bg-slate-50'
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

            {/* PRODUCT CATALOG GRID */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[#0B132B] text-xl font-black tracking-tight">
                Featured Catalog
              </Text>
              <Text className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {filteredProducts.length} Items Available
              </Text>
            </View>

            {filteredProducts.length === 0 ? (
              <View className="bg-white p-8 rounded-3xl border border-slate-200/80 items-center justify-center my-4">
                <Ionicons name="search-outline" size={36} color="#94A3B8" />
                <Text className="text-[#0B132B] font-bold text-base mt-2">
                  No products found
                </Text>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  Try searching for another keyword or category.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {filteredProducts.map((product) => (
                  <View
                    key={product.id}
                    className="w-[48%] md:w-[31%] bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm justify-between"
                  >
                    {/* PRODUCT IMAGE & BADGE */}
                    <View className="relative">
                      <Image
                        source={{ uri: product.image }}
                        className="w-full h-40 bg-slate-100"
                        resizeMode="cover"
                      />
                      <View className="absolute top-2.5 left-2.5 bg-[#0B132B]/90 px-2.5 py-1 rounded-lg border border-white/10">
                        <Text className="text-emerald-400 text-[9px] font-black uppercase">
                          {product.badge}
                        </Text>
                      </View>
                      <View className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg flex-row items-center border border-slate-200/80 shadow-sm">
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text className="text-slate-900 font-bold text-[10px] ml-1">
                          {product.rating}
                        </Text>
                      </View>
                    </View>

                    {/* PRODUCT DETAILS */}
                    <View className="p-3.5">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        {product.categoryLabel}
                      </Text>
                      <Text
                        className="text-[#0B132B] font-black text-sm tracking-tight mb-0.5"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text className="text-slate-500 text-xs font-medium mb-3">
                        {product.weight}
                      </Text>

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