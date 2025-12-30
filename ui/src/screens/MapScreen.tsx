import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { eventsApi } from "../services/eventsApi";
import { organizationsApi, Organization } from "../services/organizationsApi";
import { Event } from "../types/event";
import * as Location from "expo-location";
import { Church } from "lucide-react-native";

const typeColors: Record<string, string> = {
  Rue: "#3b82f6",
  Croisade: "#a855f7",
  "Porte-à-porte": "#22c55e",
  Concert: "#f97316",
};

export default function MapScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Récupérer les événements pour la carte
  const fetchEvents = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let currentLocation: Location.LocationObject | null = null;
      
      if (status === 'granted') {
        currentLocation = await Location.getCurrentPositionAsync({});
        setRegion(prev => ({
          ...prev,
          latitude: currentLocation!.coords.latitude,
          longitude: currentLocation!.coords.longitude,
        }));
      }

      let data;
      if (currentLocation) {
        data = await eventsApi.findNearby(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          10 // Rayon de 10km pour la carte
        );
      } else {
        data = await eventsApi.findAll();
      }
      setEvents(data);

      // Récupérer les organisations à proximité
      try {
        const orgData = currentLocation 
          ? await organizationsApi.findNearby(currentLocation.coords.latitude, currentLocation.coords.longitude)
          : await organizationsApi.findAll({ isVerified: true });
        setOrgs(orgData);
      } catch (err) {
        console.error("Erreur fetch orgs map:", err);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements sur la carte :", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            pinColor={typeColors[event.type] || "#4f46e5"}
          >
            <Callout 
              onPress={() => navigation.navigate("EventDetail", { event })}
              style={styles.callout}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{event.title}</Text>
                <Text style={styles.calloutOrg}>{event.organization?.name || event.org || "Organisateur"}</Text>
                <View style={styles.calloutFooter}>
                  <Text style={styles.calloutType}>{event.type}</Text>
                  <Text style={styles.calloutDistance}>{event.distance}</Text>
                </View>
                <TouchableOpacity style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>Voir les détails</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}

        {orgs.map((org) => (
          <Marker
            key={`org-${org.id}`}
            coordinate={{ 
              latitude: (org as any).latitude || 0, 
              longitude: (org as any).longitude || 0 
            }}
            pinColor="#4f46e5"
          >
            <View style={styles.orgMarker}>
              <Church color="#fff" size={14} />
            </View>
            <Callout 
              onPress={() => navigation.navigate("OrganizationDetail", { organizationId: org.id, organization: org })}
              style={styles.callout}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{org.name}</Text>
                <Text style={styles.calloutOrg}>Communauté / Église</Text>
                <Text style={styles.calloutType}>{org.address || "Adresse non spécifiée"}</Text>
                <View style={{ height: 8 }} />
                <TouchableOpacity style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>Voir l'église</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{events.length} événements à proximité</Text>
          <Text style={styles.subInfoText}>Appuyez sur un marqueur pour les détails</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  subInfoText: {
    fontSize: 13,
    color: "#6b7280",
  },
  callout: {
    width: 200,
    borderRadius: 10,
  },
  calloutContent: {
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  calloutOrg: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  calloutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calloutType: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4f46e5",
  },
  calloutDistance: {
    fontSize: 10,
    color: "#9ca3af",
  },
  calloutButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  calloutButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  }
});