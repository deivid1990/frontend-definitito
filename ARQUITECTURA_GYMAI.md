# ARQUITECTURA TÉCNICA - GymAI Coach
## Patrón Modelo-Vista-Controlador (MVC)

**Proyecto:** GymAI Coach  
**Fecha:** 3 de febrero de 2026  
**Versión:** 1.0

---

## 📊 DIAGRAMA DE ARQUITECTURA

![Arquitectura GymAI Coach](./ARQUITECTURA_FINAL_CONFIRMADA.png)

---

## 🏗️ DESCRIPCIÓN GENERAL

GymAI Coach implementa una **arquitectura basada en el patrón MVC (Modelo-Vista-Controlador)** con microservicios, diseñada para ofrecer una experiencia de entrenamiento personalizada mediante Inteligencia Artificial.

### Principios de Diseño

- **Separación de responsabilidades** (MVC)
- **Arquitectura de microservicios** modular
- **Integración con servicios externos** (OpenAI, Google Gemini)
- **Backend as a Service** (Supabase)
- **Frontend reactivo** (React 18 + Vite)

---

## 📱 CAPA DE PRESENTACIÓN (VISTA)

### Web App (React 18 + Vite)

**Tecnologías:**
- **React 18.2.0** - Librería de UI
- **Vite 5.0.0** - Build tool y dev server
- **React Router DOM 6.20.1** - Enrutamiento
- **Recharts 3.7.0** - Gráficos y visualizaciones
- **Lucide React 0.294.0** - Iconos
- **TailwindCSS 3.3.5** - Estilos

**Componentes Principales:**
```
src/
├── pages/
│   ├── Login.jsx           # Autenticación
│   ├── Register.jsx        # Registro de usuarios
│   ├── Dashboard.jsx       # Panel principal
│   ├── AICoach.jsx         # Chat con IA
│   ├── Routines.jsx        # Gestión de rutinas
│   ├── Exercises.jsx       # Biblioteca de ejercicios
│   ├── Profile.jsx         # Perfil físico
│   ├── TrainingSelfies.jsx # Seguimiento fotográfico
│   └── ProgressAnalysis.jsx # Análisis y estadísticas
│
├── components/
│   ├── Layout.jsx          # Estructura principal
│   ├── Navbar.jsx          # Barra de navegación
│   ├── Sidebar.jsx         # Menú lateral
│   └── ...
│
└── context/
    ├── AuthContext.jsx     # Estado de autenticación
    └── AppContext.jsx      # Estado global
```

**Responsabilidades:**
- ✅ Renderizado de interfaz de usuario
- ✅ Gestión de estado local (React Hooks)
- ✅ Interacción con el usuario
- ✅ Navegación entre vistas
- ✅ Validación de formularios

---

## 🔧 CAPA DE CONTROLADORES (MICROSERVICIOS)

### MS-AI-COACH (Coach Virtual IA)

**Descripción:** Microservicio de chat inteligente con IA para consultas y recomendaciones.

**Funcionalidades:**
- Chat conversacional con IA
- Respuestas personalizadas según perfil del usuario
- Historial de conversaciones
- Integración con OpenAI GPT-4

**Endpoints:**
```javascript
// Enviar mensaje al coach
POST /api/chat
{
  "message": "Necesito una rutina de fuerza",
  "userId": "uuid",
  "context": {...}
}

// Obtener historial
GET /api/chat/history/:userId
```

**Tecnologías:**
- OpenAI API (GPT-4)
- Supabase Functions
- PostgreSQL (almacenamiento de historial)

---

### MS-ROUTINES (Rutinas & Entrenamientos)

**Descripción:** Gestión completa de rutinas de entrenamiento personalizadas.

**Funcionalidades:**
- Generación automática de rutinas con IA
- Diseño manual de rutinas
- Activación/desactivación de rutinas
- Seguimiento de sesiones de entrenamiento
- Registro de series, repeticiones y pesos

**Endpoints:**
```javascript
// Generar rutina con IA
POST /api/routines/generate
{
  "userId": "uuid",
  "goals": ["fuerza", "hipertrofia"],
  "experience": "intermedio"
}

// Obtener rutinas del usuario
GET /api/routines/:userId

// Activar rutina
PUT /api/routines/:routineId/activate

// Registrar sesión
POST /api/workout-sessions
```

**Tecnologías:**
- OpenAI GPT-4 Turbo (generación de rutinas)
- Supabase Database (almacenamiento)
- PostgreSQL (tablas: routines, workout_sessions)

---

### MS-EXERCISES (Biblioteca de Ejercicios)

**Descripción:** Catálogo completo de ejercicios con información detallada.

**Funcionalidades:**
- Consulta de ejercicios disponibles
- Filtrado por grupo muscular
- Videos demostrativos
- Instrucciones detalladas
- Variantes de ejercicios

**Endpoints:**
```javascript
// Listar todos los ejercicios
GET /api/exercises

// Buscar ejercicios
GET /api/exercises/search?muscle=pecho&difficulty=intermedio

// Obtener detalles de ejercicio
GET /api/exercises/:exerciseId
```

