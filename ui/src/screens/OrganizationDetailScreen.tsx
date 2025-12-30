import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Church, 
  Calendar,
  ExternalLink,
  MessageCircle
} from "lucide-react-native";

import { organizationsApi, Organization } from "../services/organizationsApi";
import { eventsApi } from "../services/eventsApi";
import { Event } from "../types/event";

const { width } = Dimensions.get('window');

export default function OrganizationDetailScreen({ route, navigation }: any) {
  const { organizationId, organization: initialOrg } = route.params;
  const [organization, setOrganization] = useState<Organization | null>(initialOrg || null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(!initialOrg);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      const data = await organizationsApi.findOne(organizationId || initialOrg?.id);
      setOrganization(data);
      
      // Fetch events for this organization
      const orgEvents = await eventsApi.findAll({ organizationId: data.id });
      setEvents(orgEvents);
    } catch (error) {
      console.error("Erreur fetch organization details:", error);
      Alert.alert("Erreur", "Impossible de charger les détails de l'organisation");
    } finally {
      setLoading(false);
      setLoadingEvents(false);
    }
  }, [organizationId, initialOrg]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleOpenLink = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien");
    });
  };

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone' && organization?.phone) {
      Linking.openURL(`tel:${organization.phone}`);
    } else if (type === 'email' && organization?.email) {
      Linking.openURL(`mailto:${organization.email}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={styles.errorContainer}>
        <Church color="#9ca3af" size={60} />
        <Text style={styles.errorText}>Organisation introuvable</Text>
        <TouchableOpacity style={styles.backButtonUnder} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Image Area */}
        <View style={styles.imageHeader}>
          <Image 
            source={{ uri: organization.logoUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80" }} 
            style={styles.coverImage} 
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            style={styles.imageOverlay}
          />
          <SafeAreaView edges={["top"]} style={styles.safeHeader}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.mainInfo}>
            <Text style={styles.orgName}>{organization.name}</Text>
            {organization.owner?.fullName && (
              <Text style={styles.ownerName}>Par {organization.owner.fullName}</Text>
            )}
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Users color="#4f46e5" size={18} />
                <Text style={styles.statText}>{organization.membersCount || 0} membres</Text>
              </View>
              {organization.isVerified && (
                <View style={[styles.statItem, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.statText, { color: '#059669', marginLeft: 0 }]}>Vérifiée</Text>
                </View>
              )}
            </View>
          </View>

          {organization.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.descriptionText}>{organization.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
            <View style={styles.detailsList}>
              <TouchableOpacity 
                style={styles.detailItem}
                onPress={() => organization.address && handleOpenLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(organization.address)}`)}
              >
                <View style={styles.iconCircle}>
                  <MapPin color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Adresse</Text>
                  <Text style={styles.detailValue}>{organization.address || "Non renseignée"}</Text>
                </View>
                {organization.address && <ExternalLink color="#9ca3af" size={16} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.detailItem}
                onPress={() => handleContact('phone')}
                disabled={!organization.phone}
              >
                <View style={styles.iconCircle}>
                  <Phone color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Téléphone</Text>
                  <Text style={styles.detailValue}>{organization.phone || "Non renseigné"}</Text>
                </View>
                {organization.phone && <MessageCircle color="#9ca3af" size={16} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.detailItem}
                onPress={() => handleContact('email')}
                disabled={!organization.email}
              >
                <View style={styles.iconCircle}>
                  <Mail color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{organization.email || "Non renseigné"}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.detailItem, { borderBottomWidth: 0 }]}
                onPress={() => organization.website && handleOpenLink(organization.website)}
                disabled={!organization.website}
              >
                <View style={styles.iconCircle}>
                  <Globe color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Site Web</Text>
                  <Text style={styles.detailValue}>{organization.website || "Non renseigné"}</Text>
                </View>
                {organization.website && <ExternalLink color="#9ca3af" size={16} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Événements à venir</Text>
            {loadingEvents ? (
              <ActivityIndicator color="#4f46e5" style={{ marginTop: 10 }} />
            ) : events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Calendar color="#9ca3af" size={30} />
                <Text style={styles.emptyEventsText}>Aucun événement programmé</Text>
              </View>
            ) : (
              events.map((event) => (
                <TouchableOpacity 
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => navigation.navigate("EventDetail", { event })}
                >
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventMonth}>
                      {new Date(event.startDatetime).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={styles.eventDay}>
                      {new Date(event.startDatetime).getDate()}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {new Date(event.startDatetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <ChevronLeft color="#9ca3af" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              ))
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  backButtonUnder: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageHeader: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  mainInfo: {
    marginBottom: 25,
  },
  orgName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  detailsList: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyEventsText: {
    marginTop: 10,
    color: '#9ca3af',
    fontSize: 14,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  eventDateBadge: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventMonth: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '700',
  },
  eventDay: {
    fontSize: 20,
    color: '#1f2937',
    fontWeight: '800',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: '#6b7280',
  },
});
