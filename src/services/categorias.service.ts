import { supabase } from "../lib/supabase";
import { Categoria } from "../types";

export const getCategorias = async (usuarioId: string) => {
    const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("nombre", { ascending: true });

    if (error) throw error;;
    return data as Categoria[];
};

export const createCategoria = async (
    usuarioId: string,
    nombre: string,
    icono: string,
    color: string
) => {
    const { error } = await supabase
        .from("categorias")
        .insert({ usuario_id: usuarioId, nombre, icono, color });
    
    if (error) {
        if (error.message.includes("duplicate")){
            throw new Error("Ya tienes una categoria con ese nombre");
        }
        throw error;
    }
};

export const updateCategoria = async (
    id: string,
    nombre: string,
    icono: string,
    color: string
) => {
    const { error } = await supabase
        .from("categorias")
        .update({ nombre, icono, color})
        .eq("id", id);
    
    if (error) throw error;
};

export const deleteCategoria = async (id: string) => {
    const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id);
    
    if (error) throw error;
};

