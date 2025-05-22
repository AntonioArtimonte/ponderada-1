// components/UI/OTPModal.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Text, TextInput, Button, useTheme } from 'react-native-paper';

export default function OTPModal({ 
  visible,        // boolean 
  onVerify,       // fn(code) 
  onResend,       // fn() 
  onDismiss       // fn() 
}) {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [counter, setCounter] = useState(60);

  // countdown timer for “Resend”
  useEffect(() => {
    if (!visible) return;
    setCounter(60);
    const iv = setInterval(() => {
      setCounter(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [visible, onResend]);

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
      <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.primary }}>
        Enter the 6‑digit code
      </Text>

      <TextInput
        label="OTP Code"
        mode="outlined"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        maxLength={6}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => onVerify(code)}
        disabled={code.length < 6}
        style={styles.button}
      >
        Verify
      </Button>

      <View style={styles.resendRow}>
        <Button
          onPress={onResend}
          disabled={counter > 0}
          compact
        >
          {counter > 0 ? `Resend in ${counter}s` : 'Resend Code'}
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  resendRow: {
    alignItems: 'center',
  },
});
