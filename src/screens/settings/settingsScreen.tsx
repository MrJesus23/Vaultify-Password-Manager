import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Switch, Alert, Linking
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import {
    verificarPasswordsViejas,
    verificarPasswordsFiltradas,
    pedirPermisosNotificaciones
} from '../../services/notifications.service';

type SeccionProps = {
    titulo: string;
};

type ItemProps = {
    icono: string;
    titulo: string;
    subtitulo?: string;
    onPress?: () => void;
    derecha?: React.ReactNode;
    color?: string;
    disabled?: boolean;
};

const Seccion = ({ titulo }: SeccionProps) => (
    <Text style={styles.seccionTitulo}>{titulo}</Text>
);

const Item = ({ icono, titulo, subtitulo, onPress, derecha, color, disabled }: ItemProps) => (
    <TouchableOpacity
        style={[styles.item, disabled && styles.itemDisabled]}
        onPress={onPress}
        disabled={disabled || !onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.itemIconoBox, { backgroundColor: (color ?? Colors.primary) + '20' }]}>
            <Text style={styles.itemIcono}>{icono}</Text>
        </View>
        <View style={styles.itemInfo}>
            <Text style={[styles.itemTitulo, color ? { color } : {}]}>{titulo}</Text>
            {subtitulo && <Text style={styles.itemSubtitulo}>{subtitulo}</Text>}
        </View>
        {derecha && (onPress && <Text style={styles.itemFlecha}>›</Text>)}
    </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: any) {
    const { user, signOut } = useAuth();
    const [notifActualizacion, setNotifActualizacion] = useState(true);
    const [notifFiltradas, setNotifFiltradas] = useState(true);

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Seguro que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const handleSoporte = () => {
        Linking.openURL('mailto:soporte@vaultify.app?subject=Soporte Vaultify&body=Hola, necesito ayuda con...');
    };

    const handlePrivacidad = () => {
        Linking.openURL('https://github.com/MrJesus23/Vaultify-Password-Manager')
    }

    const handleVerificarAhora = async () => {
        if (!user) return;

        const permiso = await pedirPermisosNotificaciones();
        if (!permiso) {
            Alert.alert('Permisos requeridos', 'Activa las notificaciones en la configuración de tu dispositivo');
            return;
        }

        Alert.alert(
            'Verificando vault',
            'Esto puede tomar unos segundos según la cantidad de contraseñas que tengas.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Verificar',
                    onPress: async () => {
                        await verificarPasswordsViejas(user.id);
                        if (notifFiltradas) {
                            await verificarPasswordsFiltradas(user.id);
                        }
                        Alert.alert('✅ Listo', 'Verificación completada. Recibirás notificaciones si encontramos problemas.');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Perfil de Usuario */}
            <View style={styles.perfilCard}>
                <View style={styles.perfilAvatar}>
                    <Text style={styles.perfilAvatarLetra}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.perfilInfo}>
                    <Text style={styles.perfilEmail}>{user?.email}</Text>
                    <View style={styles.perfilBadge}>
                        <Text style={styles.perfilBadgeTexto}>✔️ Cuenta verificada</Text>
                    </View>
                </View>
            </View>

            {/* Seguridad */}
            <Seccion titulo="SEGURIDAD" />
            <View style={styles.grupo}>
                <Item
                    icono="🔑"
                    titulo="Clave de recuperación"
                    subtitulo="Configura cómo recuperar tu cuenta"
                    onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
                />
                <View style={styles.separador} />
                <Item
                    icono="🔒"
                    titulo="Cambiar contraseña"
                    subtitulo="Actualiza tu contraseña de Vaultify"
                    onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
                />
                <View style={styles.separador} />
                <Item
                    icono="🛡️"
                    titulo="¿Por qué confiar en Vaultify?"
                    subtitulo="Ver las 6 capas de seguridad"
                    onPress={() => navigation.navigate('Security')}
                />
            </View>

            {/* Notificaciones */}
            <Seccion titulo="NOTIFICACIONES" />
            <View style={styles.grupo}>
                <Item
                    icono="⏰"
                    titulo="Contraseñas sin actualizar"
                    subtitulo="Aviso cuando llevan más de 90 días"
                    derecha={
                        <Switch
                            value={notifActualizacion}
                            onValueChange={setNotifActualizacion}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.text}
                        />
                    }
                />
                <View style={styles.separador} />
                <Item
                    icono="⚠️"
                    titulo="Contraseñas filtradas"
                    subtitulo="Alerta si aparecen en brechas conocidas"
                    derecha={
                        <Switch
                            value={notifFiltradas}
                            onValueChange={setNotifFiltradas}
                            trackColor={{ false: Colors.border, true: Colors.primary }}
                            thumbColor={Colors.text}
                        />
                    }
                />
                <View style={styles.separador} />
                <Item
                    icono="🔍"
                    titulo="Verificar vault ahora"
                    subtitulo="Comprueba todas tus contraseñas"
                    onPress={handleVerificarAhora}
                />
            </View>

            {/* Apariencia */}
            <Seccion titulo="APARIENCIA" />
            <View style={styles.grupo}>
                <Item
                    icono="🎨"
                    titulo="Tema de la app"
                    subtitulo="Oscuro · Claro · Sistema"
                    onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
                />
            </View>

            {/* Soporte */}
            <Seccion titulo="SOPORTE" />
            <View style={styles.grupo}>
                <Item
                    icono="📧"
                    titulo="Contactar soporte"
                    subtitulo="soporte@vaultify.app"
                    onPress={handleSoporte}
                />
                <View style={styles.separador} />
                <Item
                    icono="📄"
                    titulo="Política de privacidad"
                    subtitulo="Cómo manejamos tus datos"
                    onPress={handlePrivacidad}
                />
                <View style={styles.separador} />
                <Item
                    icono="ℹ️"
                    titulo="Versión"
                    subtitulo="Vaultify 1.0.0"
                    disabled
                />
            </View>

            {/* Cerrar sesión */}
            <Seccion titulo="CUENTA" />
            <View style={styles.grupo}>
                <Item
                    icono="🚪"
                    titulo="Cerrar sesión"
                    color={Colors.danger}
                    onPress={handleSignOut}
                />
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    perfilCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        margin: 16, padding: 16, backgroundColor: Colors.surface,
        borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    },
    perfilAvatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    perfilAvatarLetra: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    perfilInfo: { flex: 1, gap: 6 },
    perfilEmail: { fontSize: 15, fontWeight: '600', color: Colors.text },
    perfilBadge: {
        alignSelf: 'flex-start', backgroundColor: Colors.accent + '20',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    perfilBadgeTexto: { fontSize: 11, color: Colors.accent, fontWeight: '700' },
    seccionTitulo: {
        fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
        letterSpacing: 1.2, marginHorizontal: 16,
        marginTop: 20, marginBottom: 8,
    },
    grupo: {
        marginHorizontal: 16, backgroundColor: Colors.surface,
        borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
        overflow: 'hidden',
    },
    separador: {
        height: 1, backgroundColor: Colors.border,
        marginLeft: 60,
    },
    item: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, gap: 12,
    },
    itemDisabled: { opacity: 0.5 },
    itemIconoBox: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    itemIcono: { fontSize: 18 },
    itemInfo: { flex: 1 },
    itemTitulo: { fontSize: 15, fontWeight: '600', color: Colors.text },
    itemSubtitulo: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    itemFlecha: { fontSize: 20, color: Colors.textSecondary },
});