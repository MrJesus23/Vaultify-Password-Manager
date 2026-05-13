import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import StackNavigator from "./src/navigation/StackNavigator";

export default function App() {
  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
}
