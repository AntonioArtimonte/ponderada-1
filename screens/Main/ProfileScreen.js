// screens/Main/ProfileScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Avatar,
  Button,
  Text,
  useTheme,
  TextInput,
  Divider,
  List,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const { user, logout, updateUserProfile, isLoading: authLoading } = useAuth();
  const { showAppNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName]           = useState(user?.name || '');
  const [phone, setPhone]         = useState(user?.phone || '');
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
        {/* Avatar + Info */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
          >
            {avatarUri ? (
              <Avatar.Image size={120} source={{ uri: avatarUri }} />
            ) : (
              <Avatar.Icon size={120} icon="account" />
            )}
            {isEditing && (
              <Avatar.Icon
                size={30}
                icon="camera"
                style={styles.cameraOverlay}
              />
            )}
          </TouchableOpacity>

          {!isEditing && (
            <>
              <Text variant="headlineMedium" style={styles.nameText}>
                {user.name}
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                {user.email}
              </Text>
              {user.phone && (
                <Text variant="bodyMedium" style={styles.infoText}>
                  {user.phone}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Edit Form */}
        {isEditing ? (
          <View style={styles.editSection}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button onPress={() => setIsEditing(false)} style={styles.btn}>
                Cancel
              </Button>
              <Button
                mode="contained"
                loading={authLoading}
                onPress={saveProfile}
                style={styles.btn}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <Button
            icon="pencil"
            mode="outlined"
            onPress={() => setIsEditing(true)}
            style={styles.editBtn}
          >
            Edit Profile
          </Button>
        )}

        <Divider style={styles.divider} />

        {/* Account Actions */}
        <List.Section>
          <List.Subheader>Account Actions</List.Subheader>

          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={() => navigation.navigate('ChangePassword')}
          />

          <List.Item
            title="My Favorites"
            left={props => <List.Icon {...props} icon="heart-outline" />}
            onPress={() => navigation.navigate('Favorites')}
          />
        </List.Section>

        {/* Logout */}
        <Button
          icon="logout"
          mode="contained-tonal"
          onPress={logout}
          loading={authLoading}
          style={styles.logoutBtn}
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container:    { flex: 1, backgroundColor: theme.colors.background },
    scrollContent:{ padding: 20 },
    centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header:       { alignItems: 'center', paddingVertical: 30, backgroundColor: '#f0f0f0' },
    cameraOverlay:{ position: 'absolute', bottom: 5, right: 5, backgroundColor: '#0008' },
    nameText:     { fontWeight: 'bold', fontSize: 20 },
    infoText:     { color: 'gray', marginTop: 4 },
    editBtn:      { marginVertical: 20 },
    editSection:  { marginBottom: 20 },
    input:        { marginBottom: 15 },
    buttonRow:    { flexDirection: 'row', justifyContent: 'space-around' },
    btn:          { flex:1, marginHorizontal: 5 },
    divider:      { marginVertical: 20 },
    logoutBtn:    { marginTop: 20 },
  });
