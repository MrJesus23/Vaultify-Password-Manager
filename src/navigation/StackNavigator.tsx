import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { Colors } from "../constants/colors";
import TabNavigator from "./TabNavigator";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ConfirmEmailScreen from "../screens/auth/ConfirmEmailScreen";
import BiometricScreen from "../screens/biometric/BiometricScreen";
import SecurityScreen from "../screens/security/SecurityScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { session, isLoading } = useAuth();
  const [biometriaVerificada, setBiometriaVerificada] = useState(false);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
          </>
        ) : !biometriaVerificada ? (
          <Stack.Screen name="Biometric">
            {() => (
              <BiometricScreen
                onVerificado={() => setBiometriaVerificada(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Security"
              component={SecurityScreen}
              options={{
                headerShown: true,
                headerTitle: "🔐 Seguridad",
                headerStyle: { backgroundColor: Colors.surface },
                headerTintColor: Colors.text,
                presentation: "modal",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
