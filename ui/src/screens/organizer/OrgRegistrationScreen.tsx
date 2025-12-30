import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Church, FileText, Send, Info, LogIn, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { organizationsApi } from '../../services/organizationsApi';
import { useAuthStore } from '../../stores/useAuthStore';

export default function OrgRegistrationScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [motivation, setMotivation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La permission d\'accéder à la localisation est nécessaire.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      Alert.alert('Succès', 'Position récupérée avec succès.');
    } catch (error) {
      console.error('Erreur localisation:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !motivation) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs pour soumettre votre demande.');
      return;
    }

    setLoading(true);
    try {
      await organizationsApi.create({
        name,
        description,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      });
      
      Alert.alert(
        'Demande envoyée',
        'Votre demande a été soumise avec succès. Un administrateur l\'examinera sous peu.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erreur soumission demande org:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer votre demande. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.unauthorizedContainer}>
          <View style={styles.iconCircle}>
            <LogIn color="#4f46e5" size={40} />
          </View>
          <Text style={styles.unauthorizedTitle}>Connectez-vous d'abord</Text>
          <Text style={styles.unauthorizedText}>
            Pour enregistrer une organisation, vous devez d'abord avoir un compte utilisateur personnel.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryBtnText}>Créer un compte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.infoCard}>
          <Info color="#4f46e5" size={20} />
          <Text style={styles.infoText}>
            En devenant organisateur, vous pourrez créer des événements, gérer vos membres et donner plus de visibilité à votre communauté.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nom de l'organisation</Text>
          <View style={styles.inputContainer}>
            <Church color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Église Vie Nouvelle"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>Description courte</Text>
          <View style={styles.inputContainer}>
            <FileText color="#9ca3af" size={20} style={[styles.inputIcon, { marginTop: 12 }]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez brièvement votre organisation..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <Text style={styles.label}>Pourquoi souhaitez-vous rejoindre JCMap ?</Text>
          <View style={styles.inputContainer}>
            <FileText color="#9ca3af" size={20} style={[styles.inputIcon, { marginTop: 12 }]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dites-nous en plus sur vos objectifs..."
              multiline
              numberOfLines={4}
              value={motivation}
              onChangeText={setMotivation}
            />
          </View>

          <Text style={styles.label}>Localisation</Text>
          <TouchableOpacity 
            style={[styles.locationBtn, (latitude && longitude) && styles.locationBtnActive]}
            onPress={handleGetCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#4f46e5" size="small" />
            ) : (
              <>
                <MapPin color={(latitude && longitude) ? "#fff" : "#4f46e5"} size={20} />
                <Text style={[styles.locationBtnText, (latitude && longitude) && styles.locationBtnTextActive]}>
                  {latitude && longitude ? 'Position enregistrée' : 'Utiliser ma position'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {(latitude && longitude) && (
            <Text style={styles.coordinatesHint}>
              Coordonnées : {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </Text>
          )}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Envoyer ma demande</Text>
                <Send color="#fff" size={20} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  };

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
          <Text style={styles.headerTitle}>Devenir Organisateur</Text>
          <Text style={styles.headerSubtitle}>Enregistrez votre église ou association</Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#4f46e5',
    lineHeight: 18,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginTop: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  unauthorizedContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  unauthorizedText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryBtnText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '700',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 5,
  },
  locationBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  locationBtnText: {
    marginLeft: 8,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 15,
  },
  locationBtnTextActive: {
    color: '#fff',
  },
  coordinatesHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
