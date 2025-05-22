// screens/Auth/ChangePasswordScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import OTPModal from '../../components/UI/OTPModal';
import {
  mockRequestPasswordReset,
  mockVerifyOtpAndResetPassword,
} from '../../services/authService';

export default function ChangePasswordScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // 'enterPhone' or 'reset'
  const [step, setStep] = useState('enterPhone');
  const [phone, setPhone] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only one form: for newPassword & confirmPassword
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const requestOTP = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    try {
      await mockRequestPasswordReset(phone.trim());
      setOtpVisible(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (code) => {
    setLoading(true);
    try {
      await mockVerifyOtpAndResetPassword(phone.trim(), code, '');
      setOtpVisible(false);
      setStep('reset');
    } catch (err) {
      Alert.alert('Invalid Code', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await mockVerifyOtpAndResetPassword(
        phone.trim(),
        '123456', // we already verified above
        data.newPassword
      );
      Alert.alert(
        'Success',
        'Password changed. Please log in with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {step === 'enterPhone' ? (
        <View style={styles.inner}>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={requestOTP}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Send OTP
          </Button>
        </View>
      ) : (
        <View style={styles.inner}>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: 'New password required.',
              minLength: { value: 6, message: 'Minimum 6 characters.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="New Password"
                secureTextEntry
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.newPassword}
              />
            )}
          />
          {errors.newPassword && <HelperText type="error">{errors.newPassword.message}</HelperText>}

          <Controller
            name="confirmPassword"
            control={control}
            rules={{ required: 'Please confirm password.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                secureTextEntry
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.confirmPassword}
              />
            )}
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword.message}</HelperText>}

          <Button
            mode="contained"
            onPress={handleSubmit(onResetPassword)}
            loading={loading}
            disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
            style={styles.button}
          >
            Reset Password
          </Button>
        </View>
      )}

      <OTPModal
        visible={otpVisible}
        onVerify={handleOTPVerify}
        onResend={requestOTP}
        onDismiss={() => {
          setOtpVisible(false);
          setPhone('');
        }}
      />

      {loading && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
    </SafeAreaView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, padding: 20 },
    inner: { flex: 1, justifyContent: 'center' },
    input: { marginBottom: 12 },
    button: { marginTop: 10, paddingVertical: 6 },
    loader: { position: 'absolute', top: '50%', left: '50%' },
  });
