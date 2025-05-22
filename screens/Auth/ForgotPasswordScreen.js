import React, { useState } from 'react';
import {
  SafeAreaView,
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
import * as Animatable from 'react-native-animatable';
import { sendPasswordResetEmail, verifyOtpAndResetPassword } from '../../services/emailService';

/**
 * ForgotPasswordScreen – fully controlled with `react-hook-form`.
 * 
 * 1. Fixes mobile autofill misuse by:
 *    • Disabling autofill globally (`importantForAutofill="noExcludeDescendants"`).
 *    • Marking the OTP field as a one‑time code and disabling autofill on it.
 * 2. Sanitises OTP input so *only digits* are stored – any e‑mail text quietly disappears.
 */
export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');

  /* -------------------------------------------------------------------------- */
  /*                              react‑hook‑form                               */
  /* -------------------------------------------------------------------------- */
  const emailForm = useForm({ defaultValues: { email: '' } });
  const resetForm = useForm({ defaultValues: { otp: '', newPassword: '', confirmPassword: '' } });

  /* -------------------------------------------------------------------------- */
  /*                                   Logic                                    */
  /* -------------------------------------------------------------------------- */
  const onRequestOtp = async ({ email }) => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setSuccessMessage('A password reset code has been sent to your email.');
      setEmailForOtp(email.trim());
      setOtpSent(true);
      resetForm.reset();
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async ({ otp, newPassword, confirmPassword }) => {
    setError('');
    setSuccessMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpAndResetPassword(emailForOtp, otp, newPassword);
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      setOtpSent(false);
      emailForm.reset();
      resetForm.reset();
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    UI                                      */
  /* -------------------------------------------------------------------------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      importantForAutofill="noExcludeDescendants" /* blanket disable */
    >
      <Animatable.View animation="fadeInDown" duration={600}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Reset Password</Text>
      </Animatable.View>

      {!!error && (
        <Animatable.View animation="fadeIn" duration={300}>
          <HelperText type="error" visible style={styles.messageText}>{error}</HelperText>
        </Animatable.View>
      )}
      {!!successMessage && (
        <Animatable.View animation="fadeIn" duration={300}>
          <HelperText type="info" visible style={styles.messageText}>{successMessage}</HelperText>
        </Animatable.View>
      )}

      {/* --------------------------------------------------------------------- */}
      {/*                       1) Ask for the user e‑mail                      */}
      {/* --------------------------------------------------------------------- */}
      {!otpSent && (
        <Animatable.View animation="fadeInUp" delay={200} style={styles.inner}>
          <Text style={styles.subtitle}>Enter your e‑mail and we'll send a reset code.</Text>

          <Controller
            control={emailForm.control}
            name="email"
            rules={{
              required: 'E‑mail is required.',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid e‑mail format.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="E‑mail"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                error={!!emailForm.formState.errors.email}
                textContentType="emailAddress"
                autoComplete="email"
                autoCorrect={false}
                autoCompleteType="email"
              />
            )}
          />
          {emailForm.formState.errors.email && (
            <HelperText type="error" visible>{emailForm.formState.errors.email.message}</HelperText>
          )}

          <Button
            mode="contained"
            icon="email-send"
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
            onPress={emailForm.handleSubmit(onRequestOtp)}
          >Send Reset Code</Button>
        </Animatable.View>
      )}

      {/* --------------------------------------------------------------------- */}
      {/*               2) Ask for OTP + new password after e‑mail               */}
      {/* --------------------------------------------------------------------- */}
      {otpSent && (
        <Animatable.View animation="fadeInUp" delay={200} style={styles.inner}>
          <Text style={styles.subtitle}>Enter the code sent to {emailForOtp} and your new password.</Text>

          {/* OTP ----------------------------------------------------------------*/}
          <Controller
            control={resetForm.control}
            name="otp"
            rules={{
              required: 'Reset code is required.',
              pattern: { value: /^[0-9]{6}$/, message: 'Code must be 6 digits.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Reset Code"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                /* Sanitize so only digits persist */
                onChangeText={(text) => onChange(text.replace(/\D+/g, ''))}
                value={value}
                keyboardType="number-pad"
                maxLength={6}
                left={<TextInput.Icon icon="key" />}
                error={!!resetForm.formState.errors.otp}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoCompleteType="off"
                importantForAutofill="no"
                autoCorrect={false}
              />
            )}
          />
          {resetForm.formState.errors.otp && (
            <HelperText type="error" visible>{resetForm.formState.errors.otp.message}</HelperText>
          )}

          {/* New password ------------------------------------------------------ */}
          <Controller
            control={resetForm.control}
            name="newPassword"
            rules={{ required: 'New password is required.', minLength: { value: 6, message: 'Password must be ≥ 6 chars.' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="New Password"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                left={<TextInput.Icon icon="lock" />}
                error={!!resetForm.formState.errors.newPassword}
                textContentType="newPassword"
                autoComplete="password-new"
              />
            )}
          />
          {resetForm.formState.errors.newPassword && (
            <HelperText type="error" visible>{resetForm.formState.errors.newPassword.message}</HelperText>
          )}

          <Controller
            control={resetForm.control}
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
                error={!!resetForm.formState.errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                textContentType="newPassword"
                autoComplete="password-new"
              />
            )}
          />
          {resetForm.formState.errors.confirmPassword && (
            <HelperText type="error" visible>
              {resetForm.formState.errors.confirmPassword.message}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={resetForm.handleSubmit(onResetPassword)}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
            icon="check-circle"
          >
            Reset Password
          </Button>
        </Animatable.View>
      )}

      <Animatable.View animation="fadeInUp" delay={300}>
        <Button
          mode="text"
          onPress={() => {
            if (otpSent) {
              setOtpSent(false);
              resetForm.reset();
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
          disabled={isLoading}
          icon={otpSent ? 'email-edit' : 'arrow-left'}
        >
          {otpSent ? 'Enter Different Email' : 'Back to Login'}
        </Button>
      </Animatable.View>

      {isLoading && (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} size="large" />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    inner: {
      marginBottom: 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: 10,
      fontWeight: 'bold',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      paddingHorizontal: 10,
    },
    input: {
      marginBottom: 5,
    },
    button: {
      marginTop: 20,
      paddingVertical: 8,
      borderRadius: 12,
    },
    backButton: {
      marginTop: 15,
    },
    messageText: {
      textAlign: 'center',
      fontSize: 14,
      marginVertical: 5,
    },
    loader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -20,
    },
  });
