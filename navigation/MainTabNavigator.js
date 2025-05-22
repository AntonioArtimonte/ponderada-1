import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '../screens/Main/HomeScreen';
import ProductDetailScreen from '../screens/Main/ProductDetailScreen';
import AddItemScreen from '../screens/Main/AddItemScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import MyFavoritesScreen from '../screens/Main/MyFavoritesScreen';
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeStackNavigator() {
  const theme = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle:   { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen
        name="ProductList"
        component={HomeScreen}
        options={{ title: 'Products' }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Details' }}
      />
    </HomeStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const theme = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle:   { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ProfileStack.Screen
        name="UserProfile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <ProfileStack.Screen
        name="Favorites"
        component={MyFavoritesScreen}
        options={{ title: 'My Favorites' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let name;
          switch (route.name) {
            case 'HomeTab':
              name = focused ? 'home' : 'home-outline';
              break;
            case 'AddItemTab':
              name = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'NotificationsTab':
              name = focused ? 'bell' : 'bell-outline';
              break;
            case 'ProfileTab':
              name = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              name = 'circle';
          }
          return <MaterialCommunityIcons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="AddItemTab"
        component={AddItemScreen}
        options={{ title: 'Add Item' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