**Tecnologías:**
- Supabase Database
- Supabase Storage (videos)
- PostgreSQL (tabla: exercises)

---

### MS-PROFILE (Perfil Físico)

**Descripción:** Gestión de datos biométricos y perfil del usuario.

**Funcionalidades:**
- Registro de datos personales (nombre, edad)
- Registro de medidas (peso, altura)
- Historial de cambios biométricos
- Cálculo de IMC automático
- Actualización de perfil

**Endpoints:**
```javascript
// Guardar perfil físico
POST /api/biometric-history
{
  "userId": "uuid",
  "weight": 94,
  "height": 181,
  "age": 34
}

// Obtener historial biométrico
GET /api/biometric-history/:userId

// Actualizar perfil
PUT /api/profile/:userId
```

**Tecnologías:**
- Supabase Database
- PostgreSQL (tabla: biometric_history)

---

### MS-PROGRESS (Seguimiento & Progreso)

**Descripción:** Registro fotográfico y seguimiento visual del progreso físico.

**Funcionalidades:**
- Subida de fotografías de progreso
- Galería de progreso temporal
- Comparación de fotografías
- Descripción de cada foto
- Organización por fecha

**Endpoints:**
```javascript
// Subir fotografía de progreso
POST /api/progress-photos
{
  "userId": "uuid",
  "photo": File,
  "description": "Semana 4 - Vista frontal"
}

// Obtener galería de progreso
GET /api/progress-photos/:userId

// Eliminar fotografía
DELETE /api/progress-photos/:photoId
```

**Tecnologías:**
- Supabase Storage (almacenamiento de imágenes)
- Supabase Database
- PostgreSQL (tabla: progress_photos)

---

### MS-STATS (Estadísticas & Análisis)

**Descripción:** Análisis de datos y generación de estadísticas de progreso.

**Funcionalidades:**
- Gráficos de evolución de peso
- Estadísticas de entrenamientos
- Análisis de consistencia
- Métricas de rendimiento
- Reportes personalizados

**Endpoints:**
```javascript
// Obtener estadísticas generales
GET /api/stats/:userId

// Gráfico de evolución de peso
GET /api/stats/weight-evolution/:userId

// Análisis de entrenamientos
GET /api/stats/workout-analysis/:userId
```

**Tecnologías:**
- Supabase Database
- PostgreSQL (consultas agregadas)
- Recharts (visualización en frontend)

---

## 💾 CAPA DE DATOS (MODELO)

### Supabase Auth

**Descripción:** Sistema de autenticación y autorización.

**Funcionalidades:**
- Registro de usuarios
- Login con email/password
- **Recuperación de contraseña (integrado con Gmail SMTP)**
- Gestión de sesiones
- Tokens JWT

**Configuración:**
```javascript
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### PostgreSQL

**Descripción:** Base de datos relacional principal.

**Tablas Principales:**

```sql
-- Usuarios
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP
)

-- Historial biométrico
biometric_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  weight DECIMAL,
  height DECIMAL,
  age INTEGER,
  created_at TIMESTAMP
)

-- Rutinas
routines (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP
)

-- Ejercicios
exercises (
  id UUID PRIMARY KEY,
  name TEXT,
  muscle_group TEXT,
  difficulty TEXT,
  video_url TEXT,
  instructions TEXT
)

-- Sesiones de entrenamiento
workout_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  routine_id UUID REFERENCES routines(id),
  date TIMESTAMP,
  notes TEXT
)

-- Fotografías de progreso
progress_photos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  photo_url TEXT,
  description TEXT,
  created_at TIMESTAMP
)

-- Historial de chat
chat_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message TEXT,
  response TEXT,
  created_at TIMESTAMP
)
```

---

### Supabase Storage

**Descripción:** Almacenamiento de archivos multimedia.

**Buckets:**
- `progress-photos` - Fotografías de progreso de usuarios
- `exercise-videos` - Videos demostrativos de ejercicios
- `avatars` - Fotos de perfil de usuarios

**Configuración:**
```javascript
// Subir archivo
const { data, error } = await supabase.storage
  .from('progress-photos')
  .upload(`${userId}/${filename}`, file);

// Obtener URL pública
const { data: { publicUrl } } = supabase.storage
  .from('progress-photos')
  .getPublicUrl(path);
```

---

## 🌐 SERVICIOS EXTERNOS (INTEGRACIONES)

### OpenAI GPT-4 Turbo

**Uso:** Motor de Inteligencia Artificial para todas las funcionalidades del sistema

**Funcionalidades que utiliza OpenAI:**
1. **Chat del Coach Virtual** - Respuestas conversacionales personalizadas
2. **Generación de Rutinas** - Creación automática de planes de entrenamiento
3. **Análisis de Progreso** - Interpretación de datos y recomendaciones

---

### Gmail SMTP Service

**Uso:** Servicio de mensajería para comunicaciones transaccionales del sistema.

**Funcionalidades:**
- Envío de correos para recuperación de contraseña
- Notificaciones de seguridad
- Confirmación de registro de usuario

**Configuración en Supabase:**
- SMTP Provider: Gmail
- Puerto: 587 (TLS)
- Autenticación: App Passwords de Google

**Implementación:**
```javascript
// src/lib/api.js - Chat con el Coach Virtual
export const sendChatMessage = async (messages) => {
  const response = await api.post('/api/ai/chat', { messages });
  return response;
};

