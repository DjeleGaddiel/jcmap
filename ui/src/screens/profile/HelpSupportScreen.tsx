import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, HelpCircle, Mail, MessageSquare, BookOpen, ExternalLink } from "lucide-react-native";

import { useAuthStore } from "../../stores/useAuthStore";

export default function HelpSupportScreen({ navigation }: any) {
  const { user } = useAuthStore();
  
  const SupportItem = ({ icon: Icon, title, description, onPress }: any) => (
    <TouchableOpacity style={styles.supportCard} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon color="#4f46e5" size={24} />
      </View>
      <View style={styles.content}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportDescription}>{description}</Text>
      </View>
      <ExternalLink color="#9ca3af" size={20} />
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Aide & Support</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topInfo}>
          <HelpCircle color="#4f46e5" size={48} />
          <Text style={styles.topTitle}>Comment pouvons-nous vous aider ?</Text>
          <Text style={styles.topSubtitle}>Notre équipe est là pour vous accompagner dans votre mission.</Text>
        </View>

        <SupportItem 
          icon={BookOpen} 
          title="Centre d'aide" 
          description="Consultez nos guides et tutoriels pour maîtriser JCMap." 
        />

        <SupportItem 
          icon={MessageSquare} 
          title="Chat en direct" 
          description="Discutez avec l'un de nos conseillers en temps réel." 
        />

        <SupportItem 
          icon={Mail} 
          title="Contactez-nous" 
          description="Envoyez-nous un email pour toute demande spécifique." 
        />

        <View style={styles.faqSection}>
          <Text style={styles.faqHeading}>Questions fréquentes</Text>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqTitle}>Comment créer un événement ?</Text>
            <Text style={styles.faqAnswer}>Rendez-vous sur votre profil et cliquez sur le bouton "Créer un événement". Remplissez les informations et publiez.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqTitle}>Comment rejoindre une église ?</Text>
            <Text style={styles.faqAnswer}>Dans l'onglet "Ma communauté", vous pouvez rechercher et rejoindre votre église locale.</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
  },
  topInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  topTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  topSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  faqSection: {
    marginTop: 20,
    paddingBottom: 40,
  },
  faqHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    marginLeft: 4,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  }
});
