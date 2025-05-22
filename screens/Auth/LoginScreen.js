import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { APP_CONFIG } from '../../config/appConfig'; // For app name or logo

// You might want a default logo in assets/images/logo.png
// const appLogo = require('../../assets/images/logo.png');

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const { login, isLoading: authLoading } = useAuth();
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data.email, data.password);
      // Navigation will happen automatically via AppNavigator's state change
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* <Image source={appLogo} style={styles.logo} resizeMode="contain" /> */}
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Welcome to {APP_CONFIG.appName}
      </Text>
      <Text variant="titleMedium" style={styles.subtitle}>
        Sign in to continue
      </Text>

      {error ? <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText> : null}

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

      <Controller
        control={control}
        rules={{ required: 'Password is required.' }}
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

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPassword}>
        <Text style={{ color: theme.colors.primary }}>Forgot Password?</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={isSubmitting || authLoading}
        disabled={isSubmitting || authLoading}
        labelStyle={{fontSize: 16}}
      >
        Login
      </Button>

      <View style={styles.signUpContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  }
});

export default LoginScreen;
