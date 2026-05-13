import { supabase } from "../lib/supabase";

export const registrarAccion = async (
  usuarioId: string,
  credencialId: string,
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "VER" | "COPIAR",
) => {
  const { error } = await supabase.from("historial").insert({
    usuario_id: usuarioId,
    credencial_id: credencialId,
    accion,
  });

  if (error) console.log("Error registrando historial:", error);
};

export const getHistorial = async (usuarioId: string) => {
  const { data, error } = await supabase
    .from("historial")
    .select(
      ` *, credenciales ( sitio ) `,
    )
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.log("Error historial:", error.message);
    throw error;
  }
  return data as any[];
};
