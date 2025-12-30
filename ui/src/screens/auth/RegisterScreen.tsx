import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../services/authApi';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, User as UserIcon, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!fullName || !password || (!email && !phone && !username)) {
      Alert.alert('Erreur', 'Veuillez remplir le nom, le mot de passe et au moins un identifiant (email, téléphone ou nom d\'utilisateur)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({ 
        fullName: fullName.trim(), 
        email: email.trim(), 
        phone: phone.trim(), 
        username: username.trim(), 
        password: password.trim() 
      });
      await setAuth(response.user, response.access_token);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erreur d\'inscription', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['#4f46e5', '#3730a3']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté JCMap</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <UserIcon size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Mail size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email (optionnel)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Phone size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Téléphone (optionnel)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <UserIcon size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur (optionnel)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            {showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>Créer mon compte</Text>
              <ArrowRight size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 30,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1f2937',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
  },
  loginLink: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 5,
  },
});

export default RegisterScreen;
