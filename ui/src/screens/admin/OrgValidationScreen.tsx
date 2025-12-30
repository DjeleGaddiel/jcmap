import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Linking,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Church, 
  Globe, 
  MapPin, 
  User as UserIcon,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  ExternalLink,
  Mail
} from 'lucide-react-native';
import { organizationsApi, Organization } from '../../services/organizationsApi';

export default function OrgValidationScreen({ navigation }: any) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetchPendingOrgs();
  }, []);

  const fetchPendingOrgs = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.findAll({ isVerified: false });
      setOrgs(data);
    } catch (error) {
      console.error('Erreur fetch orgs en attente:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les demandes en attente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, name: string) => {
    Alert.alert(
      'Confirmer la validation',
      `Voulez-vous vraiment valider l'organisation "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          onPress: async () => {
            try {
              setLoading(true);
              await organizationsApi.update(id, { isVerified: true } as any);
              setOrgs(orgs.filter(o => o.id !== id));
              setSelectedOrg(null);
              Alert.alert('Succès', 'Organisation validée avec succès.');
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la validation.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (id: string, name: string) => {
    Alert.alert(
      'Rejeter la demande',
      `Voulez-vous vraiment supprimer la demande pour "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await organizationsApi.delete(id);
              setOrgs(orgs.filter(o => o.id !== id));
              setSelectedOrg(null);
              Alert.alert('Succès', 'Demande supprimée.');
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la suppression.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const DetailsModal = () => (
    <Modal
      visible={!!selectedOrg}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSelectedOrg(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedOrg?.logoUrl ? (
              <Image source={{ uri: selectedOrg.logoUrl }} style={styles.modalLogo} />
            ) : (
              <View style={styles.modalLargeIcon}>
                <Church color="#4f46e5" size={60} />
              </View>
            )}

            <Text style={styles.modalOrgName}>{selectedOrg?.name}</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Description</Text>
              <Text style={styles.modalDescription}>
                {selectedOrg?.description || "Aucune description fournie."}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Informations</Text>
              {selectedOrg?.address && (
                <View style={styles.modalInfoRow}>
                  <MapPin color="#64748b" size={18} />
                  <Text style={styles.modalInfoText}>{selectedOrg.address}</Text>
                </View>
              )}
              {selectedOrg?.website && (
                <TouchableOpacity 
                  style={styles.modalInfoRow} 
                  onPress={() => Linking.openURL(selectedOrg.website || '')}
                >
                  <Globe color="#3b82f6" size={18} />
                  <Text style={[styles.modalInfoText, styles.linkText]}>{selectedOrg.website}</Text>
                  <ExternalLink color="#3b82f6" size={14} style={{ marginLeft: 5 }} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Propriétaire</Text>
              <View style={styles.modalInfoRow}>
                <UserIcon color="#64748b" size={18} />
                <Text style={styles.modalInfoText}>{selectedOrg?.owner?.fullName || "Inconnu"}</Text>
              </View>
              {selectedOrg?.email && (
                <View style={styles.modalInfoRow}>
                  <Mail color="#64748b" size={18} />
                  <Text style={styles.modalInfoText}>{selectedOrg.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalRejectBtn]}
                onPress={() => selectedOrg && handleReject(selectedOrg.id, selectedOrg.name)}
              >
                <XCircle color="#ef4444" size={20} />
                <Text style={styles.modalRejectBtnText}>Rejeter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalApproveBtn]}
                onPress={() => selectedOrg && handleVerify(selectedOrg.id, selectedOrg.name)}
              >
                <CheckCircle color="#fff" size={20} />
                <Text style={styles.modalApproveBtnText}>Approuver</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setSelectedOrg(null)}
            >
              <Text style={styles.closeModalBtnText}>Fermer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const OrgItem = ({ item }: { item: Organization }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setSelectedOrg(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.cardLogo} />
          ) : (
            <Church color="#4f46e5" size={24} />
          )}
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.orgName}>{item.name}</Text>
          <View style={styles.ownerRow}>
            <UserIcon color="#94a3b8" size={14} />
            <Text style={styles.ownerName}>{item.owner?.fullName || 'Propriétaire inconnu'}</Text>
          </View>
        </View>
        <Info color="#94a3b8" size={20} />
      </View>

      <View style={styles.cardBody}>
        {item.address && (
          <View style={styles.detailRow}>
            <MapPin color="#64748b" size={16} />
            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.clickHint}>Cliquer pour voir les détails</Text>
      </View>
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
          <Text style={styles.headerTitle}>Validations d'Églises</Text>
          <Text style={styles.headerSubtitle}>{orgs.length} demande(s) en attente</Text>
        </SafeAreaView>
      </LinearGradient>

      {loading && orgs.length === 0 ? (
        <View style={styles.centerStage}>
          <ActivityIndicator color="#1e293b" size="large" />
        </View>
      ) : (
        <FlatList
          data={orgs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrgItem item={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CheckCircle color="#94a3b8" size={60} />
              <Text style={styles.emptyText}>Tout est en règle !</Text>
              <Text style={styles.emptySubtext}>Aucune organisation en attente de validation.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchPendingOrgs}
        />
      )}

      <DetailsModal />
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
    paddingBottom: 25,
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
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  cardLogo: {
    width: '100%',
    height: '100%',
  },
  titleInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ownerName: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 6,
  },
  cardBody: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 8,
    alignItems: 'center',
  },
  clickHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '90%',
  },
  modalLargeIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalLogo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalOrgName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalInfoText: {
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 15,
    flex: 0.48,
  },
  modalRejectBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  modalRejectBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 8,
  },
  modalApproveBtn: {
    backgroundColor: '#10b981',
  },
  modalApproveBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  closeModalBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  centerStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  }
});
