import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  Card,
  IconButton,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { addProduct } from '../../services/productService';
import { useNotifications } from '../../contexts/NotificationContext';

export default function AddItemScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeAddStyles(theme);
  const { showAppNotification } = useNotifications();

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', description: '', price: '' } });

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Need camera permission to take a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Need gallery permission to select a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data) => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please take or select a photo.');
      return;
    }
    setLoading(true);
    try {
      await addProduct({
        ...data,
        price: parseFloat(data.price),
        imageUrl: imageUri,
      });
      showAppNotification('Product added!', 'success');
      reset();
      setImageUri(null);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      showAppNotification('Failed to add product.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            Add New Product
          </Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={100} style={styles.cardWrapper}>
          <Card elevation={2}>
            <Card.Content>
              {imageUri ? (
                <Animatable.Image
                  animation="fadeIn"
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconButton icon="camera" size={36} onPress={takePhoto} />
                  <Text>Or</Text>
                  <IconButton
                    icon="image-multiple"
                    size={36}
                    onPress={pickFromGallery}
                  />
                </View>
              )}

              <View style={styles.buttonRow}>
                <Button
                  icon="camera"
                  mode="outlined"
                  onPress={takePhoto}
                  compact
                  style={styles.smallButton}
                >
                  Camera
                </Button>
                <Button
                  icon="image-album"
                  mode="outlined"
                  onPress={pickFromGallery}
                  compact
                  style={styles.smallButton}
                >
                  Gallery
                </Button>
              </View>

              {imageUri && (
                <Button
                  textColor={theme.colors.error}
                  compact
                  onPress={() => setImageUri(null)}
                >
                  Remove Image
                </Button>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Name */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Product Name"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.name}
              />
            )}
          />
          {errors.name && (
            <Text style={styles.error}>{errors.name.message}</Text>
          )}
        </Animatable.View>

        {/* Description */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Controller
            control={control}
            name="description"
            rules={{ required: 'Description is required.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Description"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={3}
                error={!!errors.description}
              />
            )}
          />
          {errors.description && (
            <Text style={styles.error}>{errors.description.message}</Text>
          )}
        </Animatable.View>

        {/* Price */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Controller
            control={control}
            name="price"
            rules={{
              required: 'Price is required.',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Invalid format (e.g. 10.99)',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Price"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={!!errors.price}
              />
            )}
          />
          {errors.price && (
            <Text style={styles.error}>{errors.price.message}</Text>
          )}
        </Animatable.View>

        {/* Submit */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.submit}
            loading={loading}
            disabled={loading}
            contentStyle={{ paddingVertical: 6 }}
          >
            Add Product
          </Button>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeAddStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { flexGrow: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    cardWrapper: { marginBottom: 20 },
    imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 6,
      marginBottom: 10,
    },
    imagePlaceholder: {
      height: 150,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    smallButton: { flex: 1, marginHorizontal: 5 },
    input: { marginBottom: 12 },
    error: { color: theme.colors.error, fontSize: 12, marginBottom: 8 },
    submit: { marginTop: 10 },
  });
