import { Product } from '@/types/category.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  qty: number;
  onUpdateQty: (delta: number) => void;
  cardWidth: number;
  onPress?: () => void;
}

const formatPrice = (price: string): string => {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? String(Math.round(num)) : num.toFixed(2);
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  qty,
  onUpdateQty,
  cardWidth,
  onPress,
}) => {
  const sellingPrice = formatPrice(product.selling_price ?? '0');
  const mrpPrice = product.mrp ? formatPrice(product.mrp) : null;
  const showMrp = mrpPrice && mrpPrice !== sellingPrice;
  const isOutOfStock = product.stock === 0;

const discountPercent = useMemo(() => {
  if (!showMrp || !product.mrp) return 0;
  
  const mrpNum = parseFloat(product.mrp);
  const sellingNum = parseFloat(product.selling_price ?? '0');

  if (isNaN(mrpNum) || isNaN(sellingNum) || mrpNum <= 0) return 0;

  const discount = ((mrpNum - sellingNum) / mrpNum) * 100;
  return Math.max(0, Math.round(discount));
}, [showMrp, product.mrp, product.selling_price]);

  return (
    <Pressable
      onPress={isOutOfStock ? undefined : onPress}
      style={{ width: cardWidth }}
      className={`rounded-2xl p-2.5 border mb-3.5 flex-col justify-between transition-all ${
        isOutOfStock
          ? 'bg-slate-100/90 border-slate-200/80'
          : 'bg-white border-slate-200/70 shadow-xs active:scale-[0.98]'
      }`}
    >
      <View className="w-full">
        {/* Responsive Image Aspect Box */}
        <View className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 relative mb-2.5">
          <Image
            source={{
              uri:
                product.image ||
                'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=300',
            }}
            style={{ width: '100%', height: '100%' }}
            className={isOutOfStock ? 'opacity-35' : 'opacity-100'}
            resizeMode="cover"
          />

          {/* Out of stock Grayscale Dark Overlay Layer */}
          {isOutOfStock && (
            <View className="absolute inset-0 bg-slate-700/30" />
          )}

          {/* Pack Size / Variant Badge */}
          {product.pack_size ? (
            <View
              className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md ${
                isOutOfStock
                  ? 'bg-slate-600/80'
                  : 'bg-[#0B132B]/85 backdrop-blur-md'
              }`}
            >
              <Text className="text-white text-[9px] font-bold tracking-tight">
                {product.pack_size}
              </Text>
            </View>
          ) : null}

          {/* Discount Badge */}
          {!isOutOfStock && discountPercent > 0 && (
            <View className="absolute top-1.5 right-1.5 bg-emerald-600 px-1.5 py-0.5 rounded-md">
              <Text className="text-white text-[9px] font-black tracking-tight">
                {discountPercent}% OFF
              </Text>
            </View>
          )}

          {/* Out of Stock Centered Badge */}
          {isOutOfStock && (
            <View className="absolute inset-0 items-center justify-center bg-slate-950/30 p-1">
              <View className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-sm">
                <Text className="text-slate-100 text-[9px] font-black tracking-widest uppercase text-center">
                  Out of Stock
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Product Details */}
        <Text
          numberOfLines={2}
          className={`text-xs font-bold leading-4 min-h-[32px] mb-1.5 ${
            isOutOfStock ? 'text-slate-400' : 'text-[#0B132B]'
          }`}
        >
          {product.product_name}
        </Text>

        {/* Pricing */}
        <View className="flex-row items-baseline mb-2.5">
          <Text
            className={`text-xs font-black ${
              isOutOfStock ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            ₹{sellingPrice}
          </Text>
          {showMrp && (
            <Text className="text-slate-400 text-[10px] line-through ml-1.5 font-medium">
              ₹{mrpPrice}
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons / Stepper */}
      {isOutOfStock ? (
        <View className="bg-slate-200/80 border border-slate-300/60 py-2 rounded-xl items-center">
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-wider">
            Unavailable
          </Text>
        </View>
      ) : qty > 0 ? (
        <View className="flex-row items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-1.5 py-1">
          <Pressable
            onPress={() => onUpdateQty(-1)}
            hitSlop={8}
            className="w-7 h-7 bg-white rounded-lg items-center justify-center shadow-xs active:bg-slate-100"
          >
            <Ionicons name="remove" size={13} color="#059669" />
          </Pressable>

          <Text className="text-xs font-black text-emerald-950">{qty}</Text>

          <Pressable
            onPress={() => onUpdateQty(1)}
            hitSlop={8}
            className="w-7 h-7 bg-emerald-600 rounded-lg items-center justify-center shadow-xs active:bg-emerald-700"
          >
            <Ionicons name="add" size={13} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => onUpdateQty(1)}
          className="bg-emerald-50 border border-emerald-300/80 py-2 rounded-xl items-center active:bg-emerald-100/80"
        >
          <Text className="text-emerald-800 text-[11px] font-black tracking-wide">
            ADD
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
};