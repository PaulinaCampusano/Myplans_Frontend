# MyPlans — Frontend

Aplicación web de página única (SPA) para la plataforma **MyPlans**, sistema de gestión y precomisionamiento eléctrico para la industria minera. Construida con React 19 + Vite, consume todos los servicios del backend exclusivamente a través del API Gateway.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.x | Librería principal de UI |
| Vite | 8.x | Bundler y dev server |
| Tailwind CSS | 4.x | Estilos utilitarios (vía plugin Vite) |
| React Router DOM | 7.x | Navegación SPA y rutas protegidas |
| Axios | 1.x | Cliente HTTP para llamadas al API Gateway |
| react-pdf / pdfjs-dist | 9.x / 4.x | Visor de planos PDF interactivo |
| Context API | (React built-in) | Estado global de sesión y usuario |

---

## Requisitos previos

- **Node.js 20 LTS** o superior → https://nodejs.org
- **npm 10+** (incluido con Node.js 20)
- **API Gateway corriendo** en `http://localhost:8095` (ver repositorio `myplans_api_get_way`)

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/PaulinaCampusano/Myplans_Frontend.git
cd Myplans_Frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variable de entorno
cp .env.example .env
# Editar .env si el Gateway corre en una URL distinta

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación queda disponible en **http://localhost:5173**

### Otros comandos

```bash
npm run build    # Build de producción (genera /dist)
npm run preview  # Preview del build de producción
npm run lint     # Linter ESLint
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8095
```

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8095` | URL base del API Gateway. Todas las llamadas HTTP pasan por aquí. |

> **Importante:** el frontend nunca llama directamente a los microservicios individuales. Todo el tráfico pasa por el Gateway en el puerto 8095.

---

## Estructura del proyecto

```
src/
├── App.jsx                  # Definición de rutas y guards de autenticación
├── main.jsx                 # Entry point — monta AuthProvider + BrowserRouter
├── index.css                # Estilos globales
│
├── components/
│   ├── Layout.jsx           # Shell de la aplicación (sidebar, header, navegación)
│   └── ProtectedRoute.jsx   # Guard de rutas: valida token y rol antes de renderizar
│
├── context/
│   └── AuthContext.jsx      # Estado global: token, rol, nombre, email del usuario
│
├── services/                # Capa de acceso a APIs (un archivo por dominio)
│   ├── api.js               # Instancia Axios configurada con baseURL e interceptores
│   ├── auth.js              # login, logout, register, reset-password, perfil
│   ├── planos.js            # CRUD de planos y TAGs
│   ├── auditoria.js         # Consulta de historial de cambios
│   ├── reportes.js          # Exportación de Excel
│   ├── usuarios.js          # Gestión de usuarios (solo Admin)
│   └── worker.js            # Análisis IA: /analizar y /aplicar
│
└── pages/                   # Una carpeta por módulo
    ├── Login/
    ├── ResetPassword/
    ├── Dashboard/
    ├── Precarga/
    ├── Precomisionamiento/
    ├── AnalisisIA/
    ├── Exportacion/
    ├── Auditoria/
    ├── GestionUsuarios/
    └── Profile/
```

---

## Módulos y control de acceso por rol

| Módulo | Ruta | ROLE_ADMIN | ROLE_AUDITOR | ROLE_USER |
|---|---|:---:|:---:|:---:|
| Login | `/login` | ✓ | ✓ | ✓ |
| Dashboard | `/dashboard` | ✓ | ✓ | ✓ |
| Perfil | `/perfil` | ✓ | ✓ | ✓ |
| Precarga de planos | `/precarga` | ✓ | — | — |
| Precomisionamiento | `/precomisionamiento` | ✓ | ✓ | ✓ |
| Análisis IA | `/analisis-ia` | ✓ | ✓ | — |
| Exportación Excel | `/exportacion` | ✓ | ✓ | — |
| Auditoría | `/auditoria` | ✓ | ✓ | — |
| Gestión de Usuarios | `/gestion-usuarios` | ✓ | — | — |

---

## Autenticación y sesión

### Flujo de login

1. El usuario ingresa email y contraseña en `/login`.
2. El frontend hace `POST /api/auth/login` al Gateway.
3. El Gateway responde con un token JWT (HS384) que contiene los claims `rol`, `nombreCompleto`, `email` y `permisos`.
4. El frontend almacena los datos en `localStorage` y en el `AuthContext`.

### Datos almacenados en localStorage

| Clave | Contenido |
|---|---|
| `token` | JWT firmado por el Auth Service |
| `rol` | Rol del usuario (`ROLE_ADMIN`, `ROLE_AUDITOR`, `ROLE_USER`) |
| `nombreCompleto` | Nombre para mostrar en el header |
| `email` | Email del usuario autenticado |
| `permisos` | Array JSON con permisos modulares |

### Interceptor global de Axios (`src/services/api.js`)

Todas las peticiones incluyen automáticamente el header `Authorization: Bearer <token>`.

Ante cualquier respuesta **401**, el interceptor limpia el `localStorage` y emite el evento `sessionExpirada`, redirigiendo al usuario al login. Esto cubre tanto tokens expirados como tokens inválidos.

```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.dispatchEvent(new Event('sessionExpirada'));
    }
    return Promise.reject(error);
  }
);
```

### ProtectedRoute

El componente `ProtectedRoute` verifica:
1. Que exista un token válido en el contexto.
2. Que el rol del usuario esté incluido en la prop `rolesPermitidos` (si se especifica).

Si no cumple, redirige a `/login` automáticamente.

---

## Módulo de Análisis IA (Worker IA)

El módulo `/analisis-ia` integra el **Worker IA** de MyPlans, un microservicio Python que usa **Claude Vision** (Anthropic) para analizar planos eléctricos amarillados y sugerir automáticamente el estado de cada TAG.

### Flujo completo desde el frontend

```
Usuario sube PDF del plano amarillado
           ↓
