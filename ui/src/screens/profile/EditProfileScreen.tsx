import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  AtSign, 
  Check, 
  MapPin, 
  Briefcase,
  Calendar,
  Heart,
  FileText,
  ChevronDown
} from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuthStore } from "../../stores/useAuthStore";
import { authApi } from "../../services/authApi";

const GENDER_OPTIONS = [
  { label: "Homme", value: "M" },
  { label: "Femme", value: "F" },
  { label: "Autre", value: "Other" },
];

const MARITAL_OPTIONS = [
  { label: "Célibataire", value: "Célibataire" },
  { label: "Marié(e)", value: "Marié" },
  { label: "Veuf/Veuve", value: "Veuf" },
  { label: "Divorcé(e)", value: "Divorcé" },
];

export default function EditProfileScreen({ navigation }: any) {
  const { user, setAuth, token } = useAuthStore();
  
  // Identité
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  
  // Contact
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  
  // Infos personnelles
  const [birthday, setBirthday] = useState<Date | null>(
    user?.birthday ? new Date(user.birthday) : null
  );
  const [gender, setGender] = useState(user?.gender || "");
  const [maritalStatus, setMaritalStatus] = useState(user?.maritalStatus || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  
  // Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showMaritalPicker, setShowMaritalPicker] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setBirthday(user.birthday ? new Date(user.birthday) : null);
      setGender(user.gender || "");
      setMaritalStatus(user.maritalStatus || "");
      setJobTitle(user.jobTitle || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Erreur", "Le nom complet est requis");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        fullName: fullName.trim(),
      };

      if (username.trim()) updateData.username = username.trim();
      if (email.trim()) updateData.email = email.trim();
      if (phone.trim()) updateData.phone = phone.trim();
      if (bio.trim()) updateData.bio = bio.trim();
      if (address.trim()) updateData.address = address.trim();
      if (jobTitle.trim()) updateData.jobTitle = jobTitle.trim();
      if (gender) updateData.gender = gender;
      if (maritalStatus) updateData.maritalStatus = maritalStatus;
      if (birthday) updateData.birthday = birthday.toISOString();

      const updatedUser = await authApi.updateProfile(updateData);

      if (token) {
        setAuth(updatedUser, token);
      }

      Alert.alert("Succès", "Votre profil a été mis à jour !", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      Alert.alert(
        "Erreur", 
        error?.response?.data?.message || "Impossible de mettre à jour le profil"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getGenderLabel = () => {
    const found = GENDER_OPTIONS.find(g => g.value === gender);
    return found ? found.label : "Sélectionner";
  };

  const getMaritalLabel = () => {
    const found = MARITAL_OPTIONS.find(m => m.value === maritalStatus);
    return found ? found.label : "Sélectionner";
  };

  const InputField = ({ icon: Icon, label, value, onChangeText, placeholder, keyboardType = "default", autoCapitalize = "sentences", multiline = false }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
        <View style={[styles.iconBox, multiline && styles.iconBoxMultiline]}>
          <Icon color="#4f46e5" size={20} />
        </View>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  const SelectField = ({ icon: Icon, label, value, onPress }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.inputWrapper} onPress={onPress}>
        <View style={styles.iconBox}>
          <Icon color="#4f46e5" size={20} />
        </View>
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
          {value || "Sélectionner"}
        </Text>
        <ChevronDown color="#9ca3af" size={20} style={{ marginRight: 15 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <TouchableOpacity 
              onPress={handleSave}
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Check color="#fff" size={24} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identité */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Identité</Text>
          
          <InputField
            icon={User}
            label="Nom complet *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Entrez votre nom complet"
            autoCapitalize="words"
          />

          <InputField
            icon={AtSign}
            label="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            placeholder="Choisissez un pseudo"
            autoCapitalize="none"
          />

          <InputField
            icon={FileText}
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Parlez un peu de vous..."
            multiline
          />
        </View>

        {/* Contact */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          <InputField
            icon={Mail}
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            icon={Phone}
            label="Téléphone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+229 XX XX XX XX"
            keyboardType="phone-pad"
          />

          <InputField
            icon={MapPin}
            label="Adresse"
            value={address}
            onChangeText={setAddress}
            placeholder="Votre ville ou quartier"
          />
        </View>

        {/* Infos personnelles */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <SelectField
            icon={Calendar}
            label="Date de naissance"
            value={formatDate(birthday)}
            onPress={() => setShowDatePicker(true)}
          />

          <SelectField
            icon={User}
            label="Genre"
            value={getGenderLabel()}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          />

          {showGenderPicker && (
            <View style={styles.optionsContainer}>
              {GENDER_OPTIONS.map(opt => (
                <TouchableOpacity 
                  key={opt.value} 
                  style={[styles.optionItem, gender === opt.value && styles.optionItemActive]}
                  onPress={() => { setGender(opt.value); setShowGenderPicker(false); }}
                >
                  <Text style={[styles.optionText, gender === opt.value && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <SelectField
            icon={Heart}
            label="Situation matrimoniale"
            value={getMaritalLabel()}
            onPress={() => setShowMaritalPicker(!showMaritalPicker)}
          />

          {showMaritalPicker && (
            <View style={styles.optionsContainer}>
              {MARITAL_OPTIONS.map(opt => (
                <TouchableOpacity 
                  key={opt.value} 
                  style={[styles.optionItem, maritalStatus === opt.value && styles.optionItemActive]}
                  onPress={() => { setMaritalStatus(opt.value); setShowMaritalPicker(false); }}
                >
                  <Text style={[styles.optionText, maritalStatus === opt.value && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <InputField
            icon={Briefcase}
            label="Profession"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="Ex: Ingénieur, Enseignant..."
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={birthday || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setBirthday(date);
            }}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity 
          style={[styles.saveButtonFull, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  iconBoxMultiline: {
    height: 100,
    alignSelf: 'stretch',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  inputMultiline: {
    height: 100,
    paddingTop: 12,
  },
  selectText: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  selectPlaceholder: {
    color: '#9ca3af',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginTop: -10,
  },
  optionItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionItemActive: {
    backgroundColor: '#4f46e5',
  },
  optionText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  saveButtonFull: {
    backgroundColor: '#4f46e5',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
