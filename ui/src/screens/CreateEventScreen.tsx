import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
  KeyboardAvoidingView
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Type, 
  AlignLeft,
  Check,
  Camera,
  Image as ImageIcon,
  Navigation,
  Map,
  X
} from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { EventType } from "../types/event";
import { eventsApi } from "../services/eventsApi";

const { width, height } = Dimensions.get('window');

export default function CreateEventScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("Rue");
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [eventTime, setEventTime] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Map picker state
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.3703,
    longitude: 2.3912,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [selectedMapLocation, setSelectedMapLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const eventTypes: EventType[] = ["Rue", "Croisade", "Porte-à-porte", "Concert"];

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert("Permission d'accès aux photos requise !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };

  const getCombinedDateTime = () => {
    const combined = new Date(eventDate);
    combined.setHours(eventTime.getHours());
    combined.setMinutes(eventTime.getMinutes());
    return combined;
  };

  // Get current location
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Activez la localisation pour utiliser cette fonctionnalité");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = currentLocation.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const addressParts = [];
        if (addr.street) addressParts.push(addr.street);
        if (addr.streetNumber) addressParts.unshift(addr.streetNumber);
        if (addr.district) addressParts.push(addr.district);
        if (addr.city) addressParts.push(addr.city);
        if (addr.region && addr.region !== addr.city) addressParts.push(addr.region);
        
        const formattedAddress = addressParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(formattedAddress);
      } else {
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Erreur localisation:", error);
      Alert.alert("Erreur", "Impossible d'obtenir votre position actuelle");
    } finally {
      setGettingLocation(false);
    }
  };

  // Handle map press
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedMapLocation(coordinate);
  };

  // Confirm map location
  const confirmMapLocation = async () => {
    if (!selectedMapLocation) {
      Alert.alert("Attention", "Appuyez sur la carte pour sélectionner un emplacement");
      return;
    }

    setGettingLocation(true);
    try {
      const { latitude, longitude } = selectedMapLocation;
      setCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocode
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const addressParts = [];
        if (addr.street) addressParts.push(addr.street);
        if (addr.streetNumber) addressParts.unshift(addr.streetNumber);
        if (addr.district) addressParts.push(addr.district);
        if (addr.city) addressParts.push(addr.city);
        
        const formattedAddress = addressParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(formattedAddress);
      } else {
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }

      setShowMapPicker(false);
      setSelectedMapLocation(null);
    } catch (error) {
      console.error("Erreur geocoding:", error);
      setLocation(`${selectedMapLocation.latitude.toFixed(6)}, ${selectedMapLocation.longitude.toFixed(6)}`);
      setShowMapPicker(false);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !location) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Titre, Lieu)");
      return;
    }
    
    setLoading(true);
    try {
      const startDateTime = getCombinedDateTime();
      
      const event = await eventsApi.create({
        title,
        type,
        category: 'general',
        description,
        address: location,
        startDatetime: startDateTime.toISOString(),
        endDatetime: startDateTime.toISOString(),
        latitude: coordinates?.lat || 6.3703,
        longitude: coordinates?.lng || 2.3912,
      });

      if (image) {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: image,
          type: 'image/jpeg',
          name: 'event.jpg',
        });
        await eventsApi.uploadImage(event.id, formData);
      }

      Alert.alert(
        "Succès", 
        "Votre événement a été créé avec succès !",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer l'événement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un Événement</Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={handleImagePick}
          >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon color="#9ca3af" size={40} />
              <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera color="#fff" size={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Titre de l'événement *</Text>
          <View style={styles.inputWrapper}>
            <Type color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Ex: Évangélisation de quartier"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Type d'événement</Text>
          <View style={styles.typeRow}>
            {eventTypes.map((t) => (
              <TouchableOpacity 
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeBadge, type === t && styles.typeBadgeActive]}
              >
                <Text style={[styles.typeBadgeText, type === t && styles.typeBadgeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputSection, { flex: 2, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Date *</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#4f46e5" size={20} style={styles.inputIcon} />
              <Text style={styles.pickerText}>{formatDate(eventDate)}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputSection, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Heure</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock color="#4f46e5" size={20} style={styles.inputIcon} />
              <Text style={styles.pickerText}>{formatTime(eventTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
            locale="fr-FR"
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={eventTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
            is24Hour={true}
          />
        )}

        {/* Location Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Localisation *</Text>
          <View style={styles.inputWrapper}>
            <MapPin color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Adresse ou lieu exact"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setCoordinates(null); // Reset coordinates when manually editing
              }}
            />
          </View>

          {/* Location Options */}
          <View style={styles.locationOptions}>
            <TouchableOpacity 
              style={styles.locationOptionButton}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Navigation color="#4f46e5" size={18} />
              )}
              <Text style={styles.locationOptionText}>Ma position</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.locationOptionButton}
              onPress={() => setShowMapPicker(true)}
            >
              <Map color="#4f46e5" size={18} />
              <Text style={styles.locationOptionText}>Choisir sur carte</Text>
            </TouchableOpacity>
          </View>

          {coordinates && (
            <View style={styles.coordinatesInfo}>
              <Text style={styles.coordinatesText}>
                📍 {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description</Text>
          <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
            <AlignLeft color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Détails sur l'activité, programme, etc."
              placeholderTextColor="#9ca3af"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Résumé de la date</Text>
          <Text style={styles.summaryValue}>
            {formatDate(eventDate)} à {formatTime(eventTime)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.7 }]} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Publier l'événement</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>

    {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.mapContainer}>
          <SafeAreaView style={styles.mapHeader}>
            <TouchableOpacity 
              style={styles.mapCloseButton}
              onPress={() => {
                setShowMapPicker(false);
                setSelectedMapLocation(null);
              }}
            >
              <X color="#1f2937" size={24} />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Choisir un emplacement</Text>
            <TouchableOpacity 
              style={[styles.mapConfirmButton, !selectedMapLocation && { opacity: 0.5 }]}
              onPress={confirmMapLocation}
              disabled={!selectedMapLocation || gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Check color="#fff" size={20} />
              )}
            </TouchableOpacity>
          </SafeAreaView>

          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {selectedMapLocation && (
              <Marker
                coordinate={selectedMapLocation}
                pinColor="#4f46e5"
              />
            )}
          </MapView>

          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>
              Appuyez sur la carte pour placer le marqueur
            </Text>
          </View>
        </View>
      </Modal>
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
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#4f46e5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1f2937",
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 15,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    marginBottom: 8,
  },
  typeBadgeActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  typeBadgeText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  typeBadgeTextActive: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
  },
  // Location options
  locationOptions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  locationOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  locationOptionText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4f46e5',
  },
  coordinatesInfo: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4f46e5',
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    borderRadius: 15,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Map Modal
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  mapCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  mapConfirmButton: {
    width: 44,
    height: 44,
    backgroundColor: '#4f46e5',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 15,
  },
  mapInstructionsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
