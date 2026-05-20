# Flujo Funcional del Sistema

## Objetivo del documento

Este documento define el flujo funcional de la aplicación desde la perspectiva del usuario.

Debe servir como guía para implementar:

- Navegación.
- Pantallas.
- Acciones.
- Roles.
- Interacción entre módulos.
- Comportamiento esperado del sistema.
- Experiencia de usuario bajo el principio “Don't Make Me Think”.

Este documento no define tablas ni endpoints.  
Para base de datos consultar `/docs/02-modelo-base-datos.md`.  
Para backend consultar `/docs/03-backend-especificacion.md`.  
Para frontend consultar `/docs/04-frontend-especificacion.md`.

---

# Principio funcional principal

El sistema debe seguir el principio:

```text
Don't Make Me Think
```

Esto significa que el usuario debe entender rápidamente:

- Qué proyectos existen.
- Qué proyectos están saludables.
- Qué proyectos están en riesgo.
- Qué actividades tienen problemas.
- Cuánto presupuesto se ha consumido.
- Qué avance real existe frente al avance planificado.
- Qué acción debe tomar.

La aplicación no debe obligar al usuario a interpretar fórmulas EVM manualmente.

---

# Usuarios del sistema

## Líder

El líder es el usuario que gestiona el ciclo operativo del proyecto.

Puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Ver dashboard general.
- Ver detalle de proyecto.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios a actividades.
- Registrar horas propias si está asignado.
- Registrar horas en nombre de colaboradores.
- Ver indicadores por actividad.
- Ver indicadores consolidados del proyecto.

---

## Colaborador

El colaborador es el usuario que trabaja sobre actividades asignadas.

Puede:

- Ver sus actividades asignadas.
- Registrar horas propias.
- Ver indicadores de sus actividades.
- Ver el proyecto relacionado desde la actividad asignada.

No puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios.

---

# Flujo general de navegación

El flujo general del sistema será:

```text
Login
  → Dashboard inicial
    → Projects
      → Dashboard de proyectos
        → Actividades del proyecto
          → Indicadores
          → Asignaciones
          → Registro de horas
```

---

# Login

## Objetivo

Permitir que el usuario ingrese al sistema con credenciales válidas.

## Campos

- Correo.
- Contraseña.

## Comportamiento esperado

- Si las credenciales son válidas, el sistema recibe JWT y navega a `/dashboard`.
- Si las credenciales son inválidas, muestra mensaje claro.
- Si el usuario está inactivo o bloqueado, no debe permitir acceso.

## Ruta

```text
/login
```

---

# Layout autenticado

Después del login, todas las pantallas protegidas deben usar el mismo layout.

## Elementos principales

- Menú lateral.
- Barra superior.
- Contenido principal.

---

# Barra superior

La barra superior debe incluir:

| Elemento | Ubicación | Comportamiento |
|---|---|---|
| Botón hamburguesa | Izquierda | Contrae o expande el menú lateral |
| Título del módulo actual | Centro o izquierda | Cambia según la vista actual |
| Ícono de usuario | Derecha | Abre menú de usuario |
| Nombre del usuario | Menú de usuario | Muestra usuario autenticado |
| Botón salir | Menú de usuario | Cierra sesión |

---

# Menú lateral

El menú lateral debe ser:

- Colapsable.
- Persistente en vistas autenticadas.
- Claro y simple.

## Opciones iniciales

| Opción | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | Vista inicial del sistema |
| Projects | `/projects` | Gestión y seguimiento de proyectos |

---

# Dashboard inicial

## Ruta

```text
/dashboard
```

## Objetivo

Mostrar una vista inicial simple después del login.

## Contenido esperado

- Mensaje de bienvenida.
- Nombre del usuario autenticado.
- Rol del usuario.
- Acceso rápido a Projects.
- Resumen general futuro si aplica.

## Comportamiento por rol

### Líder

Puede ver acceso a proyectos y resumen general.

### Colaborador

Puede ver acceso a sus actividades asignadas o a una vista filtrada según permisos.

---

# Módulo Projects

## Ruta

```text
/projects
```

## Objetivo

Mostrar el dashboard principal de proyectos.

---

# Vista Projects para líder

El líder debe ver una tabla general de proyectos.

## Información principal

| Columna | Descripción |
|---|---|
| Proyecto | Nombre del proyecto |
| Estado operativo | Estado administrativo del proyecto |
| Presupuesto consumido | Porcentaje calculado desde registros de horas |
| Avance real | Avance consolidado del proyecto |
| Riesgo | Estado general calculado por EVM |
| Acciones | Menú de acciones |

## Acciones disponibles

En la columna de acciones se debe mostrar menú de tres puntos:

```text
⋮
```

Opciones:

- Ver actividades.
- Editar proyecto.
- Cancelar proyecto.

## Acción principal

Además de las acciones por fila, debe existir una acción para:

```text
Crear proyecto
```

