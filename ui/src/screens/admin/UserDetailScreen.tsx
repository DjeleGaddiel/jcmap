import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react-native';
import { authApi } from '../../services/authApi';

export default function UserDetailScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userData = await authApi.findById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Erreur fetch user details:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les détails de l\'utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'organizer': return 'Organisateur';
      default: return 'Membre';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Utilisateur introuvable.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#334155']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <UserIcon color="#4f46e5" size={50} />
            )}
          </View>
          <Text style={styles.fullName}>{user.fullName}</Text>
          <View style={styles.roleBadge}>
            <Shield size={14} color="#4f46e5" />
            <Text style={styles.roleText}>{translateRole(user.role)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoRow}>
            <UserIcon size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
              <Text style={styles.infoValue}>{user.username || 'Non défini'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email || 'Non défini'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>

          {user.homeChurch && (
            <View style={styles.infoRow}>
              <MapPin size={20} color="#64748b" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Église d'attache</Text>
                <Text style={styles.infoValue}>{user.homeChurch.name}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activités</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.events?.length || 0}</Text>
              <Text style={styles.statLabel}>Événements créés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.participatingEvents?.length || 0}</Text>
              <Text style={styles.statLabel}>Participations</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTextContainer: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
});
