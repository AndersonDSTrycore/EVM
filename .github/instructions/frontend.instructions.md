---
applyTo: "EVM-frontend/**"
---

# Instrucciones Frontend

Este archivo define las reglas obligatorias para cualquier cambio dentro del frontend.

Antes de generar o modificar código frontend, Copilot debe revisar cuando aplique:

```text
/docs/00-contexto-general.md
/docs/01-flujo-funcional.md
/docs/04-frontend-especificacion.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
/docs/07-websocket.md
```

Si una vista, ruta, componente, DTO, flujo visual, regla de rol o comportamiento no está documentado, Copilot debe preguntar antes de implementarlo.

---

# Stack Frontend

El frontend debe implementarse con:

- Angular 19.
- PrimeNG 19.
- Tailwind CSS.
- TypeScript.

---

# Arquitectura frontend

Reglas obligatorias:

- Usar componentes standalone.
- Mantener separación por módulos funcionales.
- Usar servicios para comunicación HTTP.
- Usar modelos/interfaces TypeScript para DTOs.
- Usar guards para proteger rutas.
- Usar interceptors para adjuntar JWT.
- Usar interceptors para manejo centralizado de errores cuando aplique.
- No consumir endpoints sin token salvo login.
- No duplicar lógica de negocio del backend.

---

# Regla sobre EVM

El frontend no debe calcular indicadores EVM.

No calcular en frontend:

- PV.
- EV.
- AC.
- CV.
- SV.
- CPI.
- SPI.
- EAC.
- VAC.
- Estado EVM.
- Riesgo EVM.

El frontend solo debe representar los valores e interpretaciones retornados por backend.

Las fórmulas y reglas EVM están definidas en:

```text
/docs/06-evm-calculos.md
```

---

# Layout obligatorio

La aplicación debe contar con:

## Menú lateral

- Colapsable.
- Controlado mediante botón hamburguesa.
- Persistente en vistas autenticadas.
- Debe incluir inicialmente:
  - Dashboard.
  - Projects.

## Barra superior

Debe contener:

- Botón hamburguesa al lado izquierdo.
- Título del módulo actual.
- Ícono o avatar de usuario al lado derecho.
- Nombre del usuario autenticado.
- Opción de logout.

---

# Rutas iniciales

Rutas mínimas esperadas:

```text
/login
/dashboard
/projects
/projects/:id/activities
```

Reglas:

- `/login` es pública.
- Las demás rutas requieren JWT.
- La vista inicial autenticada debe ser `/dashboard`.
- La opción `Projects` debe navegar a `/projects`.
- La acción `Ver actividades` debe navegar a `/projects/:id/activities`.

---

# Componentes esperados

Crear componentes reutilizables cuando aplique:

- Sidebar.
- Topbar.
- Dashboard cards.
- Tabla de proyectos.
- Tabla de actividades.
- Dialog CRUD.
- Dialog registro de horas.
- Dialog asignación de usuarios.
- Visualizador de indicadores.
- Componente de semáforo de estado.
- Componente de gráfico EVM.

No crear componentes visuales que no estén alineados con `/docs/04-frontend-especificacion.md`.

---

# Uso de PrimeNG

Usar PrimeNG para:

- Tablas.
- Dialogs.
- Buttons.
- Menús de acciones.
- Toasts.
- Confirm dialogs.
- Inputs.
- Selects.
- Date pickers.
- Cards.
- Charts si aplica.

Los CRUD principales deben usar dialogs de PrimeNG:

- Crear proyecto.
- Editar proyecto.
- Crear actividad.
- Editar actividad.
- Asignar usuarios.
- Registrar horas.
- Ver indicadores si se define como modal.

---

# Uso de Tailwind CSS

Usar Tailwind para:

- Layout.
- Espaciado.
- Responsive.
- Utilidades visuales.
- Organización de tarjetas.
- Ajustes de alineación.

