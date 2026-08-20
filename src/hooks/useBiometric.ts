import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export const useBiometric = () => {
    const [verificando, setVerificando] = useState(false);

    const verificarIdentidad = useCallback(async (
        onExito: () => void,
        onFallo?: () => void
    ): Promise<void> => {
        setVerificando(true);

        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const registrado = await LocalAuthentication.isEnrolledAsync();

            if (!compatible || !registrado) {
                onExito();
                return;
            }

            const resultado = await LocalAuthentication.authenticateAsync({
                promptMessage: "Verifica tu identidad para ver esta credencial",
                fallbackLabel: "Usar contraseña",
                disableDeviceFallback: false,
                cancelLabel: "Cancelar",
            });

            if (resultado.success) {
                onExito();
            } else {
                if (resultado.error === "user_cancel") return;
                Alert.alert(
                    "Verificación fallida",
                    "No se pudo verificar tu identidad.",
                    [
                        { text: "Cancelar", style: "cancel", onPress: onFallo },
                        { text: "Intentar de nuevo", onPress: () => verificarIdentidad(onExito, onFallo) },

                    ]
                );
            }
        } catch (error) {
            console.log("Error al verificar identidad:", error);
            onExito();
        } finally {
            setVerificando(false);
        }
    }, []);

    return { verificando, verificarIdentidad };
};