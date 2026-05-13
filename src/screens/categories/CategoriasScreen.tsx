import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import {
  ICONOS_CATEGORIA,
  COLORES_CATEGORIA,
} from "../../constants/categoriaOpciones";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../../services/categorias.service";
import { Categoria } from "../../types";

export default function CategoriasScreen() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null,
  );

  const [nombre, setNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("🔑");
  const [colorSeleccionado, setColorSeleccionado] = useState("#6C63FF");
  const [error, setError] = useState("");

  const cargar = async () => {
    if (!user) return;
    try {
      const data = await getCategorias(user.id);
      setCategorias(data);
    } catch (e) {
      console.log("Error al cargar categorias :(", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [user]),
  );

  const limpiar = () => {
    setNombre("");
    setIconoSeleccionado("🔑");
    setColorSeleccionado("#6C63FF");
    setError("");
    setCategoriaEditando(null);
  };

  const abrirEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setNombre(categoria.nombre);
    setIconoSeleccionado(categoria.icono);
    setColorSeleccionado(categoria.color);
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    setError("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (nombre.length < 2) {
      setError("Mínimo 2 caracteres");
      return;
    }

    setCargando(true);
    try {
      if (categoriaEditando) {
        await updateCategoria(
          categoriaEditando.id,
          nombre.trim(),
          iconoSeleccionado,
          colorSeleccionado,
        );
      } else {
        await createCategoria(
          user!.id,
          nombre.trim(),
          iconoSeleccionado,
          colorSeleccionado,
        );
      }
      limpiar();
      setModalVisible(false);
      cargar();
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = (categoria: Categoria) => {
    Alert.alert(
      "¿Eliminar categoría?",
      `¿Eliminar "${categoria.nombre}"? Las credenciales de esta categoria se quedarán sin categoría asignada.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategoria(categoria.id);
              cargar();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la categoría");
            }
          },
        },
      ],
    );
  };

  const renderCategoria = ({ item }: { item: Categoria }) => (
    <View style={styles.tarjeta}>
      <View style={[styles.iconoBox, { backgroundColor: item.color + "25" }]}>
        <Text style={styles.icono}>{item.icono}</Text>
      </View>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <View style={styles.botones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => abrirEditar(item)}
        >
          <Text style={styles.btnEditarTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => handleEliminar(item)}
        >
          <Text style={styles.btnEliminarTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {categorias.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioEmoji}>📁</Text>
          <Text style={styles.vacioTitulo}>Sin categorías</Text>
          <Text style={styles.vacioSub}>
            Crea categorías para organizar tus contraseñas
          </Text>
        </View>
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoria}
          numColumns={2}
          columnWrapperStyle={styles.columnas}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          limpiar();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {categoriaEditando ? "Editar categoría" : "Nueva categoría"}
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTexto}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Trabajo, Bancos..."
              placeholderTextColor={Colors.textSecondary}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.inputLabel}>Ícono</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectorRow}
            >
              {ICONOS_CATEGORIA.map((icono) => (
                <TouchableOpacity
                  key={icono}
                  style={[
                    styles.opcionIcono,
                    iconoSeleccionado === icono && styles.opcionSeleccionada,
                  ]}
                  onPress={() => setIconoSeleccionado(icono)}
                >
                  <Text style={styles.opcionIconoTexto}>{icono}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Color</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectorRow}
            >
              {COLORES_CATEGORIA.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.opcionColor,
                    { backgroundColor: color },
                    colorSeleccionado === color &&
                      styles.opcionColorSeleccionada,
                  ]}
                  onPress={() => setColorSeleccionado(color)}
                />
              ))}
            </ScrollView>

            {/* Preview */}
            <View style={[styles.preview, { borderColor: colorSeleccionado }]}>
              <View
                style={[
                  styles.previewIcono,
                  { backgroundColor: colorSeleccionado + "25" },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{iconoSeleccionado}</Text>
              </View>
              <Text style={styles.previewNombre}>
                {nombre || "Vista previa"}
              </Text>
            </View>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => {
                  limpiar();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnGuardar}
                onPress={handleGuardar}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <Text style={styles.btnGuardarTexto}>
                    {categoriaEditando ? "Actualizar" : "Crear"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  lista: { padding: 12 },
  columnas: { gap: 8, marginBottom: 8 },
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
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  icono: { fontSize: 28 },
  nombre: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  botones: { flexDirection: "row", gap: 8, marginTop: 4 },
  btnEditar: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnEditarTexto: { fontSize: 14 },
  btnEliminar: {
    backgroundColor: "rgba(255,71,87,0.1)",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnEliminarTexto: { fontSize: 14 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabTexto: { fontSize: 30, color: Colors.text, lineHeight: 34 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "rgba(255,71,87,0.15)",
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorTexto: { color: Colors.danger, fontSize: 14 },
  inputLabel: {
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
    marginBottom: 8,
  },
  selectorRow: { marginBottom: 12 },
  opcionIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  opcionSeleccionada: { borderColor: Colors.primary, borderWidth: 2 },
  opcionIconoTexto: { fontSize: 22 },
  opcionColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  opcionColorSeleccionada: {
    borderColor: Colors.text,
    transform: [{ scale: 1.2 }],
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Colors.surfaceLight,
    marginVertical: 12,
  },
  previewIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  previewNombre: { fontSize: 16, fontWeight: "600", color: Colors.text },
  modalBotones: { flexDirection: "row", gap: 10, marginTop: 4 },
  btnCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  btnCancelarTexto: { color: Colors.textSecondary, fontWeight: "600" },
  btnGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  btnGuardarTexto: { color: Colors.text, fontWeight: "700" },
});
