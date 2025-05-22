// screens/Main/ProfileScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Avatar,
  Button,
  Text,
  useTheme,
  TextInput,
  Divider,
  List,
  Surface,
  IconButton,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +55 (19) 99783-2005
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
};

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const { user, logout, updateUserProfile, isLoading: authLoading } = useAuth();
  const { showAppNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Need gallery access to select avatar.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.5,
    });
    if (!res.canceled) setAvatarUri(res.assets[0].uri);
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    try {
      await updateUserProfile({ name, phone, avatarUrl: avatarUri });
      showAppNotification('Profile updated!', 'success');
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No user data. Please log in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
          <Surface style={styles.headerSurface}>
            <TouchableOpacity
              onPress={isEditing ? pickImage : undefined}
              disabled={!isEditing}
              style={styles.avatarContainer}
            >
              {avatarUri ? (
                <Animatable.Image
                  animation="fadeIn"
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon size={120} icon="account" style={styles.avatarIcon} />
              )}
              {isEditing && (
                <Animatable.View animation="fadeIn" style={styles.cameraOverlay}>
                  <IconButton
                    icon="camera"
                    size={24}
                    iconColor={theme.colors.surface}
                    style={styles.cameraIcon}
                  />
                </Animatable.View>
              )}
            </TouchableOpacity>

            {!isEditing && (
              <Animatable.View animation="fadeInUp" delay={200}>
                <Text variant="headlineMedium" style={styles.nameText}>
                  {user.name}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  {user.email}
                </Text>
                {user.phone && (
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {formatPhoneNumber(user.phone)}
                  </Text>
                )}
              </Animatable.View>
            )}
          </Surface>
        </Animatable.View>

        {/* Edit Form */}
        {isEditing ? (
          <Animatable.View animation="fadeInUp" delay={300} style={styles.editSection}>
            <Surface style={styles.formSurface}>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
                placeholder="+55 (19) 99783-2005"
              />
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.btn}
                  icon="close"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  loading={authLoading}
                  onPress={saveProfile}
                  style={styles.btn}
                  icon="check"
                >
                  Save
                </Button>
              </View>
            </Surface>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeInUp" delay={300}>
            <Button
              icon="pencil"
              mode="outlined"
              onPress={() => setIsEditing(true)}
              style={styles.editBtn}
            >
              Edit Profile
            </Button>
          </Animatable.View>
        )}

        <Divider style={styles.divider} />

        {/* Account Actions */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Surface style={styles.actionsSurface}>
            <List.Section>
              <List.Subheader>Account Actions</List.Subheader>

              <List.Item
                title="Change Password"
                left={props => <List.Icon {...props} icon="lock-reset" />}
                onPress={() => navigation.navigate('ChangePassword')}
                style={styles.listItem}
              />

              <List.Item
                title="My Favorites"
                left={props => <List.Icon {...props} icon="heart-outline" />}
                onPress={() => navigation.navigate('Favorites')}
                style={styles.listItem}
              />
            </List.Section>
          </Surface>
        </Animatable.View>

        {/* Logout */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.logoutContainer}>
          <Button
            icon="logout"
            mode="contained-tonal"
            onPress={logout}
            loading={authLoading}
            style={styles.logoutBtn}
          >
            Logout
          </Button>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 20,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      marginBottom: 20,
    },
    headerSurface: {
      padding: 20,
      borderRadius: 16,
      elevation: 2,
      backgroundColor: theme.colors.surface,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarIcon: {
      backgroundColor: theme.colors.primaryContainer,
    },
    cameraOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      padding: 4,
    },
    nameText: {
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.primary,
    },
    infoText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
    editBtn: {
      marginVertical: 20,
      borderRadius: 12,
    },
    editSection: {
      marginBottom: 20,
    },
    formSurface: {
      padding: 16,
      borderRadius: 16,
      elevation: 2,
    },
    input: {
      marginBottom: 15,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    btn: {
      flex: 1,
      borderRadius: 12,
    },
    divider: {
      marginVertical: 20,
    },
    actionsSurface: {
      borderRadius: 16,
      elevation: 2,
      overflow: 'hidden',
    },
    listItem: {
      paddingVertical: 8,
    },
    logoutContainer: {
      marginTop: 20,
    },
    logoutBtn: {
      borderRadius: 12,
    },
  });
