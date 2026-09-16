import { useAuth } from '@/context/AuthContext';
import { changePasswordService } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { logout } = useAuth();

    // Local preferences state engine
    const [preferences, setPreferences] = useState({
        pushNotifications: true,
        emailUpdates: true,
        orderTrackingAlerts: true,
        biometricAuth: true,
        locationSync: true,
    });

    // Change Password Dialog States
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Visibility states for eye icons
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const togglePreference = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleOpenPasswordDialog = () => {
        setOldPassword('');
        setNewPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setErrorMessage(null);
        setIsPasswordDialogOpen(true);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            setErrorMessage("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const data = await changePasswordService({
                current_password: oldPassword,
                new_password: newPassword,
                confirm_password: newPassword,
            });

            if (data.status === "success") {
                // Clear inputs and close the dialog immediately
                setOldPassword('');
                setNewPassword('');
                setIsPasswordDialogOpen(false);
                toast.success("Password changed successfully. You will be logged out in 5 seconds.", {
                    duration: 2000,
                });

                setTimeout(async () => {
                    await logout();
                }, 5000);
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to change password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" animated />

            {/* 1. BRAND THEME HEADER ARC */}
            <View
                className="bg-[#FDFBF7] px-6 rounded-b-[40px] shadow-xl shadow-[#1C3516]/10 z-10"
                style={{ paddingTop: insets.top + 16, paddingBottom: 36 }}
            >
                <View className="max-w-4xl mx-auto w-full flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/10 active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={18} color="#EE9F19" />
                    </Pressable>
                    <Text className="text-orange-500 text-lg md:text-xl font-black ml-4 tracking-tight">
                        App Settings
                    </Text>
                </View>
            </View>

            {/* SETTINGS MASTER SCROLL TERMINAL */}
            <ScrollView
                className="flex-1 -mt-4 z-20"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
                <View
                    className={`max-w-4xl mx-auto w-full px-5 ${isTablet ? 'flex-row flex-wrap gap-x-6 items-start' : 'flex-col'
                        }`}
                >
                    {/* SECTION I: NOTIFICATIONS */}
                    <View style={{ width: isTablet ? '48%' : '100%' }}>
                        <Text className="text-[#1C3516]/60 font-black text-[11px] md:text-xs uppercase tracking-widest ml-2 mt-6 mb-3">
                            Notifications
                        </Text>
                        <View className="bg-white rounded-3xl border border-[#1C3516]/10 shadow-sm overflow-hidden px-2">
                            <SettingSwitchRow
                                icon="notifications"
                                iconColor="#1C3516"
                                bgColor="bg-[#1C3516]/5"
                                title="Push Notifications"
                                subtitle="Receive real-time scheduling status updates"
                                value={preferences.pushNotifications}
                                onToggle={() => togglePreference('pushNotifications')}
                            />
                            <SettingSwitchRow
                                icon="mail"
                                iconColor="#1C3516"
                                bgColor="bg-[#1C3516]/5"
                                title="Email Updates"
                                subtitle="Invoices and structural service summaries"
                                value={preferences.emailUpdates}
                                onToggle={() => togglePreference('emailUpdates')}
                            />
                            <SettingSwitchRow
                                icon="time"
                                iconColor="#EE9F19"
                                bgColor="bg-[#EE9F19]/10"
                                title="Tracking Alerts"
                                subtitle="Live technician routing pings"
                                value={preferences.orderTrackingAlerts}
                                onToggle={() => togglePreference('orderTrackingAlerts')}
                                isLast
                            />
                        </View>
                    </View>

                    {/* SECTION II: SECURITY & PRIVACY */}
                    <View style={{ width: isTablet ? '48%' : '100%' }}>
                        <Text className="text-[#1C3516]/60 font-black text-[11px] md:text-xs uppercase tracking-widest ml-2 mt-6 mb-3">
                            Security & Privacy
                        </Text>
                        <View className="bg-white rounded-3xl border border-[#1C3516]/10 shadow-sm overflow-hidden px-2">
                            <SettingSwitchRow
                                icon="finger-print"
                                iconColor="#1C3516"
                                bgColor="bg-[#1C3516]/5"
                                title="Authentication"
                                subtitle="Secure checkout profile encryption keys"
                                value={preferences.biometricAuth}
                                onToggle={() => togglePreference('biometricAuth')}
                            />
                            <SettingSwitchRow
                                icon="locate"
                                iconColor="#1C3516"
                                bgColor="bg-[#1C3516]/5"
                                title="Location Sync"
                                subtitle="Auto-detect closest active regional specialists"
                                value={preferences.locationSync}
                                onToggle={() => togglePreference('locationSync')}
                            />
                            <SettingActionRow
                                icon="refresh-circle"
                                iconColor="#EF4444"
                                bgColor="bg-red-50"
                                title="Change Password"
                                subtitle="Change your account password to a new secure value"
                                onPress={handleOpenPasswordDialog}
                                isLast
                            />
                        </View>
                    </View>

                    {/* SECTION III: UTILITIES */}
                    <View className="w-full">
                        <Text className="text-[#1C3516]/60 font-black text-[11px] md:text-xs uppercase tracking-widest ml-2 mt-6 mb-3">
                            System Operations
                        </Text>
                        <View className="bg-white rounded-3xl border border-[#1C3516]/10 shadow-sm overflow-hidden px-2">
                            <SettingActionRow
                                icon="trash-bin"
                                iconColor="#EF4444"
                                bgColor="bg-red-50"
                                title="Clear Application Cache"
                                subtitle="Removes local system data copies temporary profiles"
                                onPress={() => console.log('Cache Purged Successfully')}
                            />
                            <SettingActionRow
                                icon="cloud-download"
                                iconColor="#EE9F19"
                                bgColor="bg-[#EE9F19]/10"
                                title="Download Backup Archives"
                                subtitle="Export historical billing summaries and metrics data"
                                onPress={() => console.log('Initiating Secure JSON Stream')}
                                isLast
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* OVERLAY DIALOG FOR CHANGE PASSWORD */}
            {isPasswordDialogOpen && (
                <View className="absolute inset-0 z-50 justify-center items-center bg-black/60 px-5">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full items-center"
                    >
                        <View
                            className="bg-white rounded-3xl p-6 border border-[#1C3516]/10 shadow-2xl w-full"
                            style={{ maxWidth: 440 }}
                        >
                            {/* Dialog Header */}
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-1 pr-2">
                                    <Text className="text-[#1C3516] text-lg font-black tracking-tight">
                                        Change Password
                                    </Text>
                                    <Text className="text-[#1C3516]/50 text-xs mt-0.5">
                                        Enter your old password and choose a new one
                                    </Text>
                                </View>
                                <Pressable
                                    hitSlop={8}
                                    onPress={() => setIsPasswordDialogOpen(false)}
                                    className="w-8 h-8 rounded-full bg-[#1C3516]/5 items-center justify-center active:bg-[#1C3516]/10"
                                >
                                    <Ionicons name="close" size={18} color="#1C3516" />
                                </Pressable>
                            </View>

                            {/* Old Password Input */}
                            <View className="mb-4">
                                <Text className="text-[#1C3516] text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
                                    Old Password
                                </Text>
                                <View className="flex-row items-center bg-[#FDFBF7] border border-[#1C3516]/15 rounded-2xl px-4 py-3.5">
                                    <TextInput
                                        secureTextEntry={!showOldPassword}
                                        placeholder="Enter old password"
                                        placeholderTextColor="#94A3B8"
                                        value={oldPassword}
                                        onChangeText={setOldPassword}
                                        className="flex-1 text-[#1C3516] text-sm p-0 m-0"
                                    />
                                    <Pressable onPress={() => setShowOldPassword(!showOldPassword)} hitSlop={8}>
                                        <Ionicons
                                            name={showOldPassword ? "eye-off" : "eye"}
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* New Password Input */}
                            <View className="mb-4">
                                <Text className="text-[#1C3516] text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
                                    New Password
                                </Text>
                                <View className="flex-row items-center bg-[#FDFBF7] border border-[#1C3516]/15 rounded-2xl px-4 py-3.5">
                                    <TextInput
                                        secureTextEntry={!showNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor="#94A3B8"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        className="flex-1 text-[#1C3516] text-sm p-0 m-0"
                                    />
                                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={8}>
                                        <Ionicons
                                            name={showNewPassword ? "eye-off" : "eye"}
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Inline Error Message Box */}
                            {errorMessage && (
                                <View className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex-row items-center">
                                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                    <Text className="text-red-600 text-xs font-semibold ml-2 flex-1">
                                        {errorMessage}
                                    </Text>
                                </View>
                            )}

                            {/* Dialog Action Buttons */}
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => setIsPasswordDialogOpen(false)}
                                    className="flex-1 bg-[#1C3516]/5 py-3.5 rounded-2xl items-center justify-center active:bg-[#1C3516]/10 border border-[#1C3516]/10"
                                >
                                    <Text className="text-[#1C3516] text-xs font-black uppercase tracking-wider">
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleChangePassword}
                                    disabled={isLoading}
                                    className="flex-1 bg-[#1C3516] py-3.5 rounded-2xl items-center justify-center active:opacity-90 shadow-md shadow-[#1C3516]/20"
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#EE9F19" />
                                    ) : (
                                        <Text className="text-[#EE9F19] text-xs font-black uppercase tracking-wider">
                                            Update
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            )}
        </View>
    );
}