---

# Vista Projects para colaborador

El colaborador no debe ver gestión global de proyectos.

El colaborador debe ver únicamente información relacionada con sus actividades asignadas.

Opciones válidas:

- Redirigirlo a una vista de actividades asignadas.
- Mostrar proyectos derivados de sus actividades asignadas, sin acciones administrativas.

La implementación exacta debe respetar permisos definidos en `/docs/05-reglas-negocio.md`.

---

# Crear proyecto

## Actor

Solo líder.

## Componente

Dialog emergente.

## Campos

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre | Texto | Sí |
| Descripción | Texto largo | No |
| Fecha inicio | Fecha | Sí |
| Fecha fin | Fecha | Sí |
| Presupuesto total | Decimal | Sí |

## Comportamiento esperado

- El formulario se abre en un dialog.
- El usuario completa datos.
- El sistema valida campos.
- Si guarda correctamente, la tabla se actualiza.
- Si ocurre error, se muestra mensaje claro.
- El proyecto inicia en estado `ACTIVO`.

---

# Editar proyecto

## Actor

Solo líder.

## Componente

Dialog emergente.

## Comportamiento esperado

- Carga datos actuales del proyecto.
- Permite editar campos permitidos.
- Valida reglas.
- Actualiza tabla al guardar.
- No permite edición operativa si el proyecto está cancelado o finalizado.

---

# Cancelar proyecto

## Actor

Solo líder.

## Comportamiento esperado

- Solicitar confirmación.
- No eliminar físicamente.
- Cambiar estado a `CANCELADO`.
- Refrescar tabla.
- Impedir nuevas actividades y registros de horas asociados.

---

# Ver actividades de proyecto

## Actor

Líder.

## Acción

Desde la tabla de proyectos:

```text
Acciones → Ver actividades
```

## Ruta destino

```text
/projects/:id/activities
```

---

# Vista de actividades del proyecto

## Ruta

```text
/projects/:id/activities
```

## Objetivo

Mostrar el detalle operativo y analítico de un proyecto.

---

# Estructura de la vista de actividades

La vista debe dividirse en:

1. Encabezado/resumen del proyecto.
2. Indicadores consolidados.
3. Gráficos.
4. Tabla de actividades.
5. Acciones de actividades.

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

# Indicadores consolidados

Deben mostrarse como tarjetas o bloque visual:

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
- Estado cronograma.
- Estado general.

La explicación detallada de cálculos está en:

```text
/docs/06-evm-calculos.md
```

---

# Gráficos del proyecto

## Gráfico principal

Debe comparar:

```text
PV vs EV vs AC
```

por actividad.

## Objetivo visual

Permitir identificar rápidamente:

- Actividades atrasadas.
- Actividades sobre presupuesto.
- Actividades saludables.
- Diferencias entre valor planificado, valor ganado y costo real.

---

# Tabla de actividades para líder

## Columnas principales

| Columna | Descripción |
|---|---|
| Actividad | Nombre de la actividad |
| Estado operativo | Estado administrativo |
| Responsable(s) | Usuarios asignados |
| Avance planificado | Porcentaje planificado |
| Avance real | Porcentaje real |
| Presupuesto consumido | Calculado desde AC/BAC |
| Estado EVM | Estado general calculado |
| Acciones | Menú de acciones |

## Acciones disponibles

Menú de tres puntos:

```text
⋮
```

Opciones:

- Editar actividad.
- Cancelar actividad.
- Asignar usuarios.
- Registrar horas.
- Ver indicadores.

## Acción principal

Debe existir botón:

```text
Crear actividad
```

---

# Crear actividad

## Actor

Solo líder.

## Componente

Dialog emergente.

## Campos

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre | Texto | Sí |
| Descripción | Texto largo | No |
| BAC | Decimal | Sí |
| Porcentaje avance planificado | Decimal | Sí |
| Porcentaje avance real | Decimal | Sí |
| Fecha inicio | Fecha | Sí |
| Fecha fin | Fecha | Sí |

## Comportamiento esperado

- Validar campos obligatorios.
- Validar porcentajes entre 0 y 100.
- Validar fechas.
- Validar que la suma de BAC no supere presupuesto total del proyecto.
- Si guarda correctamente, actualizar tabla, indicadores y gráficos.
- Si falla, mostrar mensaje claro.

---

# Editar actividad

## Actor

Solo líder.

## Componente

Dialog emergente.

## Comportamiento esperado

- Cargar datos actuales.
- Permitir edición de campos permitidos.
- Validar reglas.
- Actualizar tabla, indicadores y gráficos al guardar.
- No permitir edición operativa si está cancelada o finalizada.

---

# Cancelar actividad

## Actor

Solo líder.

## Comportamiento esperado

- Solicitar confirmación.
- No eliminar físicamente.
- Cambiar estado a `CANCELADA`.
- No eliminar registros históricos.
- Refrescar tabla, indicadores y gráficos.

---

# Asignar usuarios

## Actor

Solo líder.

## Componente

Dialog emergente.

## Objetivo

Asignar uno o varios usuarios a una actividad.

## Campos esperados

| Campo | Tipo | Obligatorio |
|---|---|---|
| Usuarios | Selector múltiple | Sí |

## Comportamiento esperado

- Mostrar usuarios activos.
- Permitir seleccionar uno o varios usuarios.
- No permitir asignación activa duplicada.
- No permitir usuarios inactivos.
- Al guardar, actualizar responsables de la actividad.

---

# Registrar horas

## Actores

- Líder.
- Colaborador.

## Componente

Dialog emergente.

## Campos

| Campo | Tipo | Obligatorio |
|---|---|---|
| Usuario | Selector | Sí para líder cuando registra por otro |
| Fecha trabajo | Fecha | Sí |
| Horas trabajadas | Decimal | Sí |
| Descripción | Texto largo | No |

---

# Registro de horas por líder

El líder puede registrar horas:

- Para sí mismo, si está asignado.
- Para colaboradores asignados a la actividad.

Cuando registra por otro usuario:

```text
id_usuario = colaborador seleccionado
id_usuario_registra = líder autenticado
```

---

# Registro de horas por colaborador

El colaborador solo puede registrar horas propias.

```text
id_usuario = colaborador autenticado
id_usuario_registra = colaborador autenticado
```

---

# Comportamiento del registro de horas

Al guardar un registro de horas:

- El backend toma el valor hora vigente del cargo del usuario trabajado.
- El backend guarda valor hora histórico.
- El backend calcula costo total.
- El backend recalcula indicadores.
- El frontend actualiza tabla, tarjetas y gráficos.

---

# Ver indicadores de actividad

## Actor

- Líder.
- Colaborador asignado.

## Componente

Puede implementarse como:

- Dialog emergente.
- Panel lateral.
- Vista detalle.

Para la versión inicial se recomienda:

```text
Dialog emergente
```

## Contenido esperado

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
- Estado cronograma.
- Estado general.
- Mensajes interpretativos.

---

# Flujo del colaborador

## Objetivo

El colaborador debe ver únicamente lo que tiene asignado.

## Vista esperada

Al ingresar, el colaborador debe poder acceder a sus actividades asignadas.

Puede visualizar:

| Columna | Descripción |
|---|---|
| Proyecto | Proyecto relacionado |
| Actividad | Actividad asignada |
| Estado operativo | Estado de la actividad |
| Avance real | Avance actual |
| Estado EVM | Estado calculado |
| Acciones | Menú de acciones |

## Acciones disponibles

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

# Manejo de listas vacías

Cuando no existan datos, la interfaz no debe mostrar error.

Ejemplos:

## Sin proyectos

```text
No hay proyectos registrados.
```

## Sin actividades

```text
No hay actividades registradas para este proyecto.
```

## Colaborador sin actividades

```text
No tienes actividades asignadas actualmente.
```

---

# Manejo visual de errores

Los errores deben mostrarse de forma clara.

El frontend debe usar la estructura de error definida por backend:

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

## Comportamiento esperado

- Mostrar mensaje principal al usuario.
- Mostrar detalle solo si aporta contexto.
- No mostrar stacktrace.
- No mostrar información técnica innecesaria.

---

# Actualización en tiempo real

Cuando ocurra una acción relevante, el sistema debe actualizar:

- Tablas.
- Indicadores.
- Gráficos.
- Alertas.
- Semáforos visuales.

Eventos relevantes:

- Proyecto creado.
- Proyecto actualizado.
- Actividad creada.
- Actividad actualizada.
- Usuario asignado.
- Horas registradas.
- Indicadores recalculados.
- Alerta presupuestal.

La implementación técnica se detalla en:

```text
/docs/07-websocket.md
```

---

# Flujo principal resumido para líder

```text
Login
  → Dashboard
    → Projects
      → Crear proyecto
      → Ver actividades
        → Crear actividad
        → Asignar usuarios
        → Registrar horas
        → Ver indicadores
        → Analizar dashboard del proyecto
```

---

# Flujo principal resumido para colaborador

```text
Login
  → Dashboard
    → Ver actividades asignadas
      → Registrar horas
      → Ver indicadores
```

---

# Criterio funcional de aceptación

El flujo funcional se considera correcto cuando:

- El líder puede gestionar proyectos y actividades.
- El líder puede asignar usuarios.
- El líder puede registrar horas propias o por colaboradores.
- El colaborador solo ve actividades asignadas.
- El colaborador solo registra horas propias.
- Los indicadores se visualizan sin que el usuario calcule nada.
- El sistema muestra claramente si algo va bien o mal.
- Las listas vacías se entienden como estado vacío, no como error.
- Los errores se muestran de forma clara.
- Las acciones no permitidas no aparecen visualmente y también son rechazadas por backend.