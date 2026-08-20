import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator, } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import { getCategorias } from "../../services/categorias.service";
import { getCredenciales, createCredencial, updateCredencial, toggleFavorito, deleteCredencial, desencriptarCredencial } from "../../services/credenciales.service";
import { registrarAccion } from "../../services/historial.service";
import { generarPassword, calcularFortaleza, } from "../../utils/passwordGenerator";
import { Categoria } from "../../types";
import VerificadorPassword from "../../components/VerificadorPassword";
import { useBiometric } from "../../hooks/useBiometric";

export default function CredencialesScreen() {
  const { user, claveMaestra } = useAuth();
  const [credenciales, setCredenciales] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [credencialEditando, setCredencialEditando] = useState<any | null>(null,);
  const [credencialDetalle, setCredencialDetalle] = useState<any | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [longitud, setLongitud] = useState(16);
  const [usaMayusculas, setUsaMayusculas] = useState(true);
  const [usaNumeros, setUsaNumeros] = useState(true);
  const [usaSimbolos, setUsaSimbolos] = useState(true);

  const [sitio, setSitio] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notas, setNotas] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { verificando, verificarIdentidad } = useBiometric();

  const cargar = async () => {
    if (!user || !claveMaestra) return;
    try {
      const [creds, cats] = await Promise.all([
        getCredenciales(user.id),
        getCategorias(user.id),
      ]);
      const credsDesencriptadas = creds.map(c => desencriptarCredencial(c, claveMaestra));

      setCredenciales(credsDesencriptadas);
      setCategorias(cats);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [user]),
  );

  const credencialesFiltradas = credenciales.filter((c) => {
    const coincideBusqueda =
      busqueda === "" ||
      c.sitio.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.username.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      !filtroCategoria || c.categoria_id === filtroCategoria;
    return coincideBusqueda && coincideCategoria;
  });

  const limpiar = () => {
    setSitio("");
    setUsername("");
    setPassword("");
    setUrl("");
    setNotas("");
    setCategoriaId(null);
    setError("");
    setCredencialEditando(null);
    setMostrarPassword(false);
    setMostrarGenerador(false);
  };

  const abrirEditar = (cred: any) => {
    setCredencialEditando(cred);
    setSitio(cred.sitio);
    setUsername(cred.username);
    setPassword(cred.password);
    setUrl(cred.url ?? "");
    setNotas(cred.notas ?? "");
    setCategoriaId(cred.categoria_id);
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    setError("");
    if (!sitio.trim()) {
      setError("El sitio es obligatorio");
      return;
    }
    if (!username.trim()) {
      setError("El usuario es obligatorio");
      return;
    }
    if (!password.trim()) {
      setError("La contraseña es obligatoria");
      return;
    }
    if (!claveMaestra) {
      setError("Error de sesión, vuelve a iniciar sesión");
      return;
    }

    setCargando(true);
    try {
      const datos = {
        sitio: sitio.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim() || undefined,
        notas: notas.trim() || undefined,
        categoria_id: categoriaId || undefined,
      };

      if (credencialEditando) {
        await updateCredencial(credencialEditando.id, datos, claveMaestra);
        await registrarAccion(user!.id, credencialEditando.id, "EDITAR");
      } else {
        await createCredencial(user!.id, datos, claveMaestra);
        const creds = await getCredenciales(user!.id);
        if (creds[0]) await registrarAccion(user!.id, creds[0].id, "CREAR");
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

  const handleEliminar = (cred: any) => {
    Alert.alert(
      "¿Eliminar credencial?",
      `¿Eliminar "${cred.sitio}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await registrarAccion(user!.id, cred.id, "ELIMINAR");
            await deleteCredencial(cred.id);
            cargar();
          },
        },
      ],
    );
  };

  const handleCopiar = async (texto: string, tipo: string, credId: string) => {
    await Clipboard.setStringAsync(texto);
    await registrarAccion(user!.id, credId, "COPIAR");
    Alert.alert("✅ Copiado", `${tipo} copiado al portapapeles`);
  };

  const handleToggleFavorito = async (cred: any) => {
    await toggleFavorito(cred.id, !cred.es_favorito);
    cargar();
  };

  const handleGenerar = () => {
    const nueva = generarPassword({
      longitud,
      mayusculas: usaMayusculas,
      numeros: usaNumeros,
      simbolos: usaSimbolos,
    });
    setPassword(nueva);
  };

  const fortaleza = React.useMemo(() => {
    if (!password)
      return { nivel: "débil" as const, color: "#FF4757", porcentaje: 0 };
    return calcularFortaleza(password);
  }, [password]);

  const renderCredencial = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => {
        verificarIdentidad(
          () => {
            setCredencialDetalle(item);
            setModalDetalle(true);
          }
        )
      }}
    >
      <View style={styles.tarjetaLeft}>
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
        <View style={styles.tarjetaInfo}>
          <Text style={styles.tarjetaSitio}>{item.sitio}</Text>
          <Text style={styles.tarjetaUsername}>{item.username}</Text>
          {item.categorias && (
            <Text
              style={[
                styles.tarjetaCategoria,
                { color: item.categorias.color },
              ]}
            >
              {item.categorias.nombre}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.tarjetaRight}>
        <TouchableOpacity onPress={() => handleToggleFavorito(item)}>
          <Text style={styles.favIcono}>{item.es_favorito ? "⭐" : "☆"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleCopiar(item.password, "Contraseña", item.id)}
        >
          <Text style={styles.copiarIcono}>📋</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Buscar credenciales..."
          placeholderTextColor={Colors.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtro por categoría */}
      {categorias.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtros}
          contentContainerStyle={styles.filtrosContent}
        >
          <TouchableOpacity
            style={[styles.filtroChip, !filtroCategoria && styles.filtroActivo]}
            onPress={() => setFiltroCategoria(null)}
          >
            <Text
              style={[
                styles.filtroTexto,
                !filtroCategoria && styles.filtroTextoActivo,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filtroChip,
                filtroCategoria === cat.id && styles.filtroActivo,
                filtroCategoria === cat.id && { borderColor: cat.color },
              ]}
              onPress={() =>
                setFiltroCategoria(filtroCategoria === cat.id ? null : cat.id)
              }
            >
              <Text style={styles.filtroTexto}>
                {cat.icono} {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {verificando && (
        <View style={styles.verificandoOverlay}>
          <View style={styles.verificandoCard}>
            <Text style={styles.verificandoIcono}>👆</Text>
            <Text style={styles.verificandoTexto}>Verificando identidad...</Text>
          </View>
        </View>
      )}
      {/* Lista */}
      {credencialesFiltradas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioEmoji}>🔑</Text>
          <Text style={styles.vacioTitulo}>
            {busqueda ? "Sin resultados" : "Tu vault está vacío"}
          </Text>
          <Text style={styles.vacioSub}>
            {busqueda
              ? "Intenta con otro término"
              : "Toca + para agregar tu primera contraseña"}
          </Text>
        </View>
      ) : (

        <FlatList
          data={credencialesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderCredencial}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      {/* Modal detalle */}
      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {credencialDetalle && (
              <>
                <View style={styles.detalleHeader}>
                  <View
                    style={[
                      styles.detalleAvatar,
                      {
                        backgroundColor: credencialDetalle.categorias?.color
                          ? credencialDetalle.categorias.color + "30"
                          : Colors.surfaceLight,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 28 }}>
                      {credencialDetalle.categorias?.icono ??
                        credencialDetalle.sitio.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detalleSitio}>
                      {credencialDetalle.sitio}
                    </Text>
                    {credencialDetalle.categorias && (
                      <Text
                        style={[
                          styles.detalleCategoria,
                          { color: credencialDetalle.categorias.color },
                        ]}
                      >
                        {credencialDetalle.categorias.nombre}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.detalleItem}>
                  <Text style={styles.detalleLabel}>Usuario</Text>
                  <View style={styles.detalleRow}>
                    <Text style={styles.detalleValor}>
                      {credencialDetalle.username}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopiar(
                          credencialDetalle.username,
                          "Usuario",
                          credencialDetalle.id,
                        )
                      }
                    >
                      <Text style={styles.copiarBtn}>📋 Copiar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detalleItem}>
                  <Text style={styles.detalleLabel}>Contraseña</Text>
                  <View style={styles.detalleRow}>
                    <Text style={styles.detalleValor}>
                      {mostrarPassword
                        ? credencialDetalle.password
                        : "••••••••••••"}
                    </Text>
                    <View style={styles.detalleAcciones}>
                      <TouchableOpacity
                        onPress={() => setMostrarPassword(!mostrarPassword)}
                      >
                        <Text style={styles.copiarBtn}>
                          {mostrarPassword ? "👁️‍🗨️" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleCopiar(
                            credencialDetalle.password,
                            "Contraseña",
                            credencialDetalle.id,
                          )
                        }
                      >
                        <Text style={styles.copiarBtn}>📋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Verificador de contraseña */}
                <View style={styles.detalleItem}>
                  <Text style={styles.detalleLabel}>VERIFICAR SEGURIDAD</Text>
                  <VerificadorPassword password={credencialDetalle.password} />
                </View>

                {credencialDetalle.url && (
                  <View style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>URL</Text>
                    <Text style={styles.detalleValor}>
                      {credencialDetalle.url}
                    </Text>
                  </View>
                )}

                {credencialDetalle.notas && (
                  <View style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>Notas</Text>
                    <Text style={styles.detalleValor}>
                      {credencialDetalle.notas}
                    </Text>
                  </View>
                )}

                <View style={styles.detalleBotones}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() => {
                      setModalDetalle(false);
                      abrirEditar(credencialDetalle);
                    }}
                  >
                    <Text style={styles.btnEditarTexto}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnEliminar}
                    onPress={() => {
                      setModalDetalle(false);
                      handleEliminar(credencialDetalle);
                    }}
                  >
                    <Text style={styles.btnEliminarTexto}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.btnCerrar}
                  onPress={() => {
                    setModalDetalle(false);
                    setMostrarPassword(false);
                  }}
                >
                  <Text style={styles.btnCerrarTexto}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal formulario */}
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
              {credencialEditando ? "Editar credencial" : "Nueva credencial"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorTexto}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Sitio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Gmail, Netflix, Bancolombia..."
                placeholderTextColor={Colors.textSecondary}
                value={sitio}
                onChangeText={setSitio}
              />

              <Text style={styles.inputLabel}>Usuario *</Text>
              <TextInput
                style={styles.input}
                placeholder="usuario@ejemplo.com"
                placeholderTextColor={Colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Contraseña *</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Contraseña"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setMostrarPassword(!mostrarPassword)}
                >
                  <Text>{mostrarPassword ? "👁️‍🗨️" : "👁️"}</Text>
                </TouchableOpacity>
              </View>

              {/* Indicador de fortaleza */}
              {password.length > 0 && (
                <View style={styles.fortalezaContainer}>
                  <View style={styles.fortalezaBar}>
                    <View
                      style={[
                        styles.fortalezaFill,
                        {
                          width: `${fortaleza.porcentaje}%`,
                          backgroundColor: fortaleza.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.fortalezaTexto, { color: fortaleza.color }]}
                  >
                    {fortaleza.nivel}
                  </Text>
                </View>
              )}

              {/* Verificador de contraseña */}
              {password.length >= 6 && (
                <VerificadorPassword password={password} />
              )}

              {/* Generador */}
              <TouchableOpacity
                style={styles.btnGenerador}
                onPress={() => setMostrarGenerador(!mostrarGenerador)}
              >
                <Text style={styles.btnGeneradorTexto}>
                  ⚡{" "}
                  {mostrarGenerador
                    ? "Ocultar generador"
                    : "Generar contraseña segura"}
                </Text>
              </TouchableOpacity>

              {mostrarGenerador && (
                <View style={styles.generador}>
                  <View style={styles.generadorRow}>
                    <Text style={styles.generadorLabel}>
                      Longitud: {longitud}
                    </Text>
                    <View style={styles.generadorControles}>
                      <TouchableOpacity
                        style={styles.btnLongitud}
                        onPress={() => setLongitud(Math.max(8, longitud - 1))}
                      >
                        <Text style={styles.btnLongitudTexto}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.longitudValor}>{longitud}</Text>
                      <TouchableOpacity
                        style={styles.btnLongitud}
                        onPress={() => setLongitud(Math.min(32, longitud + 1))}
                      >
                        <Text style={styles.btnLongitudTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {[
                    {
                      label: "Mayúsculas (A-Z)",
                      valor: usaMayusculas,
                      setter: setUsaMayusculas,
                    },
                    {
                      label: "Números (0-9)",
                      valor: usaNumeros,
                      setter: setUsaNumeros,
                    },
                    {
                      label: "Símbolos (!@#)",
                      valor: usaSimbolos,
                      setter: setUsaSimbolos,
                    },
                  ].map(({ label, valor, setter }) => (
                    <TouchableOpacity
                      key={label}
                      style={styles.opcionRow}
                      onPress={() => setter(!valor)}
                    >
                      <Text style={styles.opcionLabel}>{label}</Text>
                      <View
                        style={[styles.toggle, valor && styles.toggleActivo]}
                      >
                        <View
                          style={[
                            styles.toggleCirculo,
                            valor && styles.toggleCirculoActivo,
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.btnGenerar}
                    onPress={handleGenerar}
                  >
                    <Text style={styles.btnGenerarTexto}>⚡ Generar</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.inputLabel}>URL (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={Colors.textSecondary}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Categoría (opcional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                <TouchableOpacity
                  style={[styles.catChip, !categoriaId && styles.catChipActivo]}
                  onPress={() => setCategoriaId(null)}
                >
                  <Text style={styles.catChipTexto}>Sin categoría</Text>
                </TouchableOpacity>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      categoriaId === cat.id && styles.catChipActivo,
                      categoriaId === cat.id && { borderColor: cat.color },
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Text style={styles.catChipTexto}>
                      {cat.icono} {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Notas adicionales..."
                placeholderTextColor={Colors.textSecondary}
                value={notas}
                onChangeText={setNotas}
                multiline
                numberOfLines={3}
              />

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
                      {credencialEditando ? "Actualizar" : "Guardar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtros: { maxHeight: 48, backgroundColor: Colors.surface },
  filtrosContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filtroChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtroActivo: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
  },
  filtroTexto: { color: Colors.textSecondary, fontSize: 13, fontWeight: "500" },
  filtroTextoActivo: { color: Colors.primary },
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
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tarjetaLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTexto: { fontSize: 22 },
  tarjetaInfo: { flex: 1 },
  tarjetaSitio: { fontSize: 15, fontWeight: "600", color: Colors.text },
  tarjetaUsername: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  tarjetaCategoria: { fontSize: 11, fontWeight: "600", marginTop: 3 },
  tarjetaRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  favIcono: { fontSize: 18 },
  copiarIcono: { fontSize: 18 },
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
    maxHeight: "92%",
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
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  passwordRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  eyeBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  fortalezaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  fortalezaBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  fortalezaFill: { height: 4, borderRadius: 2 },
  fortalezaTexto: { fontSize: 12, fontWeight: "600", minWidth: 70 },
  btnGenerador: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnGeneradorTexto: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  generador: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  generadorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  generadorLabel: { color: Colors.text, fontWeight: "600" },
  generadorControles: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnLongitud: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  btnLongitudTexto: { color: Colors.text, fontSize: 18, lineHeight: 22 },
  longitudValor: {
    color: Colors.text,
    fontWeight: "bold",
    minWidth: 24,
    textAlign: "center",
  },
  opcionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  opcionLabel: { color: Colors.textSecondary, fontSize: 14 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: "center",
    padding: 2,
  },
  toggleActivo: { backgroundColor: Colors.primary },
  toggleCirculo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.text,
  },
  toggleCirculoActivo: { alignSelf: "flex-end" },
  btnGenerar: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  btnGenerarTexto: { color: Colors.text, fontWeight: "700" },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActivo: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
  },
  catChipTexto: { color: Colors.textSecondary, fontSize: 13 },
  modalBotones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
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
  detalleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  detalleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  detalleSitio: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  detalleCategoria: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  detalleItem: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detalleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  detalleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detalleValor: { fontSize: 15, color: Colors.text, flex: 1 },
  detalleAcciones: { flexDirection: "row", gap: 8 },
  copiarBtn: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  detalleBotones: { flexDirection: "row", gap: 10, marginTop: 8 },
  btnEditar: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnEditarTexto: { color: Colors.text, fontWeight: "600" },
  btnEliminar: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,71,87,0.1)",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnEliminarTexto: { color: Colors.danger, fontWeight: "600" },
  btnCerrar: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCerrarTexto: { color: Colors.textSecondary, fontWeight: "600" },
  verificandoOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 999,
  },
  verificandoCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 32, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  verificandoIcono: { fontSize: 48 },
  verificandoTexto: {
    fontSize: 15, color: Colors.text,
    fontWeight: '600', textAlign: 'center',
  },
});
