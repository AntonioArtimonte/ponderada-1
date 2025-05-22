// screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth provides register function
import { APP_CONFIG } from '../../config/appConfig'; // For app name or consistent styling

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const { register, isLoading: authLoading } = useAuth();
  const [error, setError] = useState(''); // For general registration errors

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '', // Optional
      password: '',
      confirmPassword: '',
    },
  });

  // Watch the password field to validate confirmPassword
  const password = watch("password", "");

  const onSubmit = async (data) => {
    setError(''); // Clear previous errors
    const { name, email, phone, password } = data;
    try {
      // The AuthContext's register function will handle setting the user and navigation
      await register({ name, email, phone, password });
      // No need to navigate here, AuthContext should handle it
      Alert.alert("Registration Successful", "You can now login with your new account.");
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
      console.error("Registration error:", err);
    }
  };

  // Safely get appName
  const appName = APP_CONFIG ? APP_CONFIG.appName : "Your App";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Create Account
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Join {appName} today!
        </Text>

        {error ? <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText> : null}

        {/* Name Input */}
        <Controller
          control={control}
          rules={{ required: 'Full name is required.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              mode="outlined"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
              error={!!errors.name}
            />
          )}
          name="name"
        />
        {errors.name && <HelperText type="error" visible={!!errors.name}>{errors.name.message}</HelperText>}

        {/* Email Input */}
        <Controller
          control={control}
          rules={{
            required: 'Email is required.',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format.' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
            />
          )}
          name="email"
        />
        {errors.email && <HelperText type="error" visible={!!errors.email}>{errors.email.message}</HelperText>}

        {/* Phone Input (Optional) */}
        <Controller
          control={control}
          // rules={{ pattern: { value: /^[0-9+-]*$/, message: 'Invalid phone number.'} }} // Basic pattern
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone Number (Optional)"
              mode="outlined"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
              error={!!errors.phone}
            />
          )}
          name="phone"
        />
        {errors.phone && <HelperText type="error" visible={!!errors.phone}>{errors.phone.message}</HelperText>}


        {/* Password Input */}
        <Controller
          control={control}
          rules={{
            required: 'Password is required.',
            minLength: { value: 6, message: 'Password must be at least 6 characters.' }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              error={!!errors.password}
            />
          )}
          name="password"
        />
        {errors.password && <HelperText type="error" visible={!!errors.password}>{errors.password.message}</HelperText>}

        {/* Confirm Password Input */}
        <Controller
          control={control}
          rules={{
            required: 'Please confirm your password.',
            validate: value => value === password || "Passwords do not match."
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              error={!!errors.confirmPassword}
            />
          )}
          name="confirmPassword"
        />
        {errors.confirmPassword && <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword.message}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          loading={isSubmitting || authLoading}
          disabled={isSubmitting || authLoading}
          labelStyle={{fontSize: 16}}
        >
          Register
        </Button>

        <View style={styles.loginContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensures ScrollView content can take full height if needed
    justifyContent: 'center',
  },
  container: {
    flex: 1, // Takes available space within ScrollView
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: 'grey',
  },
  input: {
    marginBottom: 2, // Reduced margin for helper text
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20, // Add some bottom margin if it's the last element
  },
  errorText: { // For general API errors
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  }
});

export default RegisterScreen;