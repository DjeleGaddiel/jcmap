import React from "react";
import { View, Text, StyleSheet, FlatList, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react-native";
import { eventsApi } from "../services/eventsApi";
import EventCard from "../components/EventCard";
import { Event } from "../types/event";
import { ActivityIndicator, TouchableOpacity } from "react-native";

export default function CalendarScreen({ navigation }: any) {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      // Get events user is participating in from dedicated endpoint
      const data = await eventsApi.getMyParticipating();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching my events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <Text style={styles.headerTitle}>Mon Agenda</Text>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <CalendarIcon color="#9ca3af" size={60} />
          </View>
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptySubtitle}>
            Les événements auxquels vous vous inscrirez apparaîtront ici.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchMyEvents}>
            <RefreshCw color="#4f46e5" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.refreshText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => navigation.navigate("EventDetail", { event: item })} 
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMyEvents}
          refreshing={loading}
        />
      )}
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
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  refreshText: {
    color: '#4f46e5',
    fontWeight: '600',
  }
});
