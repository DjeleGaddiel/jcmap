import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar,
  Settings,
  Database,
  ChevronRight
} from 'lucide-react-native';
import { eventsApi } from '../../services/eventsApi';
import { organizationsApi, Organization } from '../../services/organizationsApi';
import { Event } from '../../types/event';
import { formatEventDate } from '../../utils/formatDate';

export default function OrgManagementScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
    fetchMyOrg();
  }, []);

  const fetchMyOrg = async () => {
    try {
      // Pour l'instant, on récupère toutes les orgs et on filtre celle de l'utilisateur
      // Dans une version plus avancée, on aurait un endpoint /organizations/me
      const orgs = await organizationsApi.findAll();
      // On suppose ici que l'utilisateur est le owner. On affichera la première trouvée pour simplifier.
      // Idéalement, on vérifierait l'ID utilisateur.
      if (orgs.length > 0) {
        setOrg(orgs[0]);
      }
    } catch (error) {
      console.error('Erreur fetch org:', error);
    }
  };

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getMyOrganized();
      setEvents(data);
    } catch (error) {
      console.error('Erreur fetch events organisés:', error);
      Alert.alert('Erreur', 'Impossible de récupérer vos événements.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsApi.remove(eventId);
              setEvents(events.filter(e => e.id !== eventId));
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement.');
            }
          }
        }
      ]
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.eventMeta}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.eventDate}>{formatEventDate(item.startDatetime)}</Text>
          <View style={styles.metaDivider} />
          <Users size={14} color="#6b7280" />
          <Text style={styles.eventParticipants}>{item.participantsCount || 0}</Text>
        </View>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateEvent', { event: item, isEditing: true })}
        >
          <Edit3 size={18} color="#4f46e5" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { marginLeft: 10 }]}
          onPress={() => handleDeleteEvent(item.id)}
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestion d'Organisation</Text>
          <Text style={styles.headerSubtitle}>Gérez vos événements et votre profil</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Événements</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Plus color="#fff" size={18} />
            <Text style={styles.addButtonText}>Nouveau</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#4f46e5" style={{ marginTop: 20 }} />
        ) : events.length > 0 ? (
          events.map(event => (
            <View key={event.id}>
              {renderEventItem({ item: event })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Database color="#d1d5db" size={48} />
            <Text style={styles.emptyStateText}>Aucun événement organisé pour le moment.</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>Paramètres d'Organisation</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => org && navigation.navigate('EditOrgProfile', { organizationId: org.id })}
          >
            <View style={styles.row}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#eef2ff' }]}>
                <Settings color="#4f46e5" size={20} />
              </View>
              <Text style={styles.menuLabel}>Modifier le profil d'église</Text>
            </View>
            <ChevronRight color="#9ca3af" size={20} />
          </TouchableOpacity>
          
          <View style={styles.menuBorder} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => org && navigation.navigate('OrgMembers', { 
              organizationId: org.id,
              organizationName: org.name 
            })}
          >
            <View style={styles.row}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#fdf2f8' }]}>
                <Users color="#db2777" size={20} />
              </View>
              <Text style={styles.menuLabel}>Liste des membres</Text>
            </View>
            <ChevronRight color="#9ca3af" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  eventParticipants: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuBorder: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
});
