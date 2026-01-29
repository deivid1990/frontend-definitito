# 🧪 Testing y Coverage - GYMAI COACH

## 📊 Configuración Completada

Se ha configurado **Vitest** como framework de testing junto con **React Testing Library** para realizar pruebas unitarias y de integración.

## 🛠️ Herramientas Instaladas

- ✅ **Vitest** - Framework de testing rápido para Vite
- ✅ **@testing-library/react** - Utilidades para testing de componentes React
- ✅ **@testing-library/jest-dom** - Matchers personalizados para el DOM
- ✅ **@testing-library/user-event** - Simulación de eventos de usuario
- ✅ **@vitest/ui** - Interfaz visual para los tests
- ✅ **@vitest/coverage-v8** - Generación de reportes de cobertura
- ✅ **jsdom** - Simulación del DOM para tests

## 📝 Scripts Disponibles

```bash
# Ejecutar tests en modo watch (se re-ejecutan al guardar cambios)
npm run test

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests una sola vez
npm run test:run

# Generar reporte de coverage
npm run coverage

# Coverage con interfaz visual
npm run coverage:ui
```

## 📂 Estructura de Tests

```
src/
├── test/
│   ├── setup.js              # Configuración global de tests
│   ├── Dashboard.test.jsx    # Tests del Dashboard
│   ├── Login.test.jsx        # Tests del Login
│   └── api.test.js           # Tests del módulo API
```

## 🎯 Umbrales de Coverage Configurados

El proyecto está configurado con los siguientes umbrales mínimos de cobertura:

- **Líneas**: 70%
- **Funciones**: 70%
- **Ramas**: 70%
- **Sentencias**: 70%

## 📊 Cómo Ver el Reporte de Coverage

### Opción 1: Terminal
```bash
npm run coverage
```

Esto mostrará un resumen en la terminal con:
- % de líneas cubiertas
- % de funciones cubiertas
- % de ramas cubiertas
- % de sentencias cubiertas

### Opción 2: Reporte HTML
Después de ejecutar `npm run coverage`, se genera un reporte HTML en:
```
coverage/index.html
```

Abre este archivo en tu navegador para ver un reporte detallado e interactivo.

### Opción 3: Interfaz Visual
```bash
npm run coverage:ui
```

Esto abre una interfaz web en `http://localhost:51204/__vitest__/` donde puedes:
- Ver los tests en tiempo real
- Ver el coverage de cada archivo
- Re-ejecutar tests específicos
- Ver detalles de errores

## 🧪 Tests Creados

### 1. Dashboard Tests (`Dashboard.test.jsx`)
- ✅ Renderizado del título principal
- ✅ Visualización del loader inicial
- ✅ Renderizado de tarjetas de estadísticas
- ✅ Enlaces a otras secciones

### 2. Login Tests (`Login.test.jsx`)
- ✅ Renderizado del formulario
- ✅ Escritura en campos de email y password
- ✅ Llamada a signIn al enviar formulario
- ✅ Manejo de errores de login
- ✅ Enlaces a registro y recuperación de contraseña

### 3. API Tests (`api.test.js`)
- ✅ Peticiones GET
- ✅ Peticiones POST
- ✅ Peticiones PUT
- ✅ Peticiones DELETE
- ✅ Manejo de errores

## 📈 Próximos Pasos para Mejorar el Coverage

### Archivos Prioritarios para Testear:

1. **Componentes de Páginas** (Alta prioridad)
   - [ ] `Profile.jsx`
   - [ ] `Routines.jsx`
   - [ ] `Exercises.jsx`
   - [ ] `WorkoutSession.jsx`
   - [ ] `TrainingSelfies.jsx`
   - [ ] `AICoach.jsx`
   - [ ] `History.jsx`

2. **Componentes Reutilizables** (Media prioridad)
   - [ ] `Layout.jsx`
   - [ ] `ConfirmModal.jsx`
   - [ ] `ExerciseVideo.jsx`
   - [ ] `WorkoutSummaryModal.jsx`
   - [ ] `ManualWorkoutModal.jsx`

3. **Contextos y Servicios** (Alta prioridad)
   - [ ] `AuthContext.jsx`
   - [ ] `supabaseClient.js`

## 🔧 Configuración de Vitest

El archivo `vitest.config.js` incluye:
- Entorno jsdom para simular el navegador
- Setup automático de mocks
- Exclusión de archivos de configuración
- Generación de múltiples formatos de reporte (text, json, html, lcov)

## 💡 Consejos para Escribir Tests

### 1. Estructura AAA (Arrange-Act-Assert)
```javascript
it('debe hacer algo', async () => {
  // Arrange: Preparar el test
  renderWithRouter(<Component />)
  
  // Act: Ejecutar la acción
  await user.click(button)
  
  // Assert: Verificar el resultado
  expect(screen.getByText('Resultado')).toBeInTheDocument()
})
```

### 2. Usar Mocks para Dependencias Externas
```javascript
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}))
```

### 3. Esperar Elementos Asíncronos
```javascript
await waitFor(() => {
  expect(screen.getByText('Cargado')).toBeInTheDocument()
})
```

## 📊 Ejemplo de Reporte de Coverage

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   45.23 |    38.12 |   42.67 |   45.89 |
 src/pages              |   52.34 |    45.23 |   50.12 |   53.45 |
  Dashboard.jsx         |   78.90 |    65.43 |   75.00 |   79.12 |
  Login.jsx             |   82.45 |    70.12 |   80.00 |   83.21 |
 src/lib                |   65.43 |    55.67 |   60.00 |   66.78 |
  api.js                |   75.00 |    60.00 |   70.00 |   76.34 |
```

## 🎯 Objetivo

Alcanzar y mantener un **coverage mínimo del 70%** en todas las métricas para asegurar la calidad y estabilidad del código.

## 🚀 Integración Continua

Los tests pueden integrarse fácilmente en CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

**Nota**: Algunos tests pueden fallar inicialmente debido a la complejidad de los componentes. Es normal y se irán ajustando progresivamente.
