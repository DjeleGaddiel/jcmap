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
  Image
} from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../services/authApi';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, User, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

const LoginScreen = ({ navigation }: any) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const trimmedLogin = login.trim();
      const trimmedPassword = password.trim();
      const response = await authApi.login({ login: trimmedLogin, password: trimmedPassword });
      await setAuth(response.user, response.access_token);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erreur de connexion', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#4f46e5', '#3730a3']}
        style={styles.header}
      >
        <Image 
          source={require('../../../assets/icon.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>JCMap</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre communauté</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <User size={20} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email, Mobile ou Nom d'utilisateur"
            value={login}
            onChangeText={setLogin}
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

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Se connecter</Text>
              <ArrowRight size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hr} />

        <TouchableOpacity 
          style={styles.orgFooter} 
          onPress={() => navigation.navigate('OrgRegistration')}
        >
          <Text style={styles.orgFooterText}>Vous représentez une église ?</Text>
          <Text style={styles.orgFooterLink}>Inscrivez votre organisation</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 10,
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
    flex: 1,
    paddingHorizontal: 30,
    marginTop: -30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
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
  loginButton: {
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
  loginButtonText: {
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
  registerLink: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 5,
  },
  hr: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 25,
    width: '100%',
  },
  orgFooter: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  orgFooterText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 5,
  },
  orgFooterLink: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
