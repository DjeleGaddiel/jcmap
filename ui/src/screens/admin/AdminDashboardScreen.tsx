import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Users, 
  Church, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Info
} from 'lucide-react-native';
import { authApi } from '../../services/authApi';
import { organizationsApi } from '../../services/organizationsApi';
import { eventsApi } from '../../services/eventsApi';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState({
    users: 0,
    orgs: 0,
    events: 0,
    pendingOrgs: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [users, orgs, events, pendingOrgs] = await Promise.all([
        authApi.findAll(),
        organizationsApi.findAll(),
        eventsApi.findAll(),
        organizationsApi.findAll({ isVerified: false })
      ]);
      
      setStats({
        users: users.length,
        orgs: orgs.length,
        events: events.length,
        pendingOrgs: pendingOrgs.length
      });
    } catch (error) {
      console.error('Erreur stats admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats(true);
  };

  const StatCard = ({ title, value, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.statIconBadge, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Administration</Text>
              <Text style={styles.headerSubtitle}>Tableau de bord global</Text>
            </View>
            <ShieldCheck color="#10b981" size={32} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e293b" />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator color="#1e293b" style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Utilisateurs" 
                value={stats.users} 
                icon={Users} 
                color="#3b82f6" 
                onPress={() => navigation.navigate('UserManagement')}
              />
              <StatCard 
                title="Églises" 
                value={stats.orgs} 
                icon={Church} 
                color="#a855f7" 
                onPress={() => navigation.navigate('AdminOrgManagement')}
              />
              <StatCard 
                title="Événements" 
                value={stats.events} 
                icon={Calendar} 
                color="#f59e0b" 
                onPress={() => {}} // Future liste modération
              />
              <StatCard 
                title="En attente" 
                value={stats.pendingOrgs} 
                icon={Activity} 
                color="#ef4444" 
                onPress={() => navigation.navigate('OrgValidation')}
              />
            </View>

            <Text style={styles.sectionTitle}>Outils de Gestion</Text>
            
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#eef2ff' }]}>
                <Users color="#4f46e5" size={24} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Gestion des Utilisateurs</Text>
                <Text style={styles.toolDesc}>Modifier rôles, bannir, modérer profils</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('AdminOrgManagement')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#f5f3ff' }]}>
                <Church color="#7c3aed" size={24} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Gestion des Organisations</Text>
                <Text style={styles.toolDesc}>Modifier, activer/désactiver, supprimer des organisations</Text>
              </View>
              {stats.pendingOrgs > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{stats.pendingOrgs}</Text>
                </View>
              )}
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: '#fff7ed' }]}>
                <AlertTriangle color="#f97316" size={24} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Modération Événements</Text>
                <Text style={styles.toolDesc}>Signalements et contenu inapproprié</Text>
              </View>
              <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <TrendingUp color="#64748b" size={18} />
              <Text style={styles.infoBoxText}>
                Le trafic a augmenté de 12% cette semaine. Continuez à surveiller les nouveaux événements !
              </Text>
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  pendingBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  }
});
