import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
// import the OTP‑driven change password screen instead of the old forgot-password
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

const Stack = createStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'Reset Password' }} 
      />
    </Stack.Navigator>
  );
}
