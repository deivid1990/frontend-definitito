# 🚀 Guía Rápida - Ver Coverage en Terminal

## ✅ Comandos Principales

### 1️⃣ Ver Coverage Completo
```bash
npm run coverage
```
**Esto muestra:**
- ✅ Tabla con % de cobertura por archivo
- ✅ % de líneas, funciones, ramas y sentencias
- ✅ Archivos que NO cumplen el umbral del 80%

### 2️⃣ Ejecutar Tests en Modo Watch
```bash
npm run test
```
**Esto:**
- ✅ Ejecuta los tests continuamente
- ✅ Se re-ejecuta al guardar cambios
- ✅ Muestra errores en tiempo real

### 3️⃣ Ejecutar Tests Una Vez
```bash
npm run test:run
```
**Esto:**
- ✅ Ejecuta todos los tests una sola vez
- ✅ Muestra cuántos pasaron/fallaron
- ✅ No genera reporte de coverage

### 4️⃣ Ver Coverage con Interfaz Visual
```bash
npm run coverage:ui
```
**Esto abre:**
- 🌐 Navegador en `http://localhost:51204/__vitest__/`
- ✅ Vista interactiva de todos los tests
- ✅ Coverage por archivo con colores
- ✅ Líneas exactas que faltan testear

## 📊 Cómo Leer el Reporte de Coverage

Cuando ejecutas `npm run coverage`, verás algo así:

```
 % Coverage report from v8
-------------------------------|---------|----------|---------|---------|
File                           | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------|---------|----------|---------|---------|
All files                      |   45.23 |    38.12 |   42.67 |   45.89 |
 src                           |   100   |    100   |   100   |   100   |
  App.jsx                      |   100   |    100   |   100   |   100   |
 src/components                |   52.34 |    45.23 |   50.12 |   53.45 |
  Layout.jsx                   |   78.90 |    65.43 |   75.00 |   79.12 |
  ConfirmModal.jsx             |   25.00 |    20.00 |   30.00 |   26.00 |
 src/pages                     |   48.12 |    40.56 |   45.23 |   49.34 |
  Dashboard.jsx                |   82.45 |    70.12 |   80.00 |   83.21 |
  Login.jsx                    |   85.67 |    75.34 |   82.00 |   86.45 |
  Profile.jsx                  |   15.23 |    10.45 |   12.00 |   16.78 |
  Routines.jsx                 |   20.34 |    15.67 |   18.00 |   21.45 |
 src/lib                       |   65.43 |    55.67 |   60.00 |   66.78 |
  api.js                       |   75.00 |    60.00 |   70.00 |   76.34 |
  supabaseClient.js            |   50.00 |    45.00 |   50.00 |   52.00 |
-------------------------------|---------|----------|---------|---------|
```

### 📖 Significado de las Columnas:

- **% Stmts** (Statements): % de sentencias ejecutadas
- **% Branch**: % de ramas condicionales (if/else) ejecutadas
- **% Funcs** (Functions): % de funciones ejecutadas
- **% Lines**: % de líneas de código ejecutadas

### 🎯 Colores en Terminal:

- 🟢 **Verde** (≥80%): ¡Excelente! Cumple el objetivo
- 🟡 **Amarillo** (50-79%): Necesita más tests
- 🔴 **Rojo** (<50%): Prioridad alta para testear

## 🔍 Ver Reporte HTML Detallado

Después de ejecutar `npm run coverage`, se genera un reporte HTML:

```bash
# 1. Ejecutar coverage
npm run coverage

# 2. Abrir el reporte HTML
# Windows:
start coverage/index.html

# O navega manualmente a:
# c:\Users\david\OneDrive\Escritorio\gymai-proyecto\frontend\ai-gym-trainer\coverage\index.html
```

El reporte HTML muestra:
- ✅ Cada archivo con su coverage
- ✅ Líneas exactas que NO están cubiertas (en rojo)
- ✅ Líneas cubiertas (en verde)
- ✅ Navegación por carpetas

## 🐛 Si los Tests Fallan

Es normal que algunos tests fallen al principio. Para ver los errores:

```bash
npm run test:run
```

Esto mostrará:
- ❌ Qué tests fallaron
- 📝 El mensaje de error exacto
- 📍 En qué línea falló

## 📈 Estado Actual del Proyecto

Actualmente tienes:
- ✅ **4 archivos de tests** creados
- ✅ **~21 tests** implementados
- 🎯 **Objetivo**: 80% de coverage en todo el proyecto

### Tests Creados:
1. ✅ `Dashboard.test.jsx` - 4 tests
2. ✅ `Login.test.jsx` - 6 tests  
3. ✅ `api.test.js` - 7 tests
4. ✅ `Layout.test.jsx` - 8 tests

### Archivos que Necesitan Tests:
- ⏳ `Profile.jsx`
- ⏳ `Routines.jsx`
- ⏳ `Exercises.jsx`
- ⏳ `WorkoutSession.jsx`
- ⏳ `TrainingSelfies.jsx`
- ⏳ `AICoach.jsx`
- ⏳ `History.jsx`
- ⏳ `AuthContext.jsx`

## 💡 Tip Rápido

Para ver solo el resumen sin ejecutar todos los tests:

```bash
npm run coverage 2>&1 | findstr /C:"% Coverage" /C:"All files" /C:"|"
```

Esto filtra solo la tabla de coverage.

## 🎯 Próximo Paso

1. Ejecuta: `npm run coverage`
2. Revisa qué archivos tienen <80%
3. Crea tests para esos archivos
4. Repite hasta alcanzar 80% global

---

**¿Necesitas ayuda?** Los tests están en `src/test/` y puedes modificarlos según tus necesidades.
