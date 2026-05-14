# 🔐 VAULTIFY

Gestor de contraseñas seguro desarrollado con React Native y Expo.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## ✨ Funcionalidades

- 🔑 **Vault cifrado** — guarda credenciales de forma segura en la nube
- 🛡️ **Autenticación en 3 capas** — confirmación por correo, contraseña y biometría
- ⚡ **Generador de contraseñas** — con indicador de fortaleza en tiempo real
- 📁 **Categorías personalizadas** — con ícono y color seleccionable
- ⭐ **Favoritos** — acceso rápido a tus credenciales más usadas
- 📋 **Audit trail** — historial completo de acciones del vault
- 👆 **Biometría** — huella dactilar y Face ID nativos

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React Native + Expo | Framework móvil multiplataforma |
| TypeScript | Tipado estático |
| Supabase | Base de datos PostgreSQL en la nube |
| Row Level Security | Seguridad a nivel de base de datos |
| expo-local-authentication | Biometría nativa |
| expo-secure-store | Almacenamiento seguro de sesión |
| React Navigation | Navegación Stack y Bottom Tabs |

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- Expo Go en tu celular o Android Studio

### Pasos

**1. Clona el repositorio:**
```bash
git clone https://github.com/tu-usuario/PassVault.git
cd PassVault
```

**2. Instala las dependencias:**
```bash
npm install
```

**3. Configura las variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:
    EXPO_PUBLIC_SUPABASE_URL=https://ypercbgqavubvjzuhsdz.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXJjYmdxYXZ1YnZqenVoc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzQ4NTksImV4cCI6MjA5MzExMDg1OX0.zZGiJp4tWMwkOxfH8EzPD9g6jDVJIapYYnx6_FpA70c

**4. Corre el proyecto:**
```bash
npx expo start
```

## 🗄️ Estructura del proyecto

src/
├── constants/        # Colores y opciones de categorías
├── context/          # AuthContext — manejo de sesión global
├── lib/              # Cliente de Supabase
├── navigation/       # Stack y Tab Navigator
├── screens/          # Pantallas organizadas por módulo
│   ├── auth/         # Login, Register, ConfirmEmail
│   ├── biometric/    # Verificación biométrica
│   ├── home/         # Dashboard principal
│   ├── credentials/  # Vault de contraseñas
│   ├── categories/   # Gestión de categorías
│   ├── favorites/    # Credenciales favoritas
│   └── history/      # Audit trail
├── services/         # Lógica de acceso a datos
│   ├── credenciales.service.ts
│   ├── categorias.service.ts
│   └── historial.service.ts
├── types/            # Tipos TypeScript compartidos
└── utils/            # Generador de contraseñas

## 🔒 Modelo de seguridad

Registro ──→ Confirmación por correo
│
▼
Login ──→ JWT firmado por Supabase ──→ Guardado en SecureStore
│
▼
Verificación biométrica (huella / Face ID)
│
▼
Vault 🔐

**Row Level Security** — cada usuario solo puede ver y modificar sus propios datos. Las políticas viven en el servidor, no en el cliente.

**Audit trail** — cada acción (crear, editar, eliminar, copiar) queda registrada con timestamp. Cumple con estándares de trazabilidad de datos.

## 🗃️ Modelo de datos

auth.users (Supabase Auth)
│
├──→ categorias (id, nombre, icono, color)
│
├──→ credenciales (sitio, username, password, url, notas, es_favorito)
│         │
│         └──→ categorias (FK)
│
└──→ historial (credencial_id, accion, created_at)

## 👨‍💻 Autor

**Jesús Daniel Bustamante Gómez**
- GitHub: [@MrJesus23](https://github.com/MrJesus23)
- Proyecto académico — Desarrollo Móvil 2026-I