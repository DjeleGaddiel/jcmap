import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  Share,
  ActivityIndicator,
  Image,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Navigation, 
  Share2, 
  Heart,
  CheckCircle2,
  X
} from "lucide-react-native";
import { Event } from "../types/event";
import { formatEventDate, formatEventRange } from "../utils/formatDate";
import { eventsApi } from "../services/eventsApi";
import { useAuthStore } from "../stores/useAuthStore";

const { width } = Dimensions.get("window");

const typeColors: Record<string, string> = {
  Rue: "#3b82f6",
  Croisade: "#a855f7",
  "Porte-à-porte": "#22c55e",
  Concert: "#f97316",
};

export default function EventDetailScreen({ route, navigation }: any) {
  const [event, setEvent] = React.useState<Event>(route.params.event);
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = React.useState(false);
  const user = useAuthStore(state => state.user);
  
  // Vérifier si l'utilisateur est l'organisateur
  const isOrganizer = user && event.organizer && user.id === event.organizer.id;
  
  // Indicateurs de participation et de favori
  const isParticipating = event.isParticipating || false;
  const isFavorited = event.isFavorited || false;

  React.useEffect(() => {
    fetchEventDetails();
  }, []);

  // Récupérer les détails de l'événement depuis le backend
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const updatedEvent = await eventsApi.findOne(event.id);
      setEvent(updatedEvent);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails :", error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'inscription/désinscription à l'événement
  const handleToggleJoin = async () => {
    try {
      setActionLoading(true);
      if (isParticipating) {
        await eventsApi.leave(event.id);
      } else {
        await eventsApi.join(event.id);
      }
      await fetchEventDetails();
    } catch (error) {
      console.error("Erreur lors de l'inscription/désinscription :", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Gérer l'ajout/retrait des favoris
  const handleToggleFavorite = async () => {
    try {
      await eventsApi.toggleFavorite(event.id);
      await fetchEventDetails();
    } catch (error) {
      console.error("Erreur lors de la modification des favoris :", error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi pour l'événement "${event.title}" avec ${event.organization?.name || "JCMap"} le ${formatEventDate(event.startDatetime)} ! #JCMap`,
      });
    } catch (error) {
      console.log(error);
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.typeBadge, { backgroundColor: typeColors[event.type] || "#6366f1" }]}>
              <Text style={styles.typeText}>{event.type}</Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.orgText}>{event.organization?.name || event.org || "Organisateur inconnu"}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar color="#4f46e5" size={24} />
            </View>
            <View>
              <Text style={styles.infoLarge}>{formatEventDate(event.startDatetime)}</Text>
              <Text style={styles.infoSmall}>{formatEventRange(event.startDatetime, event.endDatetime)}</Text>
            </View>
          </View>
          
          <View style={[styles.infoRow, styles.borderTop]}>
            <View style={styles.iconContainer}>
              <MapPin color="#4f46e5" size={24} />
            </View>
            <View>
              <Text style={styles.infoLarge}>{event.distance}</Text>
              <Text style={styles.infoSmall}>de votre position</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.borderTop]}>
            <View style={styles.iconContainer}>
              <Users color="#4f46e5" size={24} />
            </View>
            <View>
              <Text style={styles.infoLarge}>
                {event.participantsCount || (Array.isArray(event.participants) ? event.participants.length : (typeof event.participants === 'number' ? event.participants : 0))} participants
              </Text>
              <Text style={styles.infoSmall}>déjà inscrits</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{event.description || "Aucune description fournie."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          <View style={styles.mapPlaceholder}>
            <MapPin color="#9ca3af" size={40} />
            <Text style={styles.mapText}>Carte interactive bientôt disponible ici</Text>
          </View>
          <TouchableOpacity style={styles.directionButton}>
            <Navigation color="#4f46e5" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.directionButtonText}>Obtenir l'itinéraire</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconAction} onPress={handleShare}>
          <Share2 color="#4b5563" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconAction} onPress={handleToggleFavorite}>
          <Heart 
            color={isFavorited ? "#ef4444" : "#4b5563"} 
            fill={isFavorited ? "#ef4444" : "transparent"} 
            size={24} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mainAction, (isParticipating || isOrganizer) && styles.mainActionRegistered]}
          onPress={isOrganizer ? () => setShowParticipantsModal(true) : handleToggleJoin}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : isOrganizer ? (
            <View style={styles.row}>
              <Users color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.mainActionText}>Participants</Text>
            </View>
          ) : isParticipating ? (
            <View style={styles.row}>
              <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.mainActionText}>J'y participe</Text>
            </View>
          ) : (
            <Text style={styles.mainActionText}>Participer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal des Participants */}
      <Modal
        visible={showParticipantsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowParticipantsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Participants ({Array.isArray(event.participants) ? event.participants.length : 0})</Text>
              <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.isArray(event.participants) && event.participants.length > 0 ? (
                event.participants.map((participant: any) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <View style={styles.participantAvatar}>
                      {participant.avatarUrl ? (
                        <Image source={{ uri: participant.avatarUrl }} style={styles.avatarImg} />
                      ) : (
                        <Users color="#4f46e5" size={20} />
                      )}
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.fullName}</Text>
                      {participant.email && (
                        <Text style={styles.participantContact}>📧 {participant.email}</Text>
                      )}
                      {participant.phone && (
                        <Text style={styles.participantContact}>📞 {participant.phone}</Text>
                      )}
                      {participant.address && (
                        <Text style={styles.participantAddress}>📍 {participant.address}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyParticipants}>
                  <Users color="#94a3b8" size={48} />
                  <Text style={styles.emptyParticipantsText}>Aucun participant pour le moment.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerContent: {
    marginTop: 10,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 10,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  orgText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoLarge: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  infoSmall: {
    fontSize: 13,
    color: "#6b7280",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4b5563",
  },
  mapPlaceholder: {
    backgroundColor: "#f3f4f6",
    height: 150,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    marginBottom: 15,
    padding: 20,
  },
  mapText: {
    color: "#9ca3af",
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
  },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4f46e5",
    borderRadius: 15,
    paddingVertical: 12,
  },
  directionButtonText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 15,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 35,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  iconAction: {
    width: 54,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mainAction: {
    flex: 1,
    height: 54,
    backgroundColor: "#4f46e5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  mainActionRegistered: {
    backgroundColor: "#10b981",
  },
  mainActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  participantItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  participantContact: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  participantAddress: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyParticipants: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyParticipantsText: {
    marginTop: 15,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  }
});
