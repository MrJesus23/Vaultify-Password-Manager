import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/colors";
import { verificarPasswordFiltrada, ResultadoVerificacion } from "../services/hibp.service";

type Props = {
    password: string;
};

export default function VerificadorPassword({ password }: Props) {
    const [verificando, setVerificando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoVerificacion | null>(null);
    const [error, setError] = useState("");

    const handleVerificar = async () => {
        if (!password.trim()) {
            setError('No hay contraseña para verificar');
            return;
        }

        setVerificando(true);
        setResultado(null);
        setError("");

        try {
            const res = await verificarPasswordFiltrada(password);
            setResultado(res);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setVerificando(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.boton, verificando && styles.botonDisabled]}
                onPress={handleVerificar}
                disabled={verificando}
            >
                {verificando ? (
                    <ActivityIndicator color={Colors.text} size="small" />
                ) : (
                    <>
                        <Text style={styles.botonIcono}>🔍</Text>
                        <Text style={styles.botonTexto}>Verificar si fue filtrada</Text>
                    </>
                )}
            </TouchableOpacity>

            {resultado && (
                <View style={[
                    styles.resultado,
                    {
                        backgroundColor: resultado.filtrada
                            ? 'rgba(255,71,87,0.1)'
                            : 'rgba(0,212,170,0.1)',
                        borderColor: resultado.filtrada ? Colors.danger : Colors.accent,
                    }
                ]}>
                    <Text style={[
                        styles.resultadoTexto,
                        { color: resultado.filtrada ? Colors.danger : Colors.accent }
                    ]}>
                        {resultado.mensaje}
                    </Text>

                    {resultado.filtrada && (
                        <Text style={styles.resultadoConsejo}>
                            💡 Te recomendamos cambiar esta contraseña inmediatamente y usar el generador de Vaultify para crear una más segura.
                        </Text>
                    )}
                </View>
            )}

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorTexto}>⚠️ {error}</Text>
                </View>
            ) : null}

            <Text style={styles.privacidadTexto}>
                🔒 Tu contraseña nunca se envía — usamos k-anonymity con SHA-1
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { marginTop: 8, marginBottom: 8 },
    boton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: 12, borderRadius: 10,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1, borderColor: Colors.border,
    },
    botonDisabled: { opacity: 0.6 },
    botonIcono: { fontSize: 16 },
    botonTexto: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
    resultado: {
        marginTop: 10, padding: 14, borderRadius: 12,
        borderWidth: 1, gap: 8,
    },
    resultadoTexto: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    resultadoConsejo: {
        fontSize: 13, color: Colors.textSecondary, lineHeight: 18,
    },
    errorBox: {
        marginTop: 10, padding: 12, borderRadius: 10,
        backgroundColor: 'rgba(255,71,87,0.1)',
        borderWidth: 1, borderColor: Colors.danger,
    },
    errorTexto: { color: Colors.danger, fontSize: 13 },
    privacidadTexto: {
        fontSize: 11, color: Colors.textSecondary,
        textAlign: 'center', marginTop: 8,
    },
});
