import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { getHistorial } from "../../services/historial.service";

const ACCION_CONFIG: Record<
  string,
  { icono: string; color: string; label: string }
> = {
  CREAR: { icono: "✅", color: "#00D4AA", label: "Credencial creada" },
  EDITAR: { icono: "✏️", color: "#FFB830", label: "Credencial editada" },
  ELIMINAR: { icono: "🗑️", color: "#FF4757", label: "Credencial eliminada" },
  VER: { icono: "👁️", color: "#6C63FF", label: "Credencial vista" },
  COPIAR: { icono: "📋", color: "#1E90FF", label: "Contraseña copiada" },
};

export default function HistorialScreen() {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = async () => {
    if (!user) return;
    try {
      const data = await getHistorial(user.id);
      setHistorial(data);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [user]),
  );

  const renderItem = ({ item }: { item: any }) => {
    const config = ACCION_CONFIG[item.accion] ?? {
      icono: "•",
      color: Colors.textSecondary,
      label: item.accion,
    };
    const fecha = new Date(item.created_at);
    const hoy = new Date();
    const esHoy = fecha.toDateString() === hoy.toDateString();

    const fechaTexto = esHoy
      ? `Hoy ${fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
      : fecha.toLocaleString("es-CO", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });

    return (
      <View style={styles.item}>
        <View
          style={[styles.iconoBox, { backgroundColor: config.color + "20" }]}
        >
          <Text style={styles.icono}>{config.icono}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{config.label}</Text>
          {item.credenciales?.sitio && (
            <Text style={styles.sitio}>{item.credenciales.sitio}</Text>
          )}
          <Text style={styles.fecha}>{fechaTexto}</Text>
        </View>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {historial.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioEmoji}>📋</Text>
          <Text style={styles.vacioTitulo}>Sin actividad</Text>
          <Text style={styles.vacioSub}>
            Tus acciones en el vault aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.contador}>
              {historial.length} acciones registradas
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  lista: { padding: 12 },
  contador: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  vacio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  vacioEmoji: { fontSize: 56 },
  vacioTitulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  vacioSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icono: { fontSize: 20 },
  info: { flex: 1 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  sitio: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  fecha: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
