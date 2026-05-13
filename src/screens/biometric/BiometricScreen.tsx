import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

type Props = {
  onVerificado: () => void;
};

export default function BiometricScreen({ onVerificado }: Props) {
  const { signOut, user } = useAuth();
  const [verificando, setVerificando] = useState(false);
  const [biometriaDisponible, setBiometriaDisponible] = useState(false);
  const [tipoBiometria, setTipoBiometria] = useState<string>("Biometría");

  useEffect(() => {
    verificarDisponibilidad();
  }, []);

  const verificarDisponibilidad = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const registrado = await LocalAuthentication.isEnrolledAsync();
    const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (compatible && registrado) {
      setBiometriaDisponible(true);

      if (
        tipos.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setTipoBiometria("Reconocimiento Facial");
      } else if (
        tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setTipoBiometria("Huella Dactilar");
      }
    }
  };

  const autenticar = async () => {
    if (!biometriaDisponible) {
      onVerificado();
      return;
    }

    setVerificando(true);
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verifica tu identidad para acceder a Vaultify`,
        fallbackLabel: "Usar contraseña del dispositivo",
        disableDeviceFallback: false,
        cancelLabel: "Cancelar",
      });

      if (resultado.success) {
        onVerificado();
      } else {
        if (resultado.error === "user_cancel") {
          return;
        }
        Alert.alert(
          "Autenticación fallida",
          "No se pudo verificar tu identidad. Intenta de nuevo.",
          [{ text: "Intentar de nuevo", onPress: autenticar }],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error con la autenticación biométrica");
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      autenticar();
    }, 500);
    return () => clearTimeout(timer);
  }, [biometriaDisponible]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconoContainer}>
          <Text style={styles.icono}>
            {tipoBiometria === "Reconocimiento facial" ? "👤" : "👆"}
          </Text>
        </View>

        <Text style={styles.titulo}>Verificación de identidad</Text>
        <Text style={styles.subtitulo}>Vaultify</Text>

        <Text style={styles.descripcion}>
          {biometriaDisponible
            ? `Usa tu ${tipoBiometria.toLowerCase()} para acceder a tu vault`
            : "Toca el botón para continuar"}
        </Text>

        {user?.email ? (
          <View style={styles.emailBox}>
            <Text style={styles.emailTexto}>🔑 {user.email}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.botones}>
        {verificando ? (
          <View style={styles.verificandoBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.verificandoTexto}>
              Verificando identidad...
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.botonBiometria} onPress={autenticar}>
            <Text style={styles.botonIcono}>
              {biometriaDisponible
                ? tipoBiometria === "Reconocimiento facial"
                  ? "👤"
                  : "☝️"
                : "🔓"}
            </Text>
            <Text style={styles.botonTexto}>
              {biometriaDisponible
                ? `Verificar con ${tipoBiometria}`
                : "Continuar"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botonSalir}
          onPress={() => {
            Alert.alert(
              "Cerrar sesión",
              "¿Quieres cerrar sesión y volver al login?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Cerrar sesión",
                  style: "destructive",
                  onPress: signOut,
                },
              ],
            );
          }}
        >
          <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
    padding: 32,
  },
  content: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  iconoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icono: { fontSize: 56 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    letterSpacing: 2,
  },
  descripcion: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  emailBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  emailTexto: { color: Colors.textSecondary, fontSize: 14 },
  botones: { gap: 12 },
  verificandoBox: { alignItems: "center", gap: 12, paddingVertical: 16 },
  verificandoTexto: { color: Colors.textSecondary, fontSize: 14 },
  botonBiometria: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  botonIcono: { fontSize: 22 },
  botonTexto: { color: Colors.text, fontSize: 16, fontWeight: "bold" },
  botonSalir: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  botonSalirTexto: { color: Colors.textSecondary, fontSize: 15 },
});
