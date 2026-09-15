import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface ExploreHeaderProps {
    insets: EdgeInsets;
    totalCartItems: number;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    activeCategoryTitle: string;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
    insets,
    totalCartItems,
    searchQuery,
    onSearchChange,
    activeCategoryTitle,
}) => {
    const router = useRouter();
    return (
        <View style={{ paddingTop: insets.top + 12 }} className="bg-[#FDFBF7] px-5 pb-2 border-b border-[#1C3516]/10">
            {/* Title & Cart Row */}
            <View className="flex-row justify-between items-start mb-3.5">
                <View className="flex-1 mr-3">
                    <Text className="text-[#1C3516] text-2xl md:text-3xl font-black tracking-tight leading-8">
                        Explore Catalog
                    </Text>
                    <Text className="text-orange-500 text-xs font-medium mt-0.5">
                        Pure organic spices & eco-friendly essentials
                    </Text>
                </View>

                {totalCartItems > 0 && (
                    <Pressable
                        onPress={() => router.push('/(tabs)/cart')}
                        className="bg-[#EE9F19] rounded-full px-3.5 py-1.5 flex-row items-center active:opacity-80 shadow-sm"
                    >
                        <Ionicons name="bag-handle-outline" size={14} color="#FFFFFF" />
                        <Text className="text-white text-xs font-extrabold ml-1.5">
                            {totalCartItems}
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-white border border-[#1C3516]/15 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm">
                <Ionicons name="search-sharp" size={16} color="#1C3516" />
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder={`Search in ${activeCategoryTitle}...`}
                    placeholderTextColor="#94A3B8"
                    className="flex-1 ml-2.5 text-[#1C3516] text-xs font-medium p-0"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
                        <Ionicons name="close-circle" size={16} color="#1C3516" />
                    </Pressable>
                )}
            </View>
        </View>
    );
};