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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Search, 
  User as UserIcon, 
  Shield, 
  ChevronRight,
  Check,
  Plus,
  Mail as MailIcon,
  Lock as LockIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react-native';
import { authApi } from '../../services/authApi';

interface User {
  id: string;
  fullName: string;
  email?: string;
  role: string;
  username?: string;
}

export default function UserManagementScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authApi.findAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erreur fetch users:', error);
      Alert.alert('Erreur', 'Impossible de récupérer la liste des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = users.filter(user => 
      user.fullName.toLowerCase().includes(text.toLowerCase()) ||
      user.email?.toLowerCase().includes(text.toLowerCase()) ||
      user.username?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUpdateRole = async (role: string) => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await authApi.updateRole(selectedUser.id, role);
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, role } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u => 
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
      ));
      
      setShowRoleModal(false);
      Alert.alert('Succès', `Le rôle de ${selectedUser.fullName} a été mis à jour.`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rôle.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await authApi.deleteUser(selectedUser.id, deleteReason);
      
      const updatedUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u => 
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      ));
      
      setShowDeleteModal(false);
      setSelectedUser(null);
      setDeleteReason('');
      Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer l\'utilisateur.';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.password || (!newUser.email && !newUser.username)) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le nom, le mot de passe et un identifiant (email ou username).');
      return;
    }

    try {
      setLoading(true);
      const createdUser = await authApi.createUser(newUser);
      setUsers([createdUser, ...users]);
      setFilteredUsers([createdUser, ...filteredUsers]);
      setShowAddModal(false);
      setNewUser({ fullName: '', email: '', username: '', password: '', role: 'user' });
      Alert.alert('Succès', 'Utilisateur créé avec succès.');
    } catch (error) {
      console.error('Erreur creation user:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const UserItem = ({ user }: { user: User }) => (
    <View style={styles.userCard}>
      <TouchableOpacity 
        style={styles.userMainInfo}
        onPress={() => navigation.navigate('UserDetail', { userId: user.id })}
      >
        <View style={styles.userAvatar}>
          <UserIcon color="#4f46e5" size={24} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email || user.username || 'Pas d\'identifiant'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '15' }]}
          onPress={() => {
            setSelectedUser(user);
            setShowRoleModal(true);
          }}
        >
          <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
            {translateRole(user.role)}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleDeleteUser(user)}
        >
          <Trash2 color="#ef4444" size={18} />
          <Text style={styles.actionBtnText}>Supprimer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => {
            setSelectedUser(user);
            setShowRoleModal(true);
          }}
        >
          <Shield color="#4f46e5" size={18} />
          <Text style={styles.detailsBtnText}>Rôle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'organizer': return '#a855f7';
      default: return '#3b82f6';
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'organizer': return 'Orga';
      default: return 'Membre';
    }
  };

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
            <Text style={styles.headerTitle}>Gestion Utilisateurs</Text>
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
              placeholder="Rechercher par nom ou email..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={handleSearch}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading && users.length === 0 ? (
        <ActivityIndicator color="#1e293b" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserItem user={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Search color="#cbd5e1" size={48} />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
            </View>
          }
        />
      )}

      {/* Role Picker Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le rôle</Text>
            <Text style={styles.modalSubtitle}>Sélectionnez le nouveau rôle pour {selectedUser?.fullName}</Text>
            
            {['user', 'organizer', 'admin'].map((role) => (
              <TouchableOpacity 
                key={role}
                style={styles.roleOption}
                onPress={() => handleUpdateRole(role)}
              >
                <View style={styles.row}>
                  <Shield color={getRoleColor(role)} size={20} />
                  <Text style={styles.roleOptionLabel}>{translateRole(role)}</Text>
                </View>
                {selectedUser?.role === role && <Check color="#10b981" size={20} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.closeButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvel Utilisateur</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeHeaderText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <Text style={styles.inputLabel}>Nom Complet *</Text>
              <View style={styles.modalInputWrapper}>
                <UserIcon color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="Jean Dupont"
                  value={newUser.fullName}
                  onChangeText={(text) => setNewUser({...newUser, fullName: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.modalInputWrapper}>
                <MailIcon color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="email@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({...newUser, email: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <View style={styles.modalInputWrapper}>
                <UserIcon color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="nom d'utilisateur"
                  autoCapitalize="none"
                  value={newUser.username}
                  onChangeText={(text) => setNewUser({...newUser, username: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Mot de passe *</Text>
              <View style={styles.modalInputWrapper}>
                <LockIcon color="#94a3b8" size={20} />
                <TextInput 
                  style={styles.modalInput}
                  placeholder="••••••••"
                  secureTextEntry
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({...newUser, password: text})}
                />
              </View>

              <Text style={styles.inputLabel}>Rôle</Text>
              <View style={styles.rolePickerRow}>
                {['user', 'organizer', 'admin'].map((r) => (
                  <TouchableOpacity 
                    key={r}
                    style={[
                      styles.roleChip, 
                      newUser.role === r && { backgroundColor: getRoleColor(r), borderColor: getRoleColor(r) }
                    ]}
                    onPress={() => setNewUser({...newUser, role: r})}
                  >
                    <Text style={[styles.roleChipText, newUser.role === r && { color: '#fff' }]}>
                      {translateRole(r)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.submitBtn}
                onPress={handleCreateUser}
              >
                <Text style={styles.submitBtnText}>Créer l'utilisateur</Text>
              </TouchableOpacity>

              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <View style={styles.deleteIconContainer}>
              <AlertTriangle color="#ef4444" size={40} />
            </View>
            <Text style={styles.modalTitle}>Supprimer l'utilisateur</Text>
            <Text style={styles.modalSubtitle}>
              Êtes-vous sûr de vouloir supprimer {selectedUser?.fullName} ? Cette action est réversible par un administrateur système.
            </Text>

            <View style={styles.modalInputWrapper}>
              <AlertTriangle color="#64748b" size={20} />
              <TextInput 
                style={styles.modalInput}
                placeholder="Motif de suppression (obligatoire)"
                value={deleteReason}
                onChangeText={setDeleteReason}
              />
            </View>
            
            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.deleteConfirmBtn,
                  !deleteReason.trim() && { backgroundColor: '#fecaca' }
                ]}
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
  userCard: {
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
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  userActions: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 13,
    color: '#4f46e5',
    marginLeft: 6,
    fontWeight: '600',
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    height: '90%',
  },
  modalForm: {
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeHeaderText: {
    color: '#64748b',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 15,
  },
  closeButton: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    padding: 15,
  },
  closeButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '700',
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
  rolePickerRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  roleChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
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
    borderRadius: 25,
    padding: 25,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteConfirmBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteConfirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