No reemplazar componentes PrimeNG con HTML manual si PrimeNG ya cubre el caso de uso.

---

# Manejo de formularios

Reglas:

- Usar Reactive Forms.
- Validar campos obligatorios.
- Mostrar errores visuales claros.
- No permitir submit si el formulario es inválido.
- No enviar campos calculados por backend.
- No enviar indicadores EVM.
- No enviar `costo_total` como dato definitivo.
- No enviar `valor_hora_historico` como dato editable por usuario.

---

# Manejo de errores

El frontend debe consumir la estructura estándar de error definida por backend:

```text
titulo
mensaje
detalle
estado
codigo
ruta
metodo
parametros_recibidos
fecha_hora
```

Reglas:

- Mostrar al usuario mensajes claros.
- No mostrar stacktraces.
- Usar toast o mensaje contextual según la vista.
- Para errores de validación, mostrar mensajes cerca del formulario cuando aplique.
- Para errores de autenticación, redirigir a login.
- Para errores de autorización, mostrar mensaje de acceso no permitido.

---

# Manejo de listas vacías

Las consultas GET de colecciones pueden retornar:

```json
[]
```

El frontend debe mostrar estado vacío amigable.

Ejemplo:

```text
No hay actividades registradas para este proyecto.
```

No debe tratar una lista vacía como error.

---

# Seguridad frontend

Reglas:

- Guardar JWT de forma controlada.
- Adjuntar JWT mediante interceptor HTTP.
- Proteger rutas con guard.
- Redirigir a `/login` si no existe sesión.
- Ocultar acciones no permitidas según rol.
- No confiar únicamente en el frontend para permisos; backend sigue siendo fuente de verdad.

---

# Roles visuales

## LIDER

Puede ver acciones:

- Crear proyecto.
- Editar proyecto.
- Cancelar proyecto.
- Crear actividad.
- Editar actividad.
- Cancelar actividad.
- Asignar usuarios.
- Registrar horas propias o de colaboradores.
- Ver indicadores generales.

## COLABORADOR

Puede ver acciones:

- Ver actividades asignadas.
- Registrar horas propias.
- Ver indicadores de sus actividades.

No debe ver acciones administrativas.

---

# Tiempo real

El frontend debe estar preparado para recibir eventos en tiempo real según:

```text
/docs/07-websocket.md
```

Los eventos pueden actualizar:

- Dashboard.
- Tabla de proyectos.
- Tabla de actividades.
- Indicadores.
- Gráficos.
- Alertas.

El frontend no debe recalcular la lógica EVM al recibir eventos; debe refrescar o representar datos calculados por backend.

---

# Gráficos

Los gráficos deben representar información recibida desde backend.

Gráficos mínimos esperados:

- Comparación PV vs EV vs AC por actividad.
- Resumen de consumo presupuestal.
- Estado general del proyecto.

La definición visual exacta debe estar en:

```text
/docs/04-frontend-especificacion.md
```

---

# Calidad de código

Reglas:

- No duplicar lógica entre componentes.
- No mezclar lógica HTTP dentro de componentes si corresponde a servicios.
- No usar nombres genéricos como `data`, `info`, `thing` para modelos importantes.
- Mantener componentes pequeños.
- Extraer servicios cuando haya lógica compartida.
- Usar interfaces TypeScript descriptivas.
- Mantener rutas y nombres alineados con la documentación.

---

# Criterio de aceptación frontend

Un cambio frontend se considera correcto cuando:

- Respeta `/docs/04-frontend-especificacion.md`.
- Usa Angular 19 con componentes standalone.
- Protege rutas autenticadas.
- Adjunta JWT en requests.
- No calcula EVM.
- Representa correctamente indicadores enviados por backend.
- Maneja listas vacías sin error.
- Maneja errores estándar del backend.
- Usa PrimeNG para dialogs y tablas.
- Usa Tailwind para layout y organización visual.