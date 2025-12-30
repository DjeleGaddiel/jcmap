import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight, User, Bell, Shield, Eye, Info, MapPin, Church, Activity } from "lucide-react-native";

import { useSettingsStore } from "../../stores/useSettingsStore";
import { useAuthStore } from "../../stores/useAuthStore";

export default function SettingsScreen({ navigation }: any) {
  const { 
    pushNotifications, 
    locationServices, 
    setPushNotifications, 
    setLocationServices 
  } = useSettingsStore();
  const { user } = useAuthStore();

  const SettingItem = ({ icon: Icon, label, value, type = 'toggle', onPress }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={type === 'link' ? onPress : undefined}
      disabled={type === 'toggle'}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconBackground}>
          <Icon color="#4f46e5" size={20} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: "#d1d5db", true: "#c7d2fe" }}
          thumbColor={value ? "#4f46e5" : "#f3f4f6"}
        />
      ) : (
        <ChevronRight color="#9ca3af" size={20} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Paramètres</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon={User} 
            label="Informations personnelles" 
            type="link" 
            onPress={() => navigation.navigate("EditProfile")}
          />
          <SettingItem icon={Shield} label="Sécurité & Mot de passe" type="link" />
        </View>

        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon={Bell} 
            label="Notifications Push" 
            value={pushNotifications} 
            onPress={() => setPushNotifications(!pushNotifications)} 
          />
          <SettingItem 
            icon={MapPin} 
            label="Service de localisation" 
            value={locationServices} 
            onPress={() => setLocationServices(!locationServices)} 
          />
           <SettingItem icon={Eye} label="Confidentialité" type="link" />
        </View>

        <Text style={styles.sectionTitle}>Gestion & Administration</Text>
        <View style={styles.settingsCard}>
          {user?.role === 'user' && (
            <SettingItem 
              icon={Church} 
              label="Devenir Organisateur" 
              type="link" 
              onPress={() => navigation.navigate("OrgRegistration")}
            />
          )}
          {user?.role === 'organizer' && (
            <SettingItem 
              icon={Church} 
              label="Gestion d'Église" 
              type="link" 
              onPress={() => navigation.navigate("OrgManagement")}
            />
          )}
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <>
              <SettingItem 
                icon={Activity} 
                label="Dashboard Admin" 
                type="link" 
                onPress={() => navigation.navigate("AdminDashboard")}
              />
              <SettingItem 
                icon={User} 
                label="Gestion Utilisateurs" 
                type="link" 
                onPress={() => navigation.navigate("UserManagement")}
              />
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.settingsCard}>
          <SettingItem icon={Info} label="À propos" type="link" />
          <View style={styles.versionInfo}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 10,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 38,
    height: 38,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  versionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  versionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  versionValue: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  }
});