// TOGGLE SWITCH ROW COMPONENT
interface SettingSwitchRowProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    bgColor: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    isLast?: boolean;
}

function SettingSwitchRow({
    icon,
    iconColor,
    bgColor,
    title,
    subtitle,
    value,
    onToggle,
    isLast,
}: SettingSwitchRowProps) {
    return (
        <View
            className={`flex-row items-center justify-between py-4 px-3 border-b border-[#1C3516]/10 ${isLast ? 'border-b-0' : ''
                }`}
        >
            <View className="flex-row items-center flex-1 pr-4">
                <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center`}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
                <View className="flex-1 ml-4">
                    <Text className="text-[#1C3516] text-sm font-black tracking-tight">{title}</Text>
                    <Text className="text-[#1C3516]/50 text-[11px] font-semibold mt-0.5 leading-4">
                        {subtitle}
                    </Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E2E8F0', true: '#EE9F19' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E2E8F0"
            />
        </View>
    );
}

// ACTION BUTTON ROW COMPONENT
interface SettingActionRowProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    bgColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    isLast?: boolean;
}

function SettingActionRow({
    icon,
    iconColor,
    bgColor,
    title,
    subtitle,
    onPress,
    isLast,
}: SettingActionRowProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center py-4 px-3 active:bg-[#1C3516]/5 border-b border-[#1C3516]/10 ${isLast ? 'border-b-0' : ''
                }`}
        >
            <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center`}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <View className="flex-1 ml-4 pr-4">
                <Text className="text-[#1C3516] text-sm font-black tracking-tight">{title}</Text>
                <Text className="text-[#1C3516]/50 text-[11px] font-semibold mt-0.5 leading-4">
                    {subtitle}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#1C3516" />
        </Pressable>
    );
}