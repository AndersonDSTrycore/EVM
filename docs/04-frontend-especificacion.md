# Especificación Frontend

## Objetivo del documento

Este documento define la especificación visual, funcional y técnica del frontend para el sistema de gestión de proyectos, actividades, registro de horas y análisis EVM.

Copilot debe usar este documento como fuente principal para implementar:

- Layout general.
- Navegación.
- Rutas.
- Componentes.
- Pantallas.
- Formularios.
- Dialogs.
- Tablas.
- Gráficos.
- Manejo visual de errores.
- Manejo de roles.
- Integración con backend.
- Integración con tiempo real.

Este documento no define reglas de base de datos ni fórmulas EVM.  
Para esos temas consultar:

```text
/docs/02-modelo-base-datos.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
```

---

# Stack Frontend

El frontend debe implementarse con:

- Angular 19.
- PrimeNG 19.
- Tailwind CSS.
- TypeScript.

---

# Paleta de colores corporativa

Los colores corporativos del sistema son:

| Rol        | Nombre      | Hex       |
|------------|-------------|-----------|
| Principal  | primary     | `#00a09a` |
| Secundario | secondary   | `#1d2751` |
| Terciario  | tertiary    | `#0078c1` |

Las variables CSS globales disponibles son:

```css
--color-primary: #00a09a;
--color-primary-hover: #008e89;
--color-primary-light: rgba(0, 160, 154, 0.1);
--color-secondary: #1d2751;
--color-secondary-hover: #16203f;
--color-tertiary: #0078c1;
--color-tertiary-light: rgba(0, 120, 193, 0.1);
```

Reglas de uso:

- El color `primary` (`#00a09a`) se usa en: botones principales, acciones positivas, íconos activos, borde inferior del topbar, marca del sidebar, estado activo del menú.
- El color `secondary` (`#1d2751`) se usa en: fondo del sidebar, títulos, textos de encabezado, avatares de usuario, colores de texto principales.
- El color `tertiary` (`#0078c1`) se usa en: acciones secundarias, enlaces, indicadores de estado informativo.
- El tema PrimeNG está configurado con el preset Aura personalizado donde `primary` corresponde a la paleta derivada de `#00a09a`.

---

# Inputs de formularios

Los inputs de formularios deben usar el patrón `FloatLabel` de PrimeNG con variante `in`:

```html
<p-floatlabel variant="in">
  <input pInputText id="campo" formControlName="campo" autocomplete="off" />
  <label for="campo">Etiqueta del campo</label>
</p-floatlabel>
```

Para campos de contraseña:

```html
<p-floatlabel variant="in">
  <p-password inputId="contrasena" formControlName="contrasena" [feedback]="false" [toggleMask]="true" />
  <label for="contrasena">Contraseña</label>
</p-floatlabel>
```

---

# Principio de experiencia de usuario

La aplicación debe seguir el principio:

```text
Don't Make Me Think
```

El usuario debe entender rápidamente:

- Qué proyectos existen.
- Qué proyectos están en riesgo.
- Qué actividades tienen problemas.
- Cuánto presupuesto se ha consumido.
- Qué avance real existe.
- Qué acciones puede ejecutar.
- Qué información necesita revisar.

El frontend debe presentar la información de forma clara, visual y directa.

---

# Convenciones obligatorias para componentes Dialog

## Patrón de visibilidad en dialogs controlados por padre

Todo componente que encapsule un `p-dialog` y reciba visibilidad desde el padre **debe** seguir este patrón:

### En el componente hijo (TypeScript)

```typescript
@Input() visible = false;
@Output() visibleChange = new EventEmitter<boolean>();
@Output() cerrarEvento = new EventEmitter<void>();

cerrar(): void {
  // limpiar estado interno si aplica
  this.visibleChange.emit(false);
  this.cerrarEvento.emit();
}
```

### En el template del componente hijo (HTML)

```html
<p-dialog
  [(visible)]="visible"
  ...
  (onHide)="cerrar()"
>
```

Usar `[(visible)]` (two-way binding) sobre el `p-dialog` interno para que PrimeNG pueda sincronizar el estado al cerrar con el botón X o al hacer clic fuera del dialog.

### En el componente padre (HTML)

```html
<app-mi-dialog
  [(visible)]="miDialogVisible"
  (cerrarEvento)="onCerrar()"
/>
```

Usar `[(visible)]` en el componente hijo para que el `@Output() visibleChange` actualice el estado del padre automáticamente.

### Regla

No usar `[visible]="..."` (one-way binding) en ningún dialog controlado por componente padre. Siempre usar `[(visible)]`.

---

## Patrón de botón de acciones contextual (menú tres puntos)

El botón que abre un menú contextual `p-menu` **no debe** usar `[rounded]="true"`.

Usar únicamente:

```html
<p-button
  icon="pi pi-ellipsis-v"
  [text]="true"
  severity="secondary"
  (onClick)="menu.toggle($event)"
  title="Acciones"
/>
```

Esto garantiza que toda el área del botón sea clicable, no solo el ícono central.

---

## Columna de acciones en tablas

La columna de acciones de una tabla debe ser visible para todos los roles que tengan al menos una acción disponible.

No envolver el `<th>` ni el `<td>` de acciones en `@if (esLider)` si los colaboradores también tienen acciones en esa tabla.

Controlar la visibilidad de cada ítem del menú dentro de `obtenerMenuAcciones()` según el rol.

---

# Reglas generales frontend

Copilot debe respetar las siguientes reglas:

- Usar componentes standalone.
- Usar servicios Angular para comunicación HTTP.
- Usar interfaces TypeScript para DTOs.
- Usar Reactive Forms.
- Usar PrimeNG para componentes principales.
- Usar Tailwind CSS para layout y organización visual.
- No duplicar lógica EVM en frontend.
- No calcular indicadores EVM en frontend.
- No decidir estados EVM en frontend.
- No enviar al backend valores calculados como definitivos.
- No mostrar acciones no permitidas según rol.
- No confiar únicamente en frontend para permisos.
- No consumir endpoints protegidos sin JWT.

---

# Estructura sugerida del proyecto frontend

La estructura puede organizarse así:

```text
src/
  app/
    core/
      auth/
      guards/
      interceptors/
      services/
      models/
    layout/
      sidebar/
      topbar/
      main-layout/
    shared/
      components/
      pipes/
      utils/
    features/
      dashboard/
      projects/
      activities/
      assignments/
      time-logs/
      indicators/
    app.routes.ts
    app.config.ts
```

---

# Responsabilidad por carpeta

## core

Debe contener elementos transversales de la aplicación.

Ejemplos:

- Servicios globales.
- Autenticación.
- Guards.
- Interceptors.
- Modelos globales.
- Manejo de sesión.

---

## layout

Debe contener componentes estructurales reutilizables.

Ejemplos:

- Sidebar.
- Topbar.
- Layout autenticado.

---

## shared

Debe contener elementos reutilizables no asociados a un módulo específico.

Ejemplos:

- Componentes de estado vacío.
- Componentes de semáforo.
- Componentes de loading.
- Pipes.
- Utilidades visuales.

---

## features

Debe contener módulos funcionales.

Ejemplos:

- Dashboard.
- Projects.
- Activities.
- Assignments.
- Time logs.
- Indicators.

---

# Rutas frontend

## Rutas mínimas

```text
/login
/dashboard
/projects
/projects/:id/activities
```

---

# Reglas de rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Pública | Pantalla de autenticación |
| `/dashboard` | Protegida | Dashboard inicial |
| `/projects` | Protegida | Dashboard de proyectos |
| `/projects/:id/activities` | Protegida | Actividades de un proyecto |

---

# Protección de rutas

Todas las rutas excepto `/login` deben estar protegidas por guard.

Reglas:

- Si no existe JWT, redirigir a `/login`.
- Si el token es inválido o expirado, redirigir a `/login`.
- Si el usuario no tiene permisos para una ruta, mostrar mensaje de acceso no permitido o redirigir a una vista permitida.

---

# Interceptor JWT

Debe existir un interceptor HTTP encargado de adjuntar el token en cada petición protegida.

Formato:

```text
Authorization: Bearer <token>
```

El interceptor no debe adjuntar token al endpoint público de login.

---

# Interceptor de errores

Debe existir manejo centralizado de errores HTTP.

Debe interpretar la estructura estándar enviada por backend:

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

Comportamiento esperado:

- Error 401: limpiar sesión y redirigir a `/login`.
- Error 403: mostrar mensaje de acceso no permitido.
- Error 400, 409, 422: mostrar mensaje funcional claro.
- Error 500, 503: mostrar mensaje general controlado.

