import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Bell, Calendar, MapPin, Info } from "lucide-react-native";

import { useAuthStore } from "../../stores/useAuthStore";
import { useNotificationStore } from "../../stores/useNotificationStore";

export default function NotificationsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, loading } = useNotificationStore();

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePress = (id: string) => {
    markAsRead(id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days}j`;
    if (hours > 0) return `Il y a ${hours}h`;
    if (minutes > 0) return `Il y a ${minutes}m`;
    return "À l'instant";
  };

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && notifications.length === 0 ? (
          <ActivityIndicator color="#4f46e5" style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell color="#9ca3af" size={60} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>Vous serez informé ici des activités importantes.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
              onPress={() => handlePress(item.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.type === 'event' ? '#dbeafe' : item.type === 'confirmation' ? '#dcfce7' : '#fef3c7' }]}>
                {item.type === 'event' ? <MapPin color="#3b82f6" size={20} /> : item.type === 'confirmation' ? <Info color="#10b981" size={20} /> : <Calendar color="#f59e0b" size={20} />}
              </View>
              <View style={styles.content}>
                <View style={styles.cardHeader}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  }
});
