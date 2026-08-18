import { supabase } from "../lib/supabase";
import { encriptar, desencriptar, estaEncriptado } from "./encryption.service";
import { Credencial } from "../types";

export const getCredenciales = async (usuarioId: string) => {
  const { data, error } = await supabase
    .from("credenciales")
    .select("*, categorias(nombre, icono, color)")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as any[];
};

export const getCredencialPorCategoria = async (
  usuarioId: string,
  categoriaId: string,
) => {
  const { data, error } = await supabase
    .from("credenciales")
    .select("*, categorias(nombre, icono, color)")
    .eq("usuario_id", usuarioId)
    .eq("categoria_id", categoriaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as any[];
};

export const createCredencial = async (
  usuarioId: string,
  datos: {
    sitio: string;
    username: string;
    password: string;
    url?: string;
    notas?: string;
    categoria_id?: string;
  },
  claveMaestra: string
) => {
  const { error } = await supabase
    .from("credenciales")
    .insert({
      usuario_id: usuarioId,
      ...datos,
      password: encriptar(datos.password, claveMaestra),
      username: encriptar(datos.username, claveMaestra),

    });

  if (error) throw error;
};

export const updateCredencial = async (
  id: string,
  datos: {
    sitio: string;
    username: string;
    password: string;
    url?: string;
    notas?: string;
    categoria_id?: string;
  },
  claveMaestra: string
) => {
  const { error } = await supabase
    .from("credenciales")
    .update({
      ...datos,
      password: encriptar(datos.password, claveMaestra),
      username: encriptar(datos.username, claveMaestra),
    })
    .eq("id", id);

  if (error) throw error;
};

export const desencriptarCredencial = (
  credencial: any,
  claveMaestra: string
): any => {
  try {
    return {
      ...credencial,
      password: estaEncriptado(credencial.password)
        ? desencriptar(credencial.password, claveMaestra)
        : credencial.password,
      username: estaEncriptado(credencial.username)
        ? desencriptar(credencial.username, claveMaestra)
        : credencial.username,
    };
  } catch {
    return credencial;
  }
};

export const toggleFavorito = async (id: string, esFavorito: boolean) => {
  const { error } = await supabase
    .from("credenciales")
    .update({ es_favorito: esFavorito })
    .eq("id", id);

  if (error) throw error;
};

export const deleteCredencial = async (id: string) => {
  const { error } = await supabase
    .from("credenciales")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
