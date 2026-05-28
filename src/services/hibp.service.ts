import * as Crypto from "expo-crypto";

export type ResultadoVerificacion = {
    filtrada: boolean;
    veces: number;
    mensaje: string;
};

export const verificarPasswordFiltrada = async (
    password: string,
): Promise<ResultadoVerificacion> => {
    try {
        //Generar el hash SHA-1 de la contraseña
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA1,
            password,
        );

        const hashUpperCase = hash.toUpperCase();

        //Tomar los primeros 5 caracteres del hash
        const prefijo = hashUpperCase.slice(0, 5);
        const sufijo = hashUpperCase.slice(5);

        //Consultar la API de HIBP con solo el prefijo
        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${prefijo}`,
            {
                headers: {
                    "Add-Padding": "true", // Agregar padding para mejorar la privacidad
                },
            },
        );

        if (!response.ok) {
            throw new Error("Error al consultar la API de HIBP");
        }

        const texto = await response.text();

        //Buscar el sufijo en la respuesta
        const lineas = texto.split("\n");
        for (const linea of lineas) {
            const [hashSufijo, count] = linea.split(":");
            if (hashSufijo.trim() === sufijo) {
                const veces = parseInt(count.trim());
                return {
                    filtrada: true,
                    veces,
                    mensaje: `⚠️ Esta contraseña apareció ${veces.toLocaleString()} veces en brechas de seguridad conocidas`,
                };
            }
        }

        return {
            filtrada: false,
            veces: 0,
            mensaje:
                "✅ Esta contraseña no ha sido encontrada en brechas de seguridad conocidas",
        };
    } catch (error) {
        throw new Error(
            "No se pudo verificar la contraseña, verifica tu conexión a internet e intenta nuevamente",
        );
    }
};
