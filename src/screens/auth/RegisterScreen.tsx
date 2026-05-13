import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleRegistro = async () => {
    setError("");

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Ingresa un correo electrónico válido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    const resultado = await signUp(email.trim(), password);
    setCargando(false);

    if (resultado.ok) {
      navigation.navigate("ConfirmEmail", { email: email.trim() });
    } else {
      setError(resultado.mensaje);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Vaultify</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTexto}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setMostrarPassword(!mostrarPassword)}
            >
              <Text style={styles.eyeIcon}>
                {mostrarPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor={Colors.textSecondary}
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry={!mostrarPassword}
          />

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDisabled]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.botonTexto}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkTexto}>¿Ya tienes cuenta?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 12 },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitulo: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    backgroundColor: "rgba(255,71,87,0.15)",
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTexto: { color: Colors.danger, fontSize: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  eyeBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: { fontSize: 18 },
  boton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonDisabled: { opacity: 0.6 },
  botonTexto: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  linkBtn: { alignItems: "center", marginTop: 20 },
  linkTexto: { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.primary, fontWeight: "700" },
});