// Generación de rutinas de entrenamiento
export const generateRoutine = async (options) => {
  const response = await api.post('/api/ai/generar-rutina', options);
  return response;
};
```

**Endpoints del Backend:**
```javascript
// Backend API (Vercel Functions)
POST /api/ai/chat
{
  "messages": [
    { "role": "user", "content": "Necesito una rutina de fuerza" }
  ]
}

POST /api/ai/generar-rutina
{
  "goal": "Hipertrofia",
  "level": "Intermedio",
  "days": 3,
  "equipment": "Gimnasio completo"
}
```

**Características de OpenAI GPT-4:**
- ✅ Respuestas contextuales y personalizadas
- ✅ Generación de rutinas estructuradas en JSON
- ✅ Adaptación al nivel de experiencia del usuario
- ✅ Recomendaciones basadas en objetivos específicos
- ✅ Análisis de progreso y sugerencias de mejora
- ✅ Soporte en español nativo

**Configuración:**
```javascript
// Variables de entorno requeridas
VITE_API_URL=https://tu-backend.vercel.app/api
OPENAI_API_KEY=sk-... (en el backend)
```

---

## 🔄 FLUJO DE DATOS

### Ejemplo: Generación de Rutina

```
1. Usuario (Vista)
   ↓ Click en "Generar Rutina"
   
2. Frontend (React)
   ↓ Envía petición con perfil del usuario
   
3. MS-ROUTINES (Controlador)
   ↓ Procesa solicitud
   ↓ Consulta perfil en PostgreSQL
   ↓ Llama a Google Gemini 2.5
   
4. Google Gemini (Servicio Externo)
   ↓ Genera rutina personalizada
   ↓ Retorna JSON estructurado
   
5. MS-ROUTINES (Controlador)
   ↓ Guarda rutina en PostgreSQL
   ↓ Retorna rutina al frontend
   
6. Frontend (React)
   ↓ Muestra preview de rutina
   ↓ Usuario acepta
   
7. MS-ROUTINES (Controlador)
   ↓ Activa rutina en PostgreSQL
   
8. Frontend (React)
   ↓ Muestra confirmación
```

---

## 🔒 SEGURIDAD

### Autenticación y Autorización

- **JWT Tokens** para sesiones
- **Row Level Security (RLS)** en Supabase
- **Variables de entorno** para API keys
- **HTTPS** en todas las comunicaciones
- **Validación de datos** en frontend y backend

### Políticas de Seguridad (RLS)

```sql
-- Solo el usuario puede ver sus propios datos
CREATE POLICY "Users can view own data"
ON biometric_history
FOR SELECT
USING (auth.uid() = user_id);

-- Solo el usuario puede insertar sus propios datos
CREATE POLICY "Users can insert own data"
ON biometric_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 📊 VENTAJAS DE ESTA ARQUITECTURA

### Escalabilidad
- ✅ Microservicios independientes
- ✅ Fácil agregar nuevas funcionalidades
- ✅ Separación de responsabilidades

### Mantenibilidad
- ✅ Código modular y organizado
- ✅ Patrón MVC claro
- ✅ Fácil identificación de errores

### Performance
- ✅ Vite para build rápido
- ✅ React 18 con optimizaciones
- ✅ Supabase con CDN global

### Flexibilidad
- ✅ Fácil cambiar servicios de IA
- ✅ Posibilidad de migrar a otros backends
- ✅ Integración con nuevas APIs

---

## 🚀 DESPLIEGUE

### Frontend (Vercel)
```bash
# Build de producción
npm run build

# Deploy automático con Vercel
vercel --prod
```

### Backend (Supabase)
- Hosting automático
- Base de datos PostgreSQL gestionada
- Storage con CDN
- Functions serverless

---

## 📝 CONCLUSIÓN

La arquitectura de **GymAI Coach** implementa el patrón **MVC** con una capa de microservicios que permite:

1. **Separación clara** entre Vista, Controlador y Modelo
2. **Escalabilidad** mediante microservicios independientes
3. **Integración** con servicios de IA de última generación
4. **Seguridad** mediante autenticación y políticas de acceso
5. **Performance** con tecnologías modernas (React 18, Vite)

Esta arquitectura garantiza un sistema **robusto, mantenible y escalable** para ofrecer una experiencia de entrenamiento personalizada mediante Inteligencia Artificial.

---

**Documento generado automáticamente**  
**Proyecto:** GymAI Coach  
**Fecha:** 3 de febrero de 2026  
**Versión:** 1.0
