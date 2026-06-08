import * as Notifications from "expo-notifications";
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { verificarPasswordFiltrada } from './hibp.service';

const TASK_VERIFICAR_PASSWORDS = 'verificar-passwords-filtradas';
const DIAS_SIN_ACTUALIZAR = 90;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const pedirPermisosNotificaciones = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

export const verificarPasswordsViejas = async (usuarioId: string) => {
    try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - DIAS_SIN_ACTUALIZAR);

        const { data, error } = await supabase
            .from('credenciales')
            .select('id, sitio, updated_at')
            .eq('usuario_id', usuarioId)
            .lt('updated_at', fechaLimite.toISOString());

        if (error || !data || data.length === 0) return;

        if (data.length === 1) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Contraseña desactualizada',
                    body: `Tu contraseña de ${data[0].sitio} lleva más de ${DIAS_SIN_ACTUALIZAR} días sin actualizarse`,
                    data: { tipo: 'desactualizada', credencialId: data[0].id },
                },
                trigger: null,
            });
        } else {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Contraseñas desactualizadas',
                    body: `Tienes ${data.length} contraseñas que llevan más de ${DIAS_SIN_ACTUALIZAR} días sin actualizarse`,
                    data: { tipo: 'desactualizadas' },
                },
                trigger: null,
            });
        }
    } catch (error) {
        console.log('Error verificando passwords viejas:', error);
    }
};

export const verificarPasswordsFiltradas = async (usuarioId: string) => {
    try {
        const { data, error } = await supabase
            .from('credenciales')
            .select('id, sitio, password')
            .eq('usuario_id', usuarioId);

        if (error || !data || data.length === 0) return;

        const filtradas: string[] = [];

        for (const credencial of data) {
            try {
                const resultado = await verificarPasswordFiltrada(credencial.password);
                if (resultado.filtrada) {
                    filtradas.push(credencial.sitio);
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch {
                continue;
            }
        }

        if (filtradas.length === 0) return;

        if (filtradas.length === 1) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🚨 ¡Contraseña comprometida!',
                    body: `Tu contraseña de ${filtradas[0]} aparece en brechas de seguridad. Cámbiala inmediatamente.`,
                    data: { tipo: 'filtrada' },
                },
                trigger: null,
            });
        } else {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🚨 ¡Contraseñas comprometidas!',
                    body: `${filtradas.length} contraseñas aparecen en brechas de seguridad: ${filtradas.slice(0, 3).join(', ')}${filtradas.length > 3 ? '...' : ''}`,
                    data: { tipo: 'filtradas' },
                },
                trigger: null,
            });
        }
    } catch (error) {
        console.log('Error verificando passwords filtradas:', error);
    }
};

export const programarVerificacionDiaria = async (usuarioId: string) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🔐 Vaultify',
            body: 'Verificando la seguridad de tu vault...',
            data: { tipo: 'verificacion_diaria', usuarioId },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 9,
            minute: 0,
            repeats: true,
        },
    });
};