POST /api/v1/worker/planos/{id}/analizar
  (multipart/form-data con el archivo PDF)
           ↓
Worker IA convierte el PDF a imágenes y consulta Claude Vision
           ↓
Retorna lista de sugerencias: [{ tagId, estadoSugerido: "APROBADO" | "OBSERVADO" }]
           ↓
Frontend muestra tabla comparativa:
  estado actual del TAG  vs  sugerencia de la IA
           ↓
Usuario confirma o rechaza cada sugerencia (individual o masiva)
           ↓
POST /api/v1/worker/planos/{id}/aplicar
  (JSON con las sugerencias confirmadas)
           ↓
Worker actualiza el estado de los TAGs confirmados en el Core Service
```

### Endpoints consumidos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/worker/planos/{id}/analizar` | Envía el PDF; recibe array de sugerencias |
| `POST` | `/api/v1/worker/planos/{id}/aplicar` | Envía las sugerencias confirmadas para persistirlas |

### Acceso

Solo disponible para roles `ROLE_ADMIN` y `ROLE_AUDITOR`. Los operadores (`ROLE_USER`) no tienen acceso a este módulo.

### Implementación (`src/services/worker.js`)

Las llamadas al Worker usan `fetch` nativo con `FormData` para el envío del PDF (multipart), y JSON para la confirmación de sugerencias. Ambas incluyen el token JWT en el header `Authorization`.

---

## Conexión con el backend

El frontend **solo habla con el API Gateway** (puerto 8095). Nunca llama directamente a los microservicios.

| Microservicio | Puerto interno | Ruta en el Gateway |
|---|---|---|
| Auth Service | 8090 | `/api/auth/**`, `/api/admin/**` |
| Core Service | 8081 | `/api/v1/**` |
| Audit Service | 8082 | `/api/v1/historial/**` |
| Reports Service | 8083 | `/api/v1/reportes/**` |
| Worker IA | 8099 | `/api/v1/worker/**` |

### CORS

CORS está configurado únicamente en el Gateway. Los microservicios individuales tienen CORS deshabilitado por diseño — si se intenta llamar a un microservicio directamente desde el navegador, se obtendrá error de CORS. Esto es correcto e intencional.

---

## Orden de arranque recomendado

Para desarrollo local, levantar los servicios en este orden antes de iniciar el frontend:

1. MySQL (XAMPP → módulo MySQL)
2. `myplans_auth` (puerto 8090)
3. `myplans_core` (puerto 8081)
4. `myplans_audit` (puerto 8082)
5. `myplans_reports` (puerto 8083)
6. `myplans_worker` (puerto 8099)
7. `myplans_api_get_way` (puerto 8095)
8. **Este frontend** (puerto 5173) — `npm run dev`

---

## Build de producción

```bash
npm run build
```

Los archivos estáticos quedan en `/dist`. Para despliegue en AWS S3:

```bash
aws s3 sync dist/ s3://myplans-frontend --delete
```

---

## Repositorios relacionados

| Servicio | Repositorio |
|---|---|
| API Gateway | https://github.com/Nicolas-Salas/myplans_api_get_way |
| Auth Service | https://github.com/Nicolas-Salas/myplans_auth |
| Core Service | https://github.com/Nicolas-Salas/myplans_core |
| Audit Service | https://github.com/Nicolas-Salas/myplans_audit |
| Reports Service | https://github.com/Nicolas-Salas/myplans_reports |
| Worker IA | (repositorio privado) |
