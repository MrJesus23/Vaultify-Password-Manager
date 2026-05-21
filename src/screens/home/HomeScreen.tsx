import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    credenciales: 0,
    categorias: 0,
    favoritos: 0,
    historial: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [ultimasCredenciales, setUltimasCredenciales] = useState<any[]>([]);

  const cargarDatos = async () => {
    if (!user) return;

    const [
      { count: totalCredenciales },
      { count: totalCategorias },
      { count: totalFavoritos },
      { count: totalHistorial },
      { data: ultimas },
    ] = await Promise.all([
      supabase.from("credenciales").select("*", { count: "exact", head: true }),
      supabase.from("categorias").select("*", { count: "exact", head: true }),
      supabase
        .from("credenciales")
        .select("*", { count: "exact", head: true })
        .eq("es_favorito", true),
      supabase.from("historial").select("*", { count: "exact", head: true }),
      supabase
        .from("credenciales")
        .select("id, sitio, username, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    setStats({
      credenciales: totalCredenciales ?? 0,
      categorias: totalCategorias ?? 0,
      favoritos: totalFavoritos ?? 0,
      historial: totalHistorial ?? 0,
    });
    setUltimasCredenciales(ultimas ?? []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [user]),
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Header de bienvenida */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bienvenida}>Hola 👋</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.botonSalir}
          onPress={() => {
            console.log("🟡 botón presionado");
            signOut();
          }}
        >
          <Text style={styles.botonSalirTexto}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de seguridad */}
      <View style={styles.banner}>
        <Text style={styles.bannerIcono}>🛡️</Text>
        <View style={styles.bannerTexto}>
          <Text style={styles.bannerTitulo}>Vault protegido</Text>
          <Text style={styles.bannerSub}>
            {stats.credenciales} contraseñas guardadas de forma segura
          </Text>
        </View>
      </View>

      {/* Tarjetas de estadísticas */}
      <Text style={styles.seccionTitulo}>Tu vault</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate("Credenciales")}
        >
          <Text style={styles.statEmoji}>🔑</Text>
          <Text style={styles.statNumero}>{stats.credenciales}</Text>
          <Text style={styles.statLabel}>Contraseñas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate("Favoritos")}
        >
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statNumero}>{stats.favoritos}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate("Categorias")}
        >
          <Text style={styles.statEmoji}>📁</Text>
          <Text style={styles.statNumero}>{stats.categorias}</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate("Historial")}
        >
          <Text style={styles.statEmoji}>📋</Text>
          <Text style={styles.statNumero}>{stats.historial}</Text>
          <Text style={styles.statLabel}>Actividad</Text>
        </TouchableOpacity>
      </View>

      {/* Últimas credenciales */}
      {ultimasCredenciales.length > 0 && (
        <>
          <Text style={styles.seccionTitulo}>Agregadas recientemente</Text>
          <View style={styles.recientesCard}>
            {ultimasCredenciales.map((cred, index) => (
              <TouchableOpacity
                key={cred.id}
                style={[
                  styles.recienteItem,
                  index < ultimasCredenciales.length - 1 &&
                    styles.recienteItemBorder,
                ]}
                onPress={() => navigation.navigate("Credenciales")}
              >
                <View style={styles.recienteAvatar}>
                  <Text style={styles.recienteAvatarLetra}>
                    {cred.sitio.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recienteInfo}>
                  <Text style={styles.recienteSitio}>{cred.sitio}</Text>
                  <Text style={styles.recienteUsername}>{cred.username}</Text>
                </View>
                <Text style={styles.recienteFlecha}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Acceso rápido */}
      <Text style={styles.seccionTitulo}>Acceso rápido</Text>
      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => navigation.navigate("Credenciales")}
      >
        <Text style={styles.botonAgregarIcono}>+</Text>
        <Text style={styles.botonAgregarTexto}>Nueva contraseña</Text>
      </TouchableOpacity>

      {/* Botón de seguridad */}
      <TouchableOpacity
        style={styles.botonSeguridad}
        onPress={() => navigation.navigate("Security")}
      >
        <View style={styles.botonSeguridadLeft}>
          <Text style={styles.botonSeguridadIcono}>🛡️</Text>
          <View>
            <Text style={styles.botonSeguridadTitulo}>
              ¿Por qué confiar en Vaultify?
            </Text>
            <Text style={styles.botonSeguridadSub}>
              Ver las 6 capas de seguridad
            </Text>
          </View>
        </View>
        <Text style={styles.botonSeguridadFlecha}>›</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bienvenida: { fontSize: 22, fontWeight: "bold", color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  botonSalir: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  botonSalirTexto: { fontSize: 20 },
  banner: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  bannerIcono: { fontSize: 36 },
  bannerTexto: { flex: 1 },
  bannerTitulo: { fontSize: 15, fontWeight: "700", color: Colors.text },
  bannerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statEmoji: { fontSize: 28 },
  statNumero: { fontSize: 26, fontWeight: "bold", color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "600" },
  recientesCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: "hidden",
  },
  recienteItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  recienteItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recienteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  recienteAvatarLetra: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  recienteInfo: { flex: 1 },
  recienteSitio: { fontSize: 15, fontWeight: "600", color: Colors.text },
  recienteUsername: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  recienteFlecha: { fontSize: 22, color: Colors.textSecondary },
  botonAgregar: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  botonAgregarIcono: { fontSize: 22, color: Colors.text, fontWeight: "bold" },
  botonAgregarTexto: { fontSize: 16, fontWeight: "700", color: Colors.text },

  botonSeguridad: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  botonSeguridadLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  botonSeguridadIcono: { fontSize: 28 },
  botonSeguridadTitulo: { fontSize: 14, fontWeight: "700", color: Colors.text },
  botonSeguridadSub: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  botonSeguridadFlecha: { fontSize: 22, color: Colors.primary },
});