No mostrar stacktrace al usuario.

---

# Layout autenticado

Después del login, la aplicación debe mostrar un layout común.

## Elementos

```text
Sidebar + Topbar + Contenido principal
```

---

# Sidebar

## Objetivo

Permitir navegación principal del sistema.

## Características

- Colapsable.
- Persistente en vistas autenticadas.
- Controlado por botón hamburguesa.
- Debe mantener estado visual expandido o contraído durante la sesión.

## Opciones iniciales

| Opción | Ruta | Icono sugerido | Roles |
|---|---|---|---|
| Dashboard | `/dashboard` | home | LIDER, COLABORADOR |
| Projects | `/projects` | folder | LIDER, COLABORADOR con restricciones visuales |

---

# Topbar

## Objetivo

Mostrar contexto actual y opciones de sesión.

## Elementos

| Elemento | Ubicación | Descripción |
|---|---|---|
| Botón hamburguesa | Izquierda | Expande o contrae sidebar |
| Título del módulo | Izquierda o centro | Indica vista actual |
| Ícono/avatar usuario | Derecha | Abre menú de usuario |
| Nombre usuario | Menú usuario | Muestra usuario autenticado |
| Rol usuario | Menú usuario | Muestra rol funcional |
| Logout | Menú usuario | Cierra sesión |

---

# Pantalla Login

## Ruta

```text
/login
```

## Campos

| Campo | Tipo | Obligatorio |
|---|---|---|
| Correo | Email | Sí |
| Contraseña | Password | Sí |

## Comportamiento esperado

- Validar campos obligatorios.
- Mostrar error si las credenciales son inválidas.
- Guardar token si el login es exitoso.
- Guardar información básica del usuario autenticado.
- Navegar a `/dashboard`.

## Restricciones

- No mostrar layout autenticado en login.
- No mostrar sidebar ni topbar en login.

---

# Dashboard inicial

## Ruta

```text
/dashboard
```

## Objetivo

Mostrar vista inicial simple después de autenticación.

## Contenido mínimo

- Mensaje de bienvenida.
- Nombre del usuario.
- Rol del usuario.
- Acceso rápido a Projects.
- Estado vacío o resumen futuro.

## Para LIDER

Puede mostrar:

- Acceso directo a Projects.
- Resumen general de proyectos si backend lo permite.

## Para COLABORADOR

Puede mostrar:

- Acceso a actividades asignadas.
- Mensaje indicando que solo verá información asignada.

---

# Módulo Projects

## Ruta

```text
/projects
```

## Objetivo

Mostrar proyectos y su estado general.

---

# Vista Projects para LIDER

## Elementos

- Título: `Projects`.
- Botón `Crear proyecto`.
- Tabla de proyectos.
- Filtros simples si aplica.
- Estado vacío si no hay proyectos.

## Tabla de proyectos

Columnas esperadas:

| Columna | Fuente | Descripción |
|---|---|---|
| Proyecto | backend | Nombre del proyecto |
| Estado operativo | backend | Estado administrativo |
| Presupuesto consumido | backend | Porcentaje calculado |
| Avance real | backend | Avance consolidado |
| Riesgo | backend | Estado general EVM |
| Acciones | frontend | Menú contextual |

---

# Acciones por proyecto

Las acciones deben mostrarse mediante menú de tres puntos:

```text
⋮
```

Opciones para LIDER:

- Ver actividades.
- Editar proyecto.
- Cancelar proyecto.

---

# Vista Projects para COLABORADOR

El colaborador no debe ver acciones administrativas.

Puede ver:

- Proyectos relacionados con sus actividades asignadas.
- Información limitada.
- Acceso a actividades asignadas.

No debe ver:

- Crear proyecto.
- Editar proyecto.
- Cancelar proyecto.

---

# Dialog Crear Proyecto

## Componente

Dialog PrimeNG.

## Campos

| Campo | Control | Validación |
|---|---|---|
| Nombre | Input text | Obligatorio |
| Descripción | Textarea | Opcional |
| Fecha inicio | Calendar/DatePicker | Obligatorio |
| Fecha fin | Calendar/DatePicker | Obligatorio |
| Presupuesto total | Input number | Obligatorio, mayor o igual a 0 |

## Comportamiento

- Abrir desde botón `Crear proyecto`.
- Validar antes de enviar.
- Mostrar errores de formulario.
- Al guardar correctamente, cerrar dialog.
- Actualizar tabla de proyectos.
- Mostrar mensaje de éxito.

---

# Dialog Editar Proyecto

## Componente

Dialog PrimeNG.

## Comportamiento

- Abrir desde acciones del proyecto.
- Cargar datos actuales.
- Validar campos.
- Guardar cambios.
- Actualizar tabla.
- Mostrar mensaje de éxito.
- Mostrar error funcional si backend rechaza la operación.

---

# Confirmación Cancelar Proyecto

## Componente

ConfirmDialog PrimeNG.

## Comportamiento

- Solicitar confirmación antes de cancelar.
- Si confirma, invocar endpoint correspondiente.
- Al finalizar, actualizar estado del proyecto.
- No eliminar visualmente sin confirmar respuesta exitosa.

---

# Vista Actividades del Proyecto

## Ruta

```text
/projects/:id/activities
```

## Objetivo

Mostrar detalle operativo y analítico de un proyecto.

---

# Estructura visual

La vista debe organizarse así:

```text
Encabezado del proyecto
Tarjetas de indicadores consolidados
Gráfico PV vs EV vs AC
Tabla de actividades
```

---

# Encabezado del proyecto

Debe mostrar:

- Nombre del proyecto.
- Estado operativo.
- Presupuesto total.
- Presupuesto consumido.
- Avance planificado consolidado.
- Avance real consolidado.
- Estado general EVM.
- Riesgo.

---

# Tarjetas de indicadores consolidados

Mostrar valores retornados por backend:

- BAC.
- PV.
- EV.
- AC.
- CV.
- SV.
- CPI.
- SPI.
- EAC.
- VAC.

También mostrar:

- Estado financiero.
- Estado cronograma.
- Estado general.
- Mensajes interpretativos.

---

# Gráfico EVM del proyecto

## Objetivo

Comparar visualmente:

```text
PV vs EV vs AC
```

por actividad.

## Fuente

Los valores deben venir del backend.

## Regla

El frontend no debe calcular PV, EV ni AC.

Solo debe graficar valores recibidos.

---

# Tabla de actividades

Columnas esperadas para LIDER:

| Columna | Fuente | Descripción |
|---|---|---|
| Actividad | backend | Nombre |
| Estado operativo | backend | Estado administrativo |
| Responsables | backend | Usuarios asignados |
| Avance planificado | backend | Porcentaje |
| Avance real | backend | Porcentaje |
| Presupuesto consumido | backend | AC / BAC calculado por backend |
| Estado EVM | backend | Estado general calculado |
| Acciones | frontend | Menú contextual |

---

# Acciones por actividad

Menú de tres puntos:

```text
⋮
```

Opciones para LIDER:

- Editar actividad.
- Cancelar actividad.
- Asignar usuarios.
- Registrar horas.
- Ver indicadores.

Opciones para COLABORADOR asignado:

- Registrar horas.
- Ver indicadores.

---

# Dialog Crear Actividad

## Campos

| Campo | Control | Validación |
|---|---|---|
| Nombre | Input text | Obligatorio |
| Descripción | Textarea | Opcional |
| BAC | Input number | Obligatorio, mayor o igual a 0 |
| Porcentaje avance planificado | Input number | Obligatorio, 0 a 100 |
| Porcentaje avance real | Input number | Obligatorio, 0 a 100 |
| Fecha inicio | DatePicker | Obligatorio |
| Fecha fin | DatePicker | Obligatorio |

## Comportamiento

- Abrir desde botón `Crear actividad`.
- Validar campos.
- Enviar al backend.
- Si guarda correctamente, actualizar tabla, indicadores y gráfico.
- Si backend rechaza por presupuesto, mostrar mensaje claro.

---

# Dialog Editar Actividad

## Comportamiento

- Abrir desde acciones de actividad.
- Cargar datos actuales.
- Validar campos.
- Guardar cambios.
- Actualizar tabla, indicadores y gráfico.
- Mostrar errores funcionales si aplica.

---

# Confirmación Cancelar Actividad

## Comportamiento

- Solicitar confirmación.
- Ejecutar cancelación lógica.
- Actualizar tabla, indicadores y gráfico.
- No eliminar visualmente sin respuesta exitosa.

---

# Dialog Asignar Usuarios

## Actor

Solo LIDER.

## Campos

| Campo | Control | Validación |
|---|---|---|
| Usuarios | MultiSelect | Obligatorio |

## Comportamiento

- Mostrar usuarios activos.
- Permitir seleccionar múltiples usuarios.
- No mostrar usuarios ya asignados activamente o gestionarlo visualmente.
- Guardar asignaciones.
- Actualizar responsables en tabla.

---

# Dialog Registrar Horas

## Actores

- LIDER.
- COLABORADOR.

## Campos

| Campo | Control | Validación |
|---|---|---|
| Usuario | Select | Obligatorio para LIDER cuando registra por otro |
| Fecha trabajo | DatePicker | Obligatorio |
| Horas trabajadas | Input number | Obligatorio, mayor a 0 |
| Descripción | Textarea | Opcional |

## Regla para LIDER

El líder puede seleccionar entre usuarios asignados a la actividad.

Si registra por sí mismo, debe estar asignado.

## Regla para COLABORADOR

El campo usuario no debe ser editable.

El usuario será el usuario autenticado.

## Campos que NO debe enviar como editables

El frontend no debe permitir editar:

- `valor_hora_historico`.
- `costo_total`.

Estos valores los calcula el backend.

---

# Dialog Ver Indicadores

## Actores

- LIDER.
- COLABORADOR asignado.

## Contenido

Debe mostrar:

- BAC.
- PV.
- EV.
- AC.
- CV.
- SV.
- CPI.
- SPI.
- EAC.
- VAC.
- Estado financiero.
- Mensaje financiero.
- Estado cronograma.
- Mensaje cronograma.
- Estado general.

## Regla

Todos los valores deben venir del backend.

---

# Estados visuales

## Estado operativo

Representa estados almacenados.

Ejemplos:

- ACTIVO.
- PAUSADO.
- FINALIZADO.
- CANCELADO.
- PENDIENTE.
- ACTIVA.
- PAUSADA.
- FINALIZADA.
- CANCELADA.

## Estado EVM

Representa estados calculados.

Ejemplos:

- SIN_DATOS.
- SALUDABLE.
- RIESGO_COSTO.
- RIESGO_CRONOGRAMA.
- CRITICO.

---

# Semáforos visuales

El frontend debe representar estados de forma visual.

Sugerencia:

| Estado | Visual |
|---|---|
| SALUDABLE | Verde |
| RIESGO_COSTO | Amarillo/Naranja |
| RIESGO_CRONOGRAMA | Amarillo/Naranja |
| CRITICO | Rojo |
| SIN_DATOS | Gris |

La decisión visual final debe mantenerse consistente en toda la aplicación.

---

# Manejo de listas vacías

El frontend debe mostrar mensajes amigables.

## Sin proyectos

```text
No hay proyectos registrados.
```

## Sin actividades

```text
No hay actividades registradas para este proyecto.
```

## Sin asignaciones

```text
No hay usuarios asignados a esta actividad.
```

## Sin registros de horas

```text
No hay registros de horas para esta actividad.
```

## Colaborador sin actividades

```text
No tienes actividades asignadas actualmente.
```

---

# Manejo de loading

Las vistas que consultan datos deben mostrar estado de carga.

Ejemplos:

- Skeleton.
- Spinner.
- Mensaje `Cargando información...`.

No mostrar tablas vacías antes de terminar la consulta.

---

# Manejo de errores

El frontend debe mostrar errores con base en la estructura estándar del backend.

## Estructura esperada

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

## Visualización

- Usar Toast para errores generales.
- Usar mensajes bajo campos para errores de formulario.
- Usar mensaje contextual para estados vacíos o restricciones.
- No mostrar stacktrace.

---

# Manejo de permisos visuales

El frontend debe ocultar acciones no permitidas según rol.

## LIDER

Puede ver:

- Crear proyecto.
- Editar proyecto.
- Cancelar proyecto.
- Crear actividad.
- Editar actividad.
- Cancelar actividad.
- Asignar usuarios.
- Registrar horas.
- Ver indicadores.

## COLABORADOR

Puede ver:

- Registrar horas.
- Ver indicadores.

No debe ver:

- Crear proyecto.
- Editar proyecto.
- Cancelar proyecto.
- Crear actividad.
- Editar actividad.
- Cancelar actividad.
- Asignar usuarios.

---

# Integración HTTP

El frontend debe consumir servicios mediante Angular services.

Servicios sugeridos:

```text
AuthService
ProyectoService
ActividadService
AsignacionService
RegistroHorasService
IndicadorEvmService
UsuarioService
```

---

# Modelos TypeScript esperados

Crear interfaces para DTOs.

Ejemplos:

```text
ProyectoResponse
ProyectoRequest
ActividadResponse
ActividadRequest
RegistroHorasRequest
RegistroHorasResponse
IndicadorActividadResponse
IndicadorProyectoResponse
ErrorResponse
UsuarioSesion
```

---

# Regla sobre nombres

Los nombres TypeScript pueden usar PascalCase o camelCase según convención Angular.

Los campos deben mapear correctamente los nombres enviados por backend.

No inventar campos no documentados.

---

# Tiempo real

El frontend debe estar preparado para recibir eventos en tiempo real según:

```text
/docs/07-websocket.md
```

Eventos esperados:

- PROYECTO_CREADO.
- PROYECTO_ACTUALIZADO.
- PROYECTO_CANCELADO.
- ACTIVIDAD_CREADA.
- ACTIVIDAD_ACTUALIZADA.
- ACTIVIDAD_CANCELADA.
- USUARIO_ASIGNADO_ACTIVIDAD.
- USUARIO_RETIRADO_ACTIVIDAD.
- HORAS_REGISTRADAS.
- INDICADORES_RECALCULADOS.
- ALERTA_PRESUPUESTAL.

---

# Comportamiento ante eventos en tiempo real

Cuando llegue un evento:

- Actualizar la vista actual si el evento afecta el contexto visible.
- Refrescar indicadores si cambian horas o actividades.
- Refrescar gráficos si cambian valores EVM.
- Mostrar alerta visual si el evento representa riesgo.
- No recalcular EVM en frontend.

---

# Accesibilidad mínima

La interfaz debe:

- Tener textos claros.
- Usar labels en formularios.
- Permitir identificar botones.
- Evitar depender únicamente del color para comunicar riesgo.
- Mostrar mensajes textuales junto con semáforos visuales.

---

# Responsive

La interfaz debe ser usable en escritorio y pantallas medianas.

Prioridad inicial:

```text
Desktop first
```

Debe evitarse romper tablas, dialogs y layout en resoluciones comunes.

---

# Criterios de aceptación frontend

El frontend se considera correctamente implementado cuando:

- Tiene login funcional.
- Protege rutas con JWT.
- Usa layout con sidebar y topbar.
- Muestra dashboard inicial.
- Muestra Projects.
- Permite CRUD visual de proyectos según rol.
- Permite navegación a actividades del proyecto.
- Permite CRUD visual de actividades según rol.
- Permite asignar usuarios a actividades.
- Permite registrar horas.
- Permite ver indicadores.
- Muestra gráficos PV vs EV vs AC.
- No calcula EVM.
- Maneja errores estándar.
- Maneja listas vacías.
- Oculta acciones no permitidas.
- Actualiza vistas ante eventos en tiempo real cuando aplique.

# Gráficos EVM

El frontend utilizará gráficos para facilitar la lectura rápida del estado del proyecto y de sus actividades, siguiendo el principio `Don't Make Me Think`.

La librería visual principal será PrimeNG mediante el componente `p-chart`, basado en Chart.js.

## Gráficos para líder

En la vista `/projects/:id/activities`, el líder debe ver gráficos generales del proyecto antes de la tabla de actividades.

Gráficos sugeridos:

- Comparativo PV vs EV vs AC por actividad.
- Avance planificado vs avance real consolidado.
- Consumo presupuestal del proyecto.
- Estado general EVM del proyecto.

## Gráficos por actividad

Desde la acción `Ver indicadores`, cada actividad podrá mostrar gráficos específicos.

Gráficos sugeridos:

- PV vs EV vs AC de la actividad.
- Avance planificado vs avance real.
- Presupuesto BAC vs costo real AC.
- Indicadores CPI y SPI.

## Regla obligatoria

El frontend no debe calcular los indicadores.

Los gráficos deben usar exclusivamente datos calculados y enviados por backend.

## Uso de colores

Los colores deben ayudar a interpretar el estado:

- Saludable: verde.
- Riesgo: amarillo o naranja.
- Crítico: rojo.
- Sin datos: gris.

El color debe acompañarse siempre con texto descriptivo, no depender únicamente del color.