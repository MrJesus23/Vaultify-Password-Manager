import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function ConfirmEmailScreen({ route, navigation }: any) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.icono}>📧</Text>
      <Text style={styles.titulo}>¡Revisa tu correo!</Text>
      <Text style={styles.descripcion}>
        Hemos enviado un enlace de confirmación a:
      </Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.instruccion}>
        Abre tu correo y haz clic en el enlace para activar tu cuenta.
      </Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.botonTexto}>Ir al Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icono: { fontSize: 72, marginBottom: 24 },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  descripcion: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginVertical: 12,
    textAlign: "center",
  },
  instruccion: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  boton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  botonTexto: { color: Colors.text, fontSize: 16, fontWeight: "bold" },
});
