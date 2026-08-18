import CryptoJS from 'crypto-js';

export const derivarClave = (
    passwordMaestra: string,
    userId: string
): string => {
    const salt = CryptoJS.enc.Utf8.parse(userId);

    const clave = CryptoJS.PBKDF2(passwordMaestra, salt, {
        keySize: 256 / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256,
    });

    return clave.toString();
};

export const encriptar = (texto: string, clave: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(texto, clave, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    } catch (error) {
        console.error('Error al encriptar:', error);
        throw new Error('Error al encriptar el dato');
    }
};

export const desencriptar = (textoCifrado: string, clave: string): string => {
    try {
        const decrypted = CryptoJS.AES.decrypt(textoCifrado, clave, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const resultado = decrypted.toString(CryptoJS.enc.Utf8);
        if (!resultado) throw new Error('Clave incorrecta');
        return resultado;
    } catch (error) {
        console.log('Error desencriptando:', error);
        throw new Error('No se pudo descifrar el dato');
    }
};

export const estaEncriptado = (texto: string): boolean => {
    try {
        return texto.startsWith('U2FsdGVkX1');
    } catch {
        return false;
    }
};