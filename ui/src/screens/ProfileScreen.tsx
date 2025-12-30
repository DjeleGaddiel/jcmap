import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Image, 
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  User as UserIcon, 
  ChevronRight, 
  Plus, 
  Settings, 
  Bell, 
  HelpCircle, 
  Church,
  LogOut,
  MapPin,
  Calendar,
  Camera,
  X,
  Edit3,
  Trash2,
  Shield,
  Users
} from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from "../stores/useAuthStore";
import { authApi } from "../services/authApi";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, setAuth, token } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showAvatarViewer, setShowAvatarViewer] = React.useState(false);
  const [deletingAvatar, setDeletingAvatar] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Rafraîchir les données de l'utilisateur
      const fetchFreshUser = async () => {
        if (!token) return;
        try {
          const freshUser = await authApi.getMe();
          if (freshUser) {
            setAuth(freshUser, token);
          }
        } catch (error) {
          console.error("Erreur lors du rafraîchissement du profil :", error);
        }
      };
      fetchFreshUser();
    }, [token])
  );

  const menuItems = [
    { icon: Bell, label: "Notifications", color: "#3b82f6", screen: "Notifications" },
    { icon: Church, label: "Mon église", color: "#a855f7", screen: "MyChurch" },
    { icon: Settings, label: "Paramètres", color: "#6b7280", screen: "Settings" },
    { icon: HelpCircle, label: "Aide & Support", color: "#10b981", screen: "HelpSupport" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleImagePick = async () => {
    setShowAvatarViewer(false);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission d'accès aux photos requise !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      
      setUploading(true);
      try {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });

        const response = await authApi.uploadAvatar(formData);
        // Rafraîchir les données de l'utilisateur après l'upload
        const freshUser = await authApi.getMe();
        if (token && freshUser) {
          setAuth(freshUser, token);
        }
      } catch (error) {
        console.error("Erreur upload avatar:", error);
        alert("Erreur lors du téléchargement de l'avatar");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteAvatar = () => {
    Alert.alert(
      "Supprimer l'avatar",
      "Êtes-vous sûr de vouloir supprimer votre photo de profil ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            setDeletingAvatar(true);
            try {
              await authApi.deleteAvatar();
              const freshUser = await authApi.getMe();
              if (token && freshUser) {
                setAuth(freshUser, token);
              }
              setShowAvatarViewer(false);
            } catch (error) {
              console.error("Erreur suppression avatar:", error);
              Alert.alert("Erreur", "Impossible de supprimer l'avatar");
            } finally {
              setDeletingAvatar(false);
            }
          }
        }
      ]
    );
  };

  const openAvatarViewer = () => {
    if (user?.avatarUrl) {
      setShowAvatarViewer(true);
    } else {
      handleImagePick();
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
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={openAvatarViewer}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#4f46e5" />
            ) : user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <UserIcon color="#4f46e5" size={40} />
            )}
            <View style={styles.cameraIconContainer}>
              <Camera color="#fff" size={12} />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "Utilisateur"}</Text>
            <Text style={styles.userMeta}>
              {user?.role === 'admin' ? 'Administrateur' : user?.role === 'organizer' ? 'Organisateur' : 'Membre'}
            </Text>
            {user?.email && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Calendar color="#4f46e5" size={20} />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Événements</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <MapPin color="#4f46e5" size={20} />
            <Text style={styles.statValue}>5km</Text>
            <Text style={styles.statLabel}>Rayon</Text>
          </View>
        </View>

        {/* Afficher uniquement pour l'organisateur, l'admin et le super-admin */}
        {user?.role && ['organizer', 'admin', 'super-admin'].includes(user.role) && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <Plus color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.createButtonText}>Créer un événement</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuBorder]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.row}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <item.icon color={item.color} size={20} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Section GESTION pour les rôles pros/admin */}
        <Text style={styles.sectionTitle}>Gestion</Text>
        <View style={styles.menuCard}>
          {user?.role === 'user' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate("OrgRegistration")}
            >
              <View style={styles.row}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#eef2ff' }]}>
                  <Church color="#4f46e5" size={20} />
                </View>
                <Text style={styles.menuLabel}>Devenir Organisateur</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          )}

          {user?.role === 'organizer' && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate("OrgManagement")}
            >
              <View style={styles.row}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#f5f3ff' }]}>
                  <Shield color="#7c3aed" size={20} />
                </View>
                <Text style={styles.menuLabel}>Ma Gestion d'Église</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
          )}

          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate("AdminDashboard")}
              >
                <View style={styles.row}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#1e293b15' }]}>
                    <Shield color="#1e293b" size={20} />
                  </View>
                  <Text style={styles.menuLabel}>Dashboard Admin</Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>
              <View style={styles.menuBorder} />
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate("UserManagement")}
              >
                <View style={styles.row}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#3b82f615' }]}>
                    <Users color="#3b82f6" size={20} />
                  </View>
                  <Text style={styles.menuLabel}>Gestion Utilisateurs</Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Avatar Viewer Modal */}
      <Modal
        visible={showAvatarViewer}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAvatarViewer(false)}
      >
        <View style={styles.avatarViewerContainer}>
          <StatusBar barStyle="light-content" />
          
          {/* Header avec actions */}
          <SafeAreaView edges={["top"]} style={styles.avatarViewerHeader}>
            <TouchableOpacity 
              style={styles.avatarViewerButton}
              onPress={() => setShowAvatarViewer(false)}
            >
              <X color="#fff" size={24} />
            </TouchableOpacity>
            
            <Text style={styles.avatarViewerTitle}>Photo de profil</Text>
            
            <View style={styles.avatarViewerActions}>
              <TouchableOpacity 
                style={styles.avatarViewerButton}
                onPress={handleImagePick}
              >
                <Edit3 color="#fff" size={22} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.avatarViewerButton, { marginLeft: 10 }]}
                onPress={handleDeleteAvatar}
                disabled={deletingAvatar}
              >
                {deletingAvatar ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Trash2 color="#ef4444" size={22} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Avatar en taille réelle */}
          <View style={styles.avatarViewerContent}>
            {user?.avatarUrl ? (
              <Image 
                source={{ uri: user.avatarUrl }} 
                style={styles.fullAvatar}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noAvatarPlaceholder}>
                <UserIcon color="#fff" size={80} />
              </View>
            )}
          </View>

          {/* Nom de l'utilisateur en bas */}
          <View style={styles.avatarViewerFooter}>
            <Text style={styles.avatarViewerName}>{user?.fullName || "Utilisateur"}</Text>
            {user?.email && (
              <Text style={styles.avatarViewerEmail}>{user.email}</Text>
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
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#eef2ff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4f46e5',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderColor: "#f3f4f6",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    borderRadius: 15,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },
  // Avatar Viewer Modal
  avatarViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  avatarViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarViewerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarViewerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  avatarViewerActions: {
    flexDirection: 'row',
  },
  avatarViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullAvatar: {
    width: width,
    height: width,
  },
  noAvatarPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarViewerFooter: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarViewerName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  avatarViewerEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});