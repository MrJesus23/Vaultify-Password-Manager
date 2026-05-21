import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Colors } from "../../constants/colors";

const CAPAS_SEGURIDAD = [
  {
    id: "1",
    icono: "🔐",
    titulo: "Cifrado en tránsito",
    resumen: "Tus datos viajan protegidos",
    detalle:
      "Toda comunicación entre Vaultify y nuestros servidores usa TLS 1.3, el mismo protocolo que usan los bancos. Ningún dato viaja en texto plano por internet.",
    color: "#6C63FF",
    nivel: "Capa 1",
  },
  {
    id: "2",
    icono: "🛡️",
    titulo: "Row Level Security",
    resumen: "Solo tú ves tus datos",
    detalle:
      "Cada consulta a la base de datos está restringida a nivel de servidor. Aunque alguien interceptara tu sesión, el servidor mismo rechazaría cualquier intento de acceder a datos de otro usuario. Esta protección vive en la base de datos, no en el código de la app.",
    color: "#00D4AA",
    nivel: "Capa 2",
  },
  {
    id: "3",
    icono: "🎟️",
    titulo: "Autenticación con JWT",
    resumen: "Sesiones firmadas criptográficamente",
    detalle:
      "Cuando inicias sesión, recibes un token JWT firmado con algoritmos criptográficos. Ese token tiene fecha de expiración y se renueva automáticamente. Se guarda en el almacenamiento seguro del sistema operativo, no en texto plano.",
    color: "#FFB830",
    nivel: "Capa 3",
  },
  {
    id: "4",
    icono: "✉️",
    titulo: "Verificación de correo",
    resumen: "Tu identidad confirmada",
    detalle:
      "Al registrarte, Vaultify verifica que el correo te pertenece antes de activar tu cuenta. Esto previene que alguien cree una cuenta con tu correo sin tu conocimiento.",
    color: "#1E90FF",
    nivel: "Capa 4",
  },
  {
    id: "5",
    icono: "👆",
    titulo: "Biometría local",
    resumen: "Tu huella nunca sale de tu dispositivo",
    detalle:
      "La verificación biométrica ocurre completamente en tu dispositivo. Vaultify nunca accede a tu huella dactilar ni a tu rostro — solo le pregunta al sistema operativo si la verificación fue exitosa. Es el mismo modelo que usa Apple Pay y Google Pay.",
    color: "#FF6B81",
    nivel: "Capa 5",
  },
  {
    id: "6",
    icono: "📋",
    titulo: "Audit trail",
    resumen: "Registro de cada acción",
    detalle:
      "Cada acción en tu vault queda registrada con fecha y hora — crear, editar, eliminar, copiar. Si alguien accediera a tu cuenta, podrías ver exactamente qué hizo y cuándo. Este modelo de trazabilidad es obligatorio en sistemas que manejan datos sensibles bajo regulaciones como el GDPR.",
    color: "#A29BFE",
    nivel: "Capa 6",
  },
];

const CapaSeguridad = ({ capa }: { capa: (typeof CAPAS_SEGURIDAD)[0] }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.capa, { borderLeftColor: capa.color }]}
      onPress={() => setExpandido(!expandido)}
      activeOpacity={0.8}
    >
      <View style={styles.capaHeader}>
        <View
          style={[styles.capaIconoBox, { backgroundColor: capa.color + "20" }]}
        >
          <Text style={styles.capaIcono}>{capa.icono}</Text>
        </View>
        <View style={styles.capaInfo}>
          <View style={styles.capaTituloRow}>
            <View
              style={[
                styles.nivelBadge,
                { backgroundColor: capa.color + "20" },
              ]}
            >
              <Text style={[styles.nivelTexto, { color: capa.color }]}>
                {capa.nivel}
              </Text>
            </View>
          </View>
          <Text style={styles.capaTitulo}>{capa.titulo}</Text>
          <Text style={styles.capaResumen}>{capa.resumen}</Text>
        </View>
        <Text style={[styles.expandirIcono, { color: capa.color }]}>
          {expandido ? "▲" : "▼"}
        </Text>
      </View>

      {expandido && (
        <View
          style={[styles.capaDetalle, { borderTopColor: capa.color + "30" }]}
        >
          <Text style={styles.capaDetalleTexto}>{capa.detalle}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SecurityScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcono}>🔐</Text>
        <Text style={styles.headerTitulo}>Seguridad de Vaultify</Text>
        <Text style={styles.headerSub}>
          Tu vault está protegido por múltiples capas de seguridad
          independientes. Una sola no es suficiente — todas trabajan juntas.
        </Text>
      </View>

      <View style={styles.badgeRow}>
        {[
          { icono: "🏦", texto: "Nivel bancario" },
          { icono: "🌍", texto: "Estándar GDPR" },
          { icono: "🔒", texto: "Zero trust" },
        ].map((badge) => (
          <View key={badge.texto} style={styles.badge}>
            <Text style={styles.badgeIcono}>{badge.icono}</Text>
            <Text style={styles.badgeTexto}>{badge.texto}</Text>
          </View>
        ))}
      </View>

      {/* Capas de seguridad */}
      <Text style={styles.seccionTitulo}>LAS 6 CAPAS DE PROTECCIÓN</Text>
      {CAPAS_SEGURIDAD.map((capa) => (
        <CapaSeguridad key={capa.id} capa={capa} />
      ))}

      {/* Mensaje final */}
      <View style={styles.mensajeFinal}>
        <Text style={styles.mensajeFinalIcono}>💡</Text>
        <Text style={styles.mensajeFinalTexto}>
          Vaultify nunca puede leer tus contraseñas guardadas. Solo tú,
          autenticado en tu dispositivo, tienes acceso a tu vault.
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: "center",
    padding: 28,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIcono: { fontSize: 52, marginBottom: 12 },
  headerTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeIcono: { fontSize: 18 },
  badgeTexto: { fontSize: 11, color: Colors.textSecondary, fontWeight: "600" },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  capa: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderLeftWidth: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  capaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  capaIconoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  capaIcono: { fontSize: 22 },
  capaInfo: { flex: 1 },
  capaTituloRow: { marginBottom: 3 },
  nivelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  nivelTexto: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  capaTitulo: { fontSize: 15, fontWeight: "700", color: Colors.text },
  capaResumen: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  expandirIcono: { fontSize: 12, fontWeight: "700" },
  capaDetalle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  capaDetalleTexto: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  mensajeFinal: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  mensajeFinalIcono: { fontSize: 20 },
  mensajeFinalTexto: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
