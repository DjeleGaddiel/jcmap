import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Search, 
  Church, 
  Plus, 
  Trash2, 
  ChevronRight,
  MapPin,
  Globe,
  Info,
  Mail,
  Phone
} from 'lucide-react-native';
import { organizationsApi, Organization } from '../../services/organizationsApi';

export default function AdminOrgManagementScreen({ navigation }: any) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  
  // Form state for new organization
  const [newOrg, setNewOrg] = useState<Partial<Organization>>({
    name: '',
    description: '',
    address: '',
    website: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.findAll();
      setOrgs(data);
      setFilteredOrgs(data);
    } catch (error) {
      console.error('Erreur fetch orgs:', error);
      Alert.alert('Erreur', 'Impossible de récupérer la liste des organisations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = orgs.filter(org => 
      org.name.toLowerCase().includes(text.toLowerCase()) ||
      org.description?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOrgs(filtered);
  };

  const handleToggleVerify = async (id: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await organizationsApi.update(id, { isVerified: newStatus });
      
      const updatedOrgs = orgs.map(org => 
        org.id === id ? { ...org, isVerified: newStatus } : org
      );
      setOrgs(updatedOrgs);
      applyFilter(updatedOrgs, search);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de vérification.');
    }
  };

  const applyFilter = (data: Organization[], searchText: string) => {
    const filtered = data.filter(org => 
      org.name.toLowerCase().includes(searchText.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOrgs(filtered);
  };

  const handleDelete = (id: string) => {
    setSelectedOrgId(id);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un motif de suppression.');
      return;
    }

    if (!selectedOrgId) return;

    try {
      setLoading(true);
      await organizationsApi.delete(selectedOrgId, deleteReason);
      const updatedOrgs = orgs.filter(org => org.id !== selectedOrgId);
      setOrgs(updatedOrgs);
      applyFilter(updatedOrgs, search);
      setShowDeleteModal(false);
      setSelectedOrgId(null);
      setDeleteReason('');
      Alert.alert('Succès', 'Organisation supprimée avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer l\'organisation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrg.name) {
      Alert.alert('Erreur', 'Veuillez au moins saisir un nom pour l\'organisation.');
      return;
    }

    try {
      setLoading(true);
      const createdOrg = await organizationsApi.create(newOrg);
      const updatedList = [createdOrg, ...orgs];
      setOrgs(updatedList);
      applyFilter(updatedList, search);
      setShowAddModal(false);
      setNewOrg({ name: '', description: '', address: '', website: '', email: '', phone: '' });
      Alert.alert('Succès', 'Organisation créée avec succès.');
    } catch (error) {
      console.error('Erreur creation org:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'organisation.');
    } finally {
      setLoading(false);
    }
  };

  const OrgItem = ({ org }: { org: Organization }) => (
    <View style={styles.orgCard}>
      <View style={styles.orgMainInfo}>
        <View style={styles.orgAvatar}>
          <Church color="#4f46e5" size={24} />
        </View>
        <View style={styles.orgTextContent}>
          <Text style={styles.orgName} numberOfLines={1}>{org.name}</Text>
          <Text style={styles.orgOwner} numberOfLines={1}>
            Proprio: {org.owner?.fullName || 'N/A'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: org.isVerified ? '#10b981' : '#f59e0b' }]}>
            {org.isVerified ? 'Actif' : 'Inactif'}
          </Text>
          <Switch
            value={!!org.isVerified}
            onValueChange={() => handleToggleVerify(org.id, org.isVerified)}
            trackColor={{ false: '#cbd5e1', true: '#10b981' }}
            thumbColor="#fff"
            ios_backgroundColor="#cbd5e1"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>
      
      <View style={styles.orgActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleDelete(org.id)}
        >
          <Trash2 color="#ef4444" size={18} />
          <Text style={styles.actionBtnText}>Supprimer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => navigation.navigate('OrganizationDetail', { organizationId: org.id, organization: org })}
        >
          <ChevronRight color="#4f46e5" size={20} />
        </TouchableOpacity>
      </View>
    </View>
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
            <Text style={styles.headerTitle}>Gestion Organisations</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus color="#fff" size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchBar}>
            <Search color="#94a3b8" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={handleSearch}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading && orgs.length === 0 ? (
        <ActivityIndicator color="#1e293b" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredOrgs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Organization }) => <OrgItem org={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Church color="#cbd5e1" size={48} />
              <Text style={styles.emptyText}>Aucune organisation trouvée.</Text>
            </View>
          }
        />
      )}

      {/* Add Org Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle Organisation</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeHeaderText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <Text style={styles.inputLabel}>Nom de l'organisation *</Text>
              <View style={styles.modalInputWrapper}>
                <Church color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="Ex: Église de l'Espoir"
                  value={newOrg.name}
                  onChangeText={(text) => setNewOrg({...newOrg, name: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <View style={[styles.modalInputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                <Info color="#94a3b8" size={20} />
                <TextInput 
                  style={[styles.modalInput, { height: 60 }]}
                  placeholder="Brève description..."
                  multiline
                  value={newOrg.description}
                  onChangeText={(text) => setNewOrg({...newOrg, description: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Adresse</Text>
              <View style={styles.modalInputWrapper}>
                <MapPin color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="Adresse physique"
                  value={newOrg.address}
                  onChangeText={(text) => setNewOrg({...newOrg, address: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Site Web</Text>
              <View style={styles.modalInputWrapper}>
                <Globe color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="https://..."
                  autoCapitalize="none"
                  value={newOrg.website}
                  onChangeText={(text) => setNewOrg({...newOrg, website: text})}
                />
              </View>

              <View style={styles.dualRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.modalInputWrapper}>
                    <Mail color="#94a3b8" size={18} />
                    <TextInput 
                      style={styles.modalInput}
                      placeholder="Email contact"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={newOrg.email}
                      onChangeText={(text) => setNewOrg({...newOrg, email: text})}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Téléphone</Text>
                  <View style={styles.modalInputWrapper}>
                    <Phone color="#94a3b8" size={18} />
                    <TextInput 
                      style={styles.modalInput}
                      placeholder="Téléphone"
                      keyboardType="phone-pad"
                      value={newOrg.phone}
                      onChangeText={(text) => setNewOrg({...newOrg, phone: text})}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.submitBtn}
                onPress={handleCreateOrg}
              >
                <Text style={styles.submitBtnText}>Créer l'organisation</Text>
              </TouchableOpacity>

              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Reason Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <Text style={styles.modalTitle}>Motif de suppression</Text>
            <Text style={styles.modalSubtitle}>
              Veuillez indiquer pourquoi vous supprimez cette organisation. Le propriétaire sera notifié.
            </Text>
            
            <View style={[styles.modalInputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput 
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Ex: Informations incorrectes, doublon..."
                multiline
                numberOfLines={4}
                value={deleteReason}
                onChangeText={setDeleteReason}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteConfirmBtn, !deleteReason.trim() && styles.disabledBtn]}
                onPress={confirmDelete}
                disabled={!deleteReason.trim()}
              >
                <Text style={styles.deleteConfirmBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  listContent: {
    padding: 20,
  },
  orgCard: {
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
  orgMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orgTextContent: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  orgOwner: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'center',
    paddingLeft: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orgActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 6,
    fontWeight: '600',
  },
  detailsBtn: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 15,
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
    height: '90%',
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
    color: '#1e293b',
  },
  closeHeaderText: {
    color: '#64748b',
    fontWeight: '600',
  },
  modalForm: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    marginTop: 15,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1e293b',
  },
  dualRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContentSmall: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
    marginTop: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  deleteConfirmBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  }
});
