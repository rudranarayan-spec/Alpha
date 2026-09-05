import { Ionicons } from '@expo/vector-icons';
import { useRouter, useUnstableGlobalHref } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function UnmatchedRouteScreen() {
  const router = useRouter();
  
  // Captures the exact broken path the user attempted to visit
  const attemptedPath = useUnstableGlobalHref();

  useEffect(() => {
    // console.error(`[Router Telemetry] 404 Unmatched Route Exception on path: ${attemptedPath}`);
  }, [attemptedPath]);

  const handleSafelyReturnHome = () => {
    // replace() instead of push() clears the broken route out of the navigation stack history
    router.replace('/(tabs)' as any);
  };

  return (
    <View className="flex-1 bg-[#0B132B] items-center justify-center px-6">
      
      {/* Background Ambient Glows */}
      <View className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <View className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        className="items-center w-full max-w-sm"
      >
        {/* Glassmorphic Icon Hub */}
        <View className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl items-center justify-center mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <View className="absolute inset-0 bg-emerald-500/10" />
          <Ionicons name="compass-outline" size={42} color="#10B981" />
        </View>

        {/* Informative Error Copy */}
        <Text className="text-white text-xl font-black tracking-tight text-center mb-2">
          Page Not Found
        </Text>
        <Text className="text-slate-400 text-xs font-medium text-center max-w-xs mb-6 leading-relaxed">
          The catalog path or section you requested is currently unavailable or has been relocated.
        </Text>

        {/* Enterprise Technical Debug Info (Visible during staging/development) */}
        {__DEV__ && (
          <View className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-3.5 mb-6 w-full shadow-inner">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Dev Route Trace Exception
              </Text>
            </View>
            <Text className="text-slate-300 text-xs font-mono bg-black/40 p-2 rounded-xl" numberOfLines={2}>
              {attemptedPath || 'Unknown path array'}
            </Text>
          </View>
        )}

        {/* Action Call to Action Button */}
        <Pressable 
          onPress={handleSafelyReturnHome}
          className="bg-emerald-600 active:bg-emerald-700 h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/40 w-full border border-emerald-500/30"
        >
          <Ionicons name="home-sharp" size={18} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-black text-xs tracking-wider uppercase">Return to Dashboard</Text>
        </Pressable>
      </MotiView>
    </View>
  );
}