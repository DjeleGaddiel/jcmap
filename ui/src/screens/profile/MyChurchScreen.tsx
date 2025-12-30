import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, MapPin, Phone, Mail, Globe, Users, Church, X, Check, Search } from "lucide-react-native";

import { useAuthStore } from "../../stores/useAuthStore";
import { organizationsApi, Organization } from "../../services/organizationsApi";
import { authApi } from "../../services/authApi";

export default function MyChurchScreen({ navigation }: any) {
  const { user, setAuth, token } = useAuthStore();
  const [showChurchPicker, setShowChurchPicker] = useState(false);
  const [churches, setChurches] = useState<Organization[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const hasChurch = user?.homeChurch && user.homeChurch.id;

  // Use user's homeChurch if available, else fallback to placeholder
  const church = hasChurch ? {
    ...user.homeChurch,
    image: user.homeChurch.logoUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    members: user.homeChurch.membersCount || "0+",
    pastor: user.homeChurch.owner?.fullName || user.homeChurch.pastor || "Leader local"
  } : null;

  const fetchChurches = async () => {
    setLoadingChurches(true);
    try {
      const data = await organizationsApi.findAll();
      setChurches(data);
    } catch (error) {
      console.error("Erreur fetch churches:", error);
      Alert.alert("Erreur", "Impossible de charger les églises");
    } finally {
      setLoadingChurches(false);
    }
  };

  const handleSelectChurch = async (org: Organization) => {
    setJoining(true);
    try {
      await organizationsApi.joinOrganization(org.id);
      // Refresh user data
      const updatedUser = await authApi.getMe();
      if (token) {
        setAuth(updatedUser, token);
      }
      setShowChurchPicker(false);
      Alert.alert("Succès", `Vous avez rejoint ${org.name} !`);
    } catch (error: any) {
      console.error("Erreur join church:", error);
      Alert.alert("Erreur", error?.response?.data?.message || "Impossible de rejoindre cette église");
    } finally {
      setJoining(false);
    }
  };

  const openChurchPicker = () => {
    setShowChurchPicker(true);
    fetchChurches();
  };

  const renderChurchItem = ({ item }: { item: Organization }) => (
    <TouchableOpacity 
      style={styles.churchListItem}
      onPress={() => handleSelectChurch(item)}
      disabled={joining}
    >
      <Image 
        source={{ uri: item.logoUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=200&q=80" }}
        style={styles.churchListImage}
      />
      <View style={styles.churchListInfo}>
        <Text style={styles.churchListName}>{item.name}</Text>
        <Text style={styles.churchListAddress} numberOfLines={1}>
          {item.address || "Adresse non renseignée"}
        </Text>
        <View style={styles.churchListStats}>
          <Users color="#9ca3af" size={14} />
          <Text style={styles.churchListMembers}>{item.membersCount || 0} membres</Text>
        </View>
      </View>
      <Check color="#4f46e5" size={20} />
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
            <Text style={styles.headerTitle}>Ma Communauté</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {hasChurch && church ? (
          <>
            <View style={styles.churchCard}>
              <Image source={{ uri: church.image }} style={styles.churchImage} />
              <View style={styles.infoSection}>
                <Text style={styles.churchName}>{church.name}</Text>
                <Text style={styles.pastorName}>{church.pastor}</Text>
                
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Users color="#4f46e5" size={20} />
                    <Text style={styles.statText}>{church.members} membres</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <View style={styles.iconCircle}>
                  <MapPin color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Adresse</Text>
                  <Text style={styles.detailValue}>{church.address || "-"}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconCircle}>
                  <Phone color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Téléphone</Text>
                  <Text style={styles.detailValue}>{church.phone || "-"}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconCircle}>
                  <Mail color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{church.email || "-"}</Text>
                </View>
              </View>

              <View style={[styles.detailItem, { marginBottom: 0 }]}>
                <View style={styles.iconCircle}>
                  <Globe color="#4f46e5" size={20} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Site Web</Text>
                  <Text style={styles.detailValue}>{church.website || "-"}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.changeButton} onPress={openChurchPicker}>
              <Church color="#4f46e5" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.changeButtonText}>Changer de communauté</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noChurchContainer}>
            <View style={styles.noChurchIconWrapper}>
              <Church color="#9ca3af" size={60} />
            </View>
            <Text style={styles.noChurchTitle}>Aucune église affiliée</Text>
            <Text style={styles.noChurchSubtitle}>
              Rejoignez une communauté pour participer aux événements et rester connecté avec vos frères et sœurs.
            </Text>
            
            <TouchableOpacity style={styles.joinButton} onPress={openChurchPicker}>
              <LinearGradient
                colors={["#4f46e5", "#7c3aed"]}
                style={styles.joinButtonGradient}
              >
                <Church color="#fff" size={22} style={{ marginRight: 10 }} />
                <Text style={styles.joinButtonText}>Rejoindre une église</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerLink} 
              onPress={() => navigation.navigate("OrgRegistration")}
            >
              <Text style={styles.registerLinkText}>Votre église n'est pas répertoriée ?</Text>
              <Text style={styles.registerLinkAction}>Enregistrez-la ici</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Church Picker Modal */}
      <Modal
        visible={showChurchPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChurchPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une église</Text>
              <TouchableOpacity onPress={() => setShowChurchPicker(false)}>
                <X color="#1f2937" size={24} />
              </TouchableOpacity>
            </View>

            {loadingChurches ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Chargement des églises...</Text>
              </View>
            ) : churches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Church color="#9ca3af" size={50} />
                <Text style={styles.emptyText}>Aucune église disponible</Text>
              </View>
            ) : (
              <FlatList
                data={churches}
                renderItem={renderChurchItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}

            {joining && (
              <View style={styles.joiningOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.joiningText}>Adhésion en cours...</Text>
              </View>
            )}
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
    flexGrow: 1,
  },
  churchCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  churchImage: {
    width: '100%',
    height: 180,
  },
  infoSection: {
    padding: 20,
  },
  churchName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  pastorName: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  changeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 30,
  },
  changeButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '700',
  },
  // No Church State
  noChurchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  noChurchIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noChurchTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  noChurchSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  joinButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
    padding: 10,
  },
  registerLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerLinkAction: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#6b7280',
    fontSize: 15,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    color: '#6b7280',
    fontSize: 15,
  },
  churchListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  churchListImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
  },
  churchListInfo: {
    flex: 1,
  },
  churchListName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  churchListAddress: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  churchListStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchListMembers: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  joiningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  joiningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
});
