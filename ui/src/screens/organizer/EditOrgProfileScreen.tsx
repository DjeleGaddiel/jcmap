import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, Save, Globe, MapPin, Info, Phone, Mail } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { organizationsApi, Organization } from '../../services/organizationsApi';

export default function EditOrgProfileScreen({ route, navigation }: any) {
  const { organizationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState<Partial<Organization>>({});
  const [logoUri, setLogoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  const fetchOrgDetails = async () => {
    try {
      setLoading(true);
      const data = await organizationsApi.findOne(organizationId);
      setOrg(data);
      if (data.logoUrl) setLogoUri(data.logoUrl);
    } catch (error) {
      console.error('Error fetching org:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'organisation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!org.name) {
      Alert.alert('Erreur', 'Le nom de l\'organisation est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      
      // Update basic details
      await organizationsApi.update(organizationId, {
        name: org.name,
        description: org.description,
        website: org.website,
        address: org.address,
        phone: org.phone,
        email: org.email,
      });

      // Upload logo if changed and local
      if (logoUri && !logoUri.startsWith('http')) {
        const formData = new FormData();
        const filename = logoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('file', {
          uri: logoUri,
          name: filename,
          type,
        } as any);

        await organizationsApi.uploadLogo(organizationId, formData);
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving org:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.logoContainer}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Camera color="#9ca3af" size={32} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Camera color="#fff" size={14} />
            </View>
          </TouchableOpacity>
          <Text style={styles.logoHint}>Appuyez pour changer le logo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'organisation</Text>
            <View style={styles.inputWrapper}>
              <Info color="#6b7280" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={org.name}
                onChangeText={(text) => setOrg({ ...org, name: text })}
                placeholder="Ex: Église de la Cité"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={org.description}
                onChangeText={(text) => setOrg({ ...org, description: text })}
                placeholder="Décrivez votre organisation..."
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <View style={styles.inputWrapper}>
              <MapPin color="#6b7280" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={org.address}
                onChangeText={(text) => setOrg({ ...org, address: text })}
                placeholder="Adresse physique"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site Web</Text>
            <View style={styles.inputWrapper}>
              <Globe color="#6b7280" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={org.website}
                onChangeText={(text) => setOrg({ ...org, website: text })}
                placeholder="https://..."
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.inputWrapper}>
              <Phone color="#6b7280" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={org.phone}
                onChangeText={(text) => setOrg({ ...org, phone: text })}
                placeholder="+225..."
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email de contact</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#6b7280" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={org.email}
                onChangeText={(text) => setOrg({ ...org, email: text })}
                placeholder="contact@..."
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4f46e5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f9fafb',
  },
  logoHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#1f2937',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
