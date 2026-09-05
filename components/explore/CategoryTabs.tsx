import { Category } from '@/types/category.types';
import { FontAwesome6 } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';

interface CategoryTabsProps {
  categories: Category[];
  selectedSlug: string;
  onSelectCategory: (slug: string) => void;
}

const getCategoryIcon = (slug: string): string => {
  const iconMap: Record<string, string> = {
    spices: 'pepper-hot',
    'eco-friendly': 'leaf',
    biodegradable: 'leaf',
    'biodegradable-sustainable-products': 'leaf',
    'organic-essentials': 'seedling',
  };
  return iconMap[slug] ?? 'store';
};

// Clean display name mapping to prevent text clipping on long titles
const getCategoryDisplayName = (category: Category): string => {
  if (
    category.slug === 'biodegradable-sustainable-products' ||
    category.title.toLowerCase().includes('biodegradable')
  ) {
    return 'Eco Friendly Products';
  }
  return category.title;
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedSlug,
  onSelectCategory,
}) => {
  const isCompactList = categories.length <= 3;

  const renderTab = (category: Category) => {
    const isSelected = category.slug === selectedSlug;
    const displayName = getCategoryDisplayName(category);

    return (
      <Pressable
        key={category.id}
        onPress={() => onSelectCategory(category.slug)}
        className={`relative flex-row items-center justify-center py-3 px-4 rounded-xl my-1 mx-1 ${
          isCompactList ? 'flex-1' : ''
        }`}
      >
        {/* Animated Segment Background */}
        {isSelected && (
          <MotiView
            layout={LinearTransition.duration(200)}
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'timing', duration: 160 }}
            className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md"
          />
        )}

        <FontAwesome6
          name={getCategoryIcon(category.slug)}
          size={14}
          color={isSelected ? '#FFFFFF' : '#94A3B8'}
        />

        <Text
          numberOfLines={1}
          className={`ml-2 text-xs font-bold tracking-tight ${
            isSelected ? 'text-white' : 'text-slate-400'
          }`}
        >
          {displayName}
        </Text>

        {category.products_count != null && category.products_count > 0 && (
          <View
            className={`ml-2 px-1.5 py-0.5 rounded-md ${
              isSelected ? 'bg-white/25' : 'bg-white/10'
            }`}
          >
            <Text
              className={`text-[10px] font-extrabold ${
                isSelected ? 'text-white' : 'text-slate-400'
              }`}
            >
              {category.products_count}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="bg-[#0B132B] pb-3 px-3">
      <View className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-sm">
        {isCompactList ? (
          <View className="flex-row w-full justify-between">
            {categories.map(renderTab)}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8, alignItems: 'center' }}
          >
            {categories.map(renderTab)}
          </ScrollView>
        )}
      </View>
    </View>
  );
};