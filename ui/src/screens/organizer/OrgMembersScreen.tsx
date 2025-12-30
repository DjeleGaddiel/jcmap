import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, Mail, Phone, ChevronRight } from 'lucide-react-native';
import { organizationsApi } from '../../services/organizationsApi';

export default function OrgMembersScreen({ route, navigation }: any) {
  const { organizationId, organizationName } = route.params;
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.getMembers(organizationId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des membres.');
    } finally {
      setLoading(false);
    }
  };

  const renderMemberItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.memberCard}
      onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
    >
      <View style={styles.memberAvatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.fullName ? item.fullName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.fullName}</Text>
        <View style={styles.contactRow}>
          {item.email && (
            <View style={styles.contactItem}>
              <Mail size={12} color="#6b7280" />
              <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
            </View>
          )}
          {item.phone && (
            <View style={[styles.contactItem, { marginLeft: 10 }]}>
              <Phone size={12} color="#6b7280" />
              <Text style={styles.contactText} numberOfLines={1}>{item.phone}</Text>
            </View>
          )}
        </View>
      </View>
      <ChevronRight color="#d1d5db" size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membres</Text>
          <Text style={styles.headerSubtitle}>{organizationName || 'Liste de l\'église'}</Text>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : members.length > 0 ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Users color="#d1d5db" size={64} />
          <Text style={styles.emptyText}>Aucun membre trouvé pour cette église.</Text>
        </View>
      )}
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
    paddingBottom: 25,
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
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#4f46e5',
    fontSize: 20,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',
  },
  contactText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
