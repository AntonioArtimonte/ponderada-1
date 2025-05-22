import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import {
  mockRequestPasswordReset,
  mockVerifyOtpAndResetPassword,
} from '../../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent]             = useState(false);
  const [emailForOtp, setEmailForOtp]     = useState('');

  // email form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({ defaultValues: { email: '' } });

  // otp + password form
  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  const onRequestOtp = async data => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await mockRequestPasswordReset(data.email.trim());
      setSuccessMessage(
        'If an account with this email exists, an OTP has been sent (simulated).'
      );
      setEmailForOtp(data.email.trim());
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async data => {
    setError('');
    setSuccessMessage('');
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await mockVerifyOtpAndResetPassword(
        emailForOtp,
        data.otp,
        data.newPassword
      );
      Alert.alert(
        'Success',
        'Password reset successfully! Please login with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      setOtpSent(false);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Forgot Password
      </Text>

      {error ? (
        <HelperText type="error" visible style={styles.messageText}>
          {error}
        </HelperText>
      ) : null}
      {successMessage ? (
        <HelperText type="info" visible style={styles.messageText}>
          {successMessage}
        </HelperText>
      ) : null}

      {!otpSent ? (
        <View style={styles.inner}>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you an OTP to reset your password.
          </Text>
          <Controller
            control={emailControl}
            name="email"
            rules={{
              required: 'Email is required.',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format.' },
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
                error={!!emailErrors.email}
              />
            )}
          />
          {emailErrors.email && (
            <HelperText type="error" visible>
              {emailErrors.email.message}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleEmailSubmit(onRequestOtp)}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Send OTP
          </Button>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.subtitle}>
            An OTP was sent to {emailForOtp}. Enter it below along with your new password.
            (Hint: Mock OTP is 123456)
          </Text>

          <Controller
            control={otpControl}
            name="otp"
            rules={{
              required: 'OTP is required.',
              minLength: { value: 6, message: 'OTP must be 6 digits.' },
              maxLength: { value: 6, message: 'OTP must be 6 digits.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="OTP"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="number-pad"
                maxLength={6}
                error={!!otpErrors.otp}
              />
            )}
          />
          {otpErrors.otp && (
            <HelperText type="error" visible>
              {otpErrors.otp.message}
            </HelperText>
          )}

          <Controller
            control={otpControl}
            name="newPassword"
            rules={{
              required: 'New password is required.',
              minLength: { value: 6, message: 'Password must be at least 6 characters.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="New Password"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                error={!!otpErrors.newPassword}
              />
            )}
          />
          {otpErrors.newPassword && (
            <HelperText type="error" visible>
              {otpErrors.newPassword.message}
            </HelperText>
          )}

          <Controller
            control={otpControl}
            name="confirmPassword"
            rules={{ required: 'Confirm password is required.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm New Password"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                error={!!otpErrors.confirmPassword}
              />
            )}
          />
          {otpErrors.confirmPassword && (
            <HelperText type="error" visible>
              {otpErrors.confirmPassword.message}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleOtpSubmit(onResetPassword)}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Reset Password
          </Button>
        </View>
      )}

      <Button
        mode="text"
        onPress={() => {
          if (otpSent) setOtpSent(false);
          else navigation.goBack();
        }}
        style={styles.backButton}
        disabled={isLoading}
      >
        {otpSent ? 'Enter Different Email' : 'Back to Login'}
      </Button>
    </SafeAreaView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    inner: {
      marginBottom: 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 15,
      color: 'grey',
      paddingHorizontal: 10,
    },
    input: {
      marginBottom: 5,
    },
    button: {
      marginTop: 20,
      paddingVertical: 8,
    },
    backButton: {
      marginTop: 15,
    },
    messageText: {
      textAlign: 'center',
      fontSize: 14,
      marginVertical: 5,
    },
  });
