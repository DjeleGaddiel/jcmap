import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View, Platform } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import EventDetailScreen from "./src/screens/EventDetailScreen";
import CreateEventScreen from "./src/screens/CreateEventScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import NotificationsScreen from "./src/screens/profile/NotificationsScreen";
import MyChurchScreen from "./src/screens/profile/MyChurchScreen";
import SettingsScreen from "./src/screens/profile/SettingsScreen";
import HelpSupportScreen from "./src/screens/profile/HelpSupportScreen";
import EditProfileScreen from "./src/screens/profile/EditProfileScreen";
import OrgRegistrationScreen from "./src/screens/organizer/OrgRegistrationScreen";
import OrgManagementScreen from "./src/screens/organizer/OrgManagementScreen";
import EditOrgProfileScreen from "./src/screens/organizer/EditOrgProfileScreen";
import OrgMembersScreen from "./src/screens/organizer/OrgMembersScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import UserManagementScreen from "./src/screens/admin/UserManagementScreen";
import OrgValidationScreen from "./src/screens/admin/OrgValidationScreen";
import AdminOrgManagementScreen from "./src/screens/admin/AdminOrgManagementScreen";
import OrganizationDetailScreen from "./src/screens/OrganizationDetailScreen";
import UserDetailScreen from "./src/screens/admin/UserDetailScreen";
import { useAuthStore } from "./src/stores/useAuthStore";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Map") iconName = focused ? "map" : "map-outline";
          else if (route.name === "Calendar") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: "Carte" }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: "Agenda" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OrgRegistration" component={OrgRegistrationScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="EventDetail" 
                component={EventDetailScreen} 
                options={{ 
                  headerShown: false,
                  presentation: "card"
                }} 
              />
              <Stack.Screen 
                name="CreateEvent" 
                component={CreateEventScreen} 
                options={{ 
                  headerShown: false,
                  presentation: "modal"
                }} 
              />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="MyChurch" component={MyChurchScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="OrgRegistration" component={OrgRegistrationScreen} />
              <Stack.Screen name="OrgManagement" component={OrgManagementScreen} />
              <Stack.Screen name="EditOrgProfile" component={EditOrgProfileScreen} />
              <Stack.Screen name="OrgMembers" component={OrgMembersScreen} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="UserManagement" component={UserManagementScreen} />
              <Stack.Screen name="OrgValidation" component={OrgValidationScreen} />
              <Stack.Screen name="AdminOrgManagement" component={AdminOrgManagementScreen} />
              <Stack.Screen name="OrganizationDetail" component={OrganizationDetailScreen} />
              <Stack.Screen name="UserDetail" component={UserDetailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}