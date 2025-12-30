import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  FlatList,
  Modal,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Search, 
  Bell, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight,
  TrendingUp,
  X
} from "lucide-react-native";
import { eventsApi, MOCK_EVENTS } from "../services/eventsApi";
import EventCard from "../components/EventCard";
import { Event } from "../types/event";
import * as Location from "expo-location";
import { getDistance, formatDistance } from "../utils/distance";

const { width } = Dimensions.get("window");

import { useNotificationStore } from "../stores/useNotificationStore";

export default function HomeScreen({ navigation }: any) {
  const { unreadCount } = useNotificationStore();
  const [radius, setRadius] = useState(5);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [radius]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      let currentLocation: Location.LocationObject | null = null;
      
      if (status === 'granted') {
        currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }

      let data;
      if (currentLocation) {
        data = await eventsApi.findNearby(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          radius
        );
      } else {
        data = await eventsApi.findAll();
      }

      // Add distance labels
      const eventsWithDistance = data.map(event => {
        if (!currentLocation) return event;
        const d = getDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          event.latitude,
          event.longitude
        );
        return {
          ...event,
          distance: formatDistance(d)
        };
      });

      setEvents(eventsWithDistance);
    } catch (error) {
      console.error("Erreur fetch events:", error);
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.organization?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.org || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Bienvenue 👋</Text>
              <Text style={styles.brandTitle}>JCMap</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Bell color="#fff" size={24} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Search color="rgba(255,255,255,0.7)" size={20} style={styles.searchIcon} />
            <TextInput
              placeholder="Rechercher un événement..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Featured Card */}
        {events.length > 0 && (
          <TouchableOpacity 
            onPress={() => navigation.navigate("EventDetail", { event: events[0] })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              style={styles.featuredCard}
            >
              <View style={styles.featuredHeader}>
                <TrendingUp color="#fff" size={16} />
                <Text style={styles.featuredLabel}>Événement à la une</Text>
              </View>
              <Text style={styles.featuredTitle} numberOfLines={1}>{events[0].title}</Text>
              <Text style={styles.featuredSub}>
                {new Date(events[0].startDatetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                {events[0].distance ? ` • ${events[0].distance}` : ""}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Près de vous <Text style={styles.radiusText}>({radius}km)</Text>
          </Text>
          <TouchableOpacity 
            onPress={() => setShowFilter(true)}
            style={styles.filterButton}
          >
            <Filter color="#4f46e5" size={16} style={styles.filterIcon} />
            <Text style={styles.filterText}>Filtrer</Text>
          </TouchableOpacity>
        </View>

        {filteredEvents.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onPress={() => navigation.navigate("EventDetail", { event })} 
          />
        ))}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <X color="#1f2937" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Rayon de recherche: {radius} km</Text>
              {/* Note: Standard Slider or a custom one would be better, using basic buttons for now to avoid extra deps */}
              <View style={styles.radiusControls}>
                {[5, 10, 20, 50].map(r => (
                  <TouchableOpacity 
                    key={r}
                    onPress={() => setRadius(r)}
                    style={[styles.radiusOption, radius === r && styles.radiusOptionActive]}
                  >
                    <Text style={[styles.radiusOptionText, radius === r && styles.radiusOptionTextActive]}>{r}km</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 20,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  brandTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  featuredHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
    opacity: 0.9,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  featuredSub: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  radiusText: {
    color: "#4f46e5",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 12,
    fontWeight: "600",
  },
  radiusControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radiusOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    alignItems: "center",
  },
  radiusOptionActive: {
    backgroundColor: "#4f46e5",
  },
  radiusOptionText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  radiusOptionTextActive: {
    color: "#fff",
  },
  applyButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});