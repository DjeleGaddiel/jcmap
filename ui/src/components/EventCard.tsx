import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../types/event";
import { formatEventDate } from "../utils/formatDate";

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const typeColors: Record<string, string> = {
  Rue: "#3b82f6",
  Croisade: "#a855f7",
  "Porte-à-porte": "#22c55e",
  Concert: "#f97316",
};

export default function EventCard({ event, onPress }: EventCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: typeColors[event.type] || "#6366f1" }]}>
          <Text style={styles.badgeText}>{event.type}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#9ca3af" />
          <Text style={styles.distanceText}>{event.distance}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.org}>{event.organization?.name || event.org || "Organisateur inconnu"}</Text>
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color="#6366f1" />
          <Text style={styles.infoText}>{formatEventDate(event.startDatetime)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={14} color="#9ca3af" />
          <Text style={styles.infoText}>
            {event.participantsCount || (Array.isArray(event.participants) ? event.participants.length : (typeof event.participants === 'number' ? event.participants : 0))} inscrits
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    color: "#9ca3af",
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  org: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#4b5563",
  },
});
