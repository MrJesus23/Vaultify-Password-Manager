export type OpcionesPassword = {
  longitud: number;
  mayusculas: boolean;
  numeros: boolean;
  simbolos: boolean;
};

export const generarPassword = (opciones: OpcionesPassword): string => {
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  const simbolos = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let caracteres = minusculas;
  if (opciones.mayusculas) caracteres += mayusculas;
  if (opciones.numeros) caracteres += numeros;
  if (opciones.simbolos) caracteres += simbolos;

  let password = "";
  for (let i = 0; i < opciones.longitud; i++) {
    password += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length),
    );
  }
  return password;
};

export const calcularFortaleza = (
  password: string,
): {
  nivel: "débil" | "media" | "fuerte" | "muy fuerte";
  color: string;
  porcentaje: number;
} => {
  let puntos = 0;
  if (password.length >= 8) puntos++;
  if (password.length >= 12) puntos++;
  if (/[A-Z]/.test(password)) puntos++;
  if (/[0-9]/.test(password)) puntos++;
  if (/[^A-Za-z0-9]/.test(password)) puntos++;

  if (puntos <= 1) return { nivel: "débil", color: "#FF4757", porcentaje: 25 };
  if (puntos === 2) return { nivel: "media", color: "#FFB830", porcentaje: 50 };
  if (puntos === 3) return { nivel: "fuerte", color: "#00D4AA", porcentaje: 75 };
  return { nivel: "muy fuerte", color: "#6C63FF", porcentaje: 100 };
};
