import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { getCredenciales, toggleFavorito, desencriptarCredencial } from "../../services/credenciales.service";
import { registrarAccion } from "../../services/historial.service";

export default function FavoritosScreen() {
  const { user, claveMaestra } = useAuth();
  const [favoritos, setFavoritos] = useState<any[]>([]);

  const cargar = async () => {
    if (!user || !claveMaestra) return;
    const data = await getCredenciales(user.id);
    const desencriptadas = data
      .map(c => desencriptarCredencial(c, claveMaestra))
      .filter(c => c.es_favorito);
    setFavoritos(desencriptadas);
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [user]),
  );

  const handleCopiar = async (texto: string, tipo: string, credId: string) => {
    await Clipboard.setStringAsync(texto);
    await registrarAccion(user!.id, credId, "COPIAR");
    Alert.alert("✅ Copiado", `${tipo} copiado al portapapeles`);
  };

  const handleQuitarFavorito = async (cred: any) => {
    await toggleFavorito(cred.id, false);
    cargar();
  };

  const renderFavorito = ({ item }: { item: any }) => (
    <View style={styles.tarjeta}>
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: item.categorias?.color
              ? item.categorias.color + "30"
              : Colors.surfaceLight,
          },
        ]}
      >
        <Text style={styles.avatarTexto}>
          {item.categorias?.icono ?? item.sitio.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.sitio}>{item.sitio}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnAccion}
          onPress={() => handleCopiar(item.password, "Contraseña", item.id)}
        >
          <Text style={styles.btnAccionTexto}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnAccion}
          onPress={() => handleQuitarFavorito(item)}
        >
          <Text style={styles.btnAccionTexto}>⭐</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {favoritos.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioEmoji}>⭐</Text>
          <Text style={styles.vacioTitulo}>Sin favoritos</Text>
          <Text style={styles.vacioSub}>
            Toca la estrella en cualquier credencial para agregarla aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={renderFavorito}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  lista: { padding: 12, gap: 8 },
  vacio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  vacioEmoji: { fontSize: 56 },
  vacioTitulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  vacioSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  tarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTexto: { fontSize: 22 },
  info: { flex: 1 },
  sitio: { fontSize: 15, fontWeight: "600", color: Colors.text },
  username: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  acciones: { flexDirection: "row", gap: 8 },
  btnAccion: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnAccionTexto: { fontSize: 16 },
});
