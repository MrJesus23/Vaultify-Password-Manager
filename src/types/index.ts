export type Categoria = {
    id: string;
    usuario_id: string;
    nombre: string;
    icono: string;
    color: string;
    created_at: string;
};

export type Credencial = {
    id: string;
    usuario_id: string;
    categoria_id: string;
    sitio: string;
    username: string;
    password: string;
    url: string | null;
    notas: string | null;
    es_favorito: boolean;
    created_at: string;
    updated_at: string;
};

export type Historial = {
    id: string;
    usuario_id: string;
    credencial_id: string;
    accion: string;
    created_at: string;
};

export type Usuario = {
    id: string;
    email: string;
}