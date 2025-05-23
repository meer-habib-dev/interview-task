import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Clock, 
  Globe, 
  Moon, 
  ChevronRight, 
  Terminal 
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useTimezoneStore } from '@/store/timezoneStore';
import { useNotificationStore } from '@/store/notificationStore';
import { requestNotificationPermissions } from '@/utils/notificationUtils';

export default function SettingsScreen() {
  const { isNycTimezone, toggleTimezone } = useTimezoneStore();
  const { notificationsEnabled, setNotificationsEnabled } = useNotificationStore();
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in your device settings to receive alerts.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setNotificationsEnabled(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notificationsEnabled ? COLORS.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Globe size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Use NYC Timezone</Text>
          </View>
          <Switch
            value={isNycTimezone}
            onValueChange={toggleTimezone}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={isNycTimezone ? COLORS.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Moon size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={darkMode ? COLORS.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More</Text>
        
        <TouchableOpacity style={styles.linkItem}>
          <View style={styles.settingInfo}>
            <Clock size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Timezone Settings</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem}>
          <View style={styles.settingInfo}>
            <Terminal size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Developer Options</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  screenTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});