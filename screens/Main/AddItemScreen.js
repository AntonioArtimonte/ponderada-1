import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  Surface,
  IconButton,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addProduct } from '../../services/productService';
import { useNotifications } from '../../contexts/NotificationContext';

const { width } = Dimensions.get('window');

export default function AddItemScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeAddStyles(theme);
  const { showAppNotification } = useNotifications();

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ 
    defaultValues: { 
      name: '', 
      description: '', 
      price: '',
      category: '',
    },
    mode: 'onChange',
  });

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
      setShowImagePicker(false);
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
      setShowImagePicker(false);
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
      showAppNotification('Product added successfully!', 'success');
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <ProgressBar
        progress={currentStep / 3}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      <View style={styles.stepDots}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.stepDot,
              currentStep >= step && { backgroundColor: theme.colors.primary },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderImagePicker = () => (
    <Portal>
      <Modal
        visible={showImagePicker}
        onDismiss={() => setShowImagePicker(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Photo</Text>
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              icon="camera"
              onPress={takePhoto}
              style={styles.modalButton}
            >
              Take Photo
            </Button>
            <Button
              mode="contained"
              icon="image"
              onPress={pickFromGallery}
              style={styles.modalButton}
            >
              Choose from Gallery
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderStepIndicator()}

          <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
            <Text variant="headlineSmall" style={styles.headerText}>
              Add New Product
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtext}>
              Step {currentStep} of 3
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={100} style={styles.cardWrapper}>
            <Surface style={styles.imageCard}>
              {imageUri ? (
                <Animatable.Image
                  animation="fadeIn"
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                />
              ) : (
                <TouchableOpacity
                  style={styles.imagePlaceholder}
                  onPress={() => setShowImagePicker(true)}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={48}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </TouchableOpacity>
              )}

              {imageUri && (
                <IconButton
                  icon="close-circle"
                  size={24}
                  iconColor={theme.colors.error}
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                />
              )}
            </Surface>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={200} style={styles.formContainer}>
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
                  left={<TextInput.Icon icon="tag" />}
                />
              )}
            />
            {errors.name && (
              <Text style={styles.error}>{errors.name.message}</Text>
            )}

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
                  left={<TextInput.Icon icon="text" />}
                />
              )}
            />
            {errors.description && (
              <Text style={styles.error}>{errors.description.message}</Text>
            )}

            <Controller
              control={control}
              name="price"
              rules={{
                required: 'Price is required.',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Invalid format (e.g. 10.99)',
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
                  left={<TextInput.Icon icon="currency-usd" />}
                />
              )}
            />
            {errors.price && (
              <Text style={styles.error}>{errors.price.message}</Text>
            )}

            <Controller
              control={control}
              name="category"
              rules={{ required: 'Category is required.' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Category"
                  mode="outlined"
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.category}
                  left={<TextInput.Icon icon="shape" />}
                />
              )}
            />
            {errors.category && (
              <Text style={styles.error}>{errors.category.message}</Text>
            )}
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
              loading={loading}
              disabled={loading || !isValid}
              contentStyle={styles.submitButtonContent}
            >
              Add Product
            </Button>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderImagePicker()}
    </SafeAreaView>
  );
}

const makeAddStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    stepIndicator: {
      marginBottom: 20,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
    },
    stepDots: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.outline,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    headerText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    headerSubtext: {
      color: theme.colors.outline,
      marginTop: 4,
    },
    cardWrapper: {
      marginBottom: 20,
    },
    imageCard: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 2,
    },
    imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 16,
    },
    imagePlaceholder: {
      height: 200,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      marginTop: 8,
      color: theme.colors.primary,
    },
    removeImageButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'white',
    },
    formContainer: {
      marginBottom: 20,
    },
    input: {
      marginBottom: 12,
    },
    error: {
      color: theme.colors.error,
      fontSize: 12,
      marginBottom: 8,
      marginLeft: 8,
    },
    buttonContainer: {
      marginTop: 'auto',
    },
    submitButton: {
      borderRadius: 12,
    },
    submitButtonContent: {
      paddingVertical: 8,
    },
    modalContainer: {
      padding: 20,
    },
    modalContent: {
      padding: 20,
      borderRadius: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      gap: 12,
    },
    modalButton: {
      borderRadius: 12,
    },
  });
