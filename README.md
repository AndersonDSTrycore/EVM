# EVM
Proyecto interno


# Prompts ejecutados:
---
Actúa siguiendo estrictamente las instrucciones del repositorio.

Objetivo de esta tarea:
Configurar el backend `EVM-backend` para conectarse a PostgreSQL local y crear el modelo inicial mediante Liquibase.

Antes de generar código, revisa obligatoriamente:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/database.instructions.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/05-reglas-negocio.md`
- `/docs/09-entorno-local-base-datos.md`

Alcance permitido:

1. Configurar el backend Spring Boot para conectarse a:

```text
jdbc:postgresql://localhost:55433/evm_db
username: admin
password: admin
```

2. Configurar Liquibase habilitado.

3. Crear los changelogs Liquibase necesarios para el modelo definido en `/docs/02-modelo-base-datos.md`.

4. Crear únicamente las tablas documentadas:

```text
tbl_roles_sistema
tbl_cargos
tbl_estados_usuarios
tbl_usuarios
tbl_estados_proyectos
tbl_proyectos
tbl_estados_actividades
tbl_actividades
tbl_estados_asignaciones
tbl_asignaciones_actividades
tbl_registros_horas
```

5. Crear relaciones, llaves primarias, llaves foráneas, restricciones y datos semilla definidos en la documentación.

6. Crear los datos iniciales de:

```text
tbl_roles_sistema
tbl_cargos
tbl_estados_usuarios
tbl_estados_proyectos
tbl_estados_actividades
tbl_estados_asignaciones
tbl_usuarios
```

Restricciones obligatorias:

- No crear tablas no documentadas.
- No crear campos no documentados.
- No persistir indicadores EVM.
- No crear endpoints todavía.
- No crear servicios todavía.
- No crear frontend.
- No crear lógica EVM todavía.
- No insertar contraseñas de usuarios en texto plano.
- No modificar `docker-compose.yml` salvo que sea estrictamente necesario.
- No cambiar el puerto `55433`.

Resultado esperado:

- Backend compila.
- Backend arranca.
- Liquibase ejecuta correctamente.
- En DBeaver se observan las tablas creadas.
- Existen `databasechangelog` y `databasechangeloglock`.
- Existen los datos semilla.
---
---

Actúa siguiendo estrictamente las instrucciones del repositorio.

Ya fue validado que PostgreSQL local está funcionando, Liquibase ejecutó correctamente y las tablas/datos semilla existen en `evm_db`.

Objetivo de esta tarea:
Implementar la base del backend sobre el modelo ya creado por Liquibase.

Antes de generar código, revisa obligatoriamente:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/database.instructions.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/05-reglas-negocio.md`

Alcance permitido:

1. Crear o validar las entidades JPA correspondientes únicamente a estas tablas:

```text
tbl_roles_sistema
tbl_cargos
tbl_estados_usuarios
tbl_usuarios
tbl_estados_proyectos
tbl_proyectos
tbl_estados_actividades
tbl_actividades
tbl_estados_asignaciones
tbl_asignaciones_actividades
tbl_registros_horas
```

2. Crear repositories para cada entidad.

3. Crear DTOs base de request y response cuando aplique.

4. Crear mappers entre entidad y DTO.

5. Validar relaciones JPA según el modelo de base de datos.

6. Usar `BigDecimal` para valores monetarios y horas.

7. Usar `LocalDate` para fechas de negocio.

8. Usar `LocalDateTime` para fechas de creación/modificación.

Restricciones obligatorias:

- No modificar los changelogs Liquibase ya ejecutados.
- No crear nuevas tablas.
- No crear nuevos campos.
- No crear endpoints todavía.
- No crear servicios de negocio todavía.
- No implementar seguridad todavía.
- No implementar lógica EVM todavía.
- No persistir indicadores EVM.
- No exponer entidades directamente como respuesta futura.
- No inventar relaciones no documentadas.

Resultado esperado:

- El backend compila correctamente.
- Las entidades coinciden con las tablas existentes.
- Los repositories existen.
- Los DTOs y mappers base quedan preparados.
- No se altera la base de datos existente.

---
---

Actúa siguiendo estrictamente las instrucciones del repositorio.

Estado actual:
Ya existe el backend base con paquetes iniciales, entidades, DTOs, mappers y repositories.
Ya existe PostgreSQL local funcionando en `localhost:55433`.
Ya existen tablas y datos semilla creados por Liquibase.

Objetivo de esta tarea:
Implementar únicamente la autenticación base con JWT y el endpoint de login.

Antes de generar código, revisa obligatoriamente:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/database.instructions.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/05-reglas-negocio.md`
- `/docs/09-entorno-local-base-datos.md`

Alcance permitido:

1. Revisar y ajustar `SeguridadConfig.java` si ya existe.
2. Crear la configuración necesaria para Spring Security con JWT.
3. Crear endpoint público:

```text
POST /api/auth/login
```

4. Validar usuario por correo y contraseña usando `tbl_usuarios`.
5. Validar que el usuario tenga estado `ACTIVO`.
6. Generar JWT si las credenciales son correctas.
7. Retornar información básica del usuario autenticado.
8. Proteger todos los endpoints excepto `/api/auth/login`.
9. Crear DTOs necesarios para autenticación.
10. Crear servicios necesarios para autenticación.
11. Crear clases de seguridad necesarias para:
    - generación de token,
    - validación de token,
    - filtro JWT,
    - carga de usuario autenticado,
    - password encoder BCrypt.

Estructura esperada sugerida:

```text
config/
  SeguridadConfig.java

security/
  JwtService.java
  JwtAuthenticationFilter.java
  UsuarioAutenticado.java
  UsuarioDetailsService.java

resource/
  AuthResource.java

service/
  AuthService.java

service_impl/
  AuthServiceImpl.java

dto/auth/
  LoginRequestDTO.java
  LoginResponseDTO.java
  UsuarioSesionDTO.java
```

Contrato esperado del login:

Request:

```json
{
  "correo": "lider.demo@evm.local",
  "contrasena": "Admin123*"
}
```

Response exitosa:

```json
{
  "token": "jwt-generado",
  "tipo_token": "Bearer",
  "usuario": {
    "id": 1,
    "nombre": "Líder Demo",
    "correo": "lider.demo@evm.local",
    "rol": "LIDER"
  }
}
```

Reglas obligatorias:

- No crear nuevas tablas.
- No modificar changelogs Liquibase ya ejecutados.
- No crear endpoints de proyectos todavía.
- No crear endpoints de actividades todavía.
- No crear frontend.
- No implementar lógica EVM todavía.
- No exponer entidades JPA directamente.
- No permitir login de usuarios inactivos, bloqueados o inexistentes.
- No guardar ni comparar contraseñas en texto plano.
- Usar BCrypt para validar contraseñas.
- Todo endpoint diferente a `/api/auth/login` debe requerir JWT.
- Si falta una dependencia JWT en `pom.xml`, agregar solo la mínima necesaria y justificarla en comentario breve.

Manejo de errores esperado:

- Credenciales inválidas: `401 Unauthorized`.
- Usuario inactivo o bloqueado: `403 Forbidden`.
- Token ausente o inválido: `401 Unauthorized`.

Resultado esperado:

- El backend compila.
- El backend arranca.
- `POST /api/auth/login` funciona con los usuarios semilla.
- Los endpoints protegidos rechazan peticiones sin JWT.
- No se altera la estructura de base de datos.

---
---

Tenemos un problema en la autenticación.

Actualmente `POST /api/auth/login` responde:

```json
{"error":"Token ausente o inválido","status":401}
```

Esto es incorrecto porque `/api/auth/login` debe ser público.

Objetivo:
Corregir la configuración de seguridad para que el login no sea interceptado por el filtro JWT.

Revisar:

- `SeguridadConfig.java`
- `JwtAuthenticationFilter.java`
- `AuthResource.java`

Reglas:

1. `POST /api/auth/login` debe permitirse sin JWT.
2. El filtro JWT no debe rechazar automáticamente una petición solo porque no tenga header `Authorization`.
3. Si no hay header `Authorization`, el filtro debe continuar la cadena con `filterChain.doFilter(request, response)`.
4. Solo debe validar JWT cuando exista header:

```text
Authorization: Bearer <token>
```

5. Si el token existe pero es inválido, ahí sí debe responder 401.
6. Permitir también Swagger/OpenAPI sin JWT:

```text
/swagger-ui/**
/swagger-ui.html
/v3/api-docs/**
/docs/**
```

7. No modificar lógica de base de datos.
8. No modificar Liquibase.
9. No modificar entidades.
10. No crear endpoints adicionales.

Resultado esperado:

- `POST /api/auth/login` funciona sin token.
- Endpoints protegidos siguen respondiendo 401 si no tienen token.
- Swagger/OpenAPI queda accesible sin token si está configurado.

---
---
Actúa siguiendo estrictamente las instrucciones del repositorio.

Estado actual:
- El backend ya conecta con PostgreSQL.
- Liquibase ya creó tablas y datos semilla.
- El login JWT ya funciona.
- El frontend base ya funciona.
- El usuario puede iniciar sesión y navegar al layout autenticado.
- Existe una vista `/projects` como placeholder.

Objetivo de esta tarea:
Implementar el módulo Projects de forma controlada, conectando backend y frontend.

Esta fase debe cubrir únicamente:
- CRUD lógico de proyectos.
- Tabla de proyectos en frontend.
- Dialog para crear proyecto.
- Dialog para editar proyecto.
- Confirmación para cancelar proyecto.
- Acción "Ver actividades" que navegue a una vista placeholder.

No implementar todavía:
- Actividades reales.
- Asignaciones.
- Registro de horas.
- Indicadores EVM.
- Gráficos.
- WebSocket.

---

# Documentos obligatorios a revisar antes de implementar

Revisa primero:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/database.instructions.md`
- `/docs/00-contexto-general.md`
- `/docs/01-flujo-funcional.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/04-frontend-especificacion.md`
- `/docs/05-reglas-negocio.md`

---

# Alcance backend permitido

Implementar únicamente endpoints REST para proyectos.

Endpoints esperados:

```text
GET    /api/proyectos
GET    /api/proyectos/{id}
POST   /api/proyectos
PUT    /api/proyectos/{id}
PATCH  /api/proyectos/{id}/cancelar
```

No usar eliminación física.

La cancelación debe ser lógica, cambiando el estado del proyecto a `CANCELADO`.

---

# Reglas backend para proyectos

1. Solo usuarios con rol `LIDER` pueden:
   - crear proyectos,
   - editar proyectos,
   - cancelar proyectos.

2. Los endpoints deben requerir JWT.

3. El backend no debe exponer entidades JPA directamente.

4. Usar DTOs de request y response.

5. Usar servicios para lógica de negocio.

6. Los controladores REST no deben contener lógica de negocio.

7. Mantener la estructura actual del backend.  
   Si ya existe `service/impl`, usar esa estructura y no crear `service_impl`.

8. No crear tablas nuevas.

9. No modificar changelogs Liquibase ya ejecutados.

10. No persistir indicadores EVM.

---

# Datos mínimos del proyecto

Para crear y editar proyecto usar los campos documentados:

```text
nombre
descripcion
fechaInicio
fechaFin
presupuestoTotal
```

El estado inicial de un proyecto creado debe ser:

```text
ACTIVO
```

Ese estado debe obtenerse desde `tbl_estados_proyectos`.

---

# Validaciones backend

Validar:

- `nombre` obligatorio.
- `fechaInicio` obligatoria.
- `fechaFin` obligatoria.
- `fechaFin` no debe ser menor que `fechaInicio`.
- `presupuestoTotal` obligatorio.
- `presupuestoTotal` mayor o igual a cero.
- No permitir editar ni cancelar proyectos inexistentes.
- No permitir edición operativa si el proyecto está `CANCELADO`.

---

# Manejo de listas vacías

Si no existen proyectos, el endpoint:

```text
GET /api/proyectos
```

debe retornar:

```json
[]
```

No debe retornar 404.

---

# Logs backend

Agregar logs claros en acciones relevantes:

- proyecto creado,
- proyecto actualizado,
- proyecto cancelado,
- intento de operación no permitida,
- proyecto no encontrado,
- error funcional controlado.

No registrar información sensible.

---

# Alcance frontend permitido

Implementar la vista `/projects` usando el backend real.

La vista debe incluir:

- título `Projects`,
- botón `Crear proyecto` visible solo para rol `LIDER`,
- tabla de proyectos,
- columna de acciones,
- dialog para crear proyecto,
- dialog para editar proyecto,
- confirmación para cancelar proyecto,
- acción `Ver actividades`.

---

# Tabla de proyectos

Columnas mínimas:

```text
Nombre
Estado
Fecha inicio
Fecha fin
Presupuesto total
Acciones
```

No mostrar todavía indicadores EVM porque aún no están implementados.

No mostrar todavía gráficos.

---

# Acciones por proyecto

En la columna acciones usar menú de tres puntos o botones equivalentes.

Acciones:

```text
Ver actividades
Editar proyecto
Cancelar proyecto
```

Reglas:

- `Editar proyecto` solo para `LIDER`.
- `Cancelar proyecto` solo para `LIDER`.
- `Ver actividades` navega a `/projects/:id/activities`.

---

# Vista placeholder de actividades

Crear ruta frontend:

```text
/projects/:id/activities
```

Por ahora debe mostrar únicamente:

```text
Actividades del proyecto pendientes de implementación.
```

También debe mostrar, si es posible:

```text
ID del proyecto seleccionado.
```

No implementar todavía tabla de actividades.

---

# Dialog crear proyecto

Usar PrimeNG Dialog.

Campos:

```text
nombre
descripcion
fechaInicio
fechaFin
presupuestoTotal
```

Validaciones frontend:

- nombre obligatorio,
- fechaInicio obligatoria,
- fechaFin obligatoria,
- fechaFin no menor que fechaInicio,
- presupuestoTotal obligatorio,
- presupuestoTotal mayor o igual a cero.

Al guardar correctamente:

- cerrar dialog,
- refrescar tabla,
- mostrar mensaje de éxito.

---

# Dialog editar proyecto

Usar PrimeNG Dialog.

Debe:

- cargar datos actuales,
- permitir editar campos permitidos,
- validar formulario,
- guardar cambios,
- refrescar tabla,
- mostrar mensaje de éxito.

No permitir edición visual si el proyecto está `CANCELADO`.

---

# Cancelar proyecto

Usar confirmación antes de cancelar.

Al confirmar:

- consumir `PATCH /api/proyectos/{id}/cancelar`,
- refrescar tabla,
- mostrar mensaje de éxito.

No eliminar la fila físicamente.  
Debe verse con estado `CANCELADO`.

---

# Servicios frontend

Crear o completar servicio:

```text
ProyectoService
```

Ubicación esperada:

```text
src/app/core/services
```

Debe consumir:

```text
GET    /api/proyectos
GET    /api/proyectos/{id}
POST   /api/proyectos
PUT    /api/proyectos/{id}
PATCH  /api/proyectos/{id}/cancelar
```

---

# Modelos frontend

Crear modelos en:

```text
src/app/core/models
```

Modelos mínimos:

```text
ProyectoRequest
ProyectoResponse
EstadoProyecto
```

No inventar campos no retornados por backend.

---

# Restricciones frontend

No implementar todavía:

- actividades reales,
- asignación de usuarios,
- registro de horas,
- indicadores,
- gráficos,
- WebSocket,
- cálculo EVM.

No crear estructura `features/`.

Mantener la estructura actual:

```text
src/app/core
src/app/views/components
src/app/views/layout
src/app/views/pages
```

---

# Resultado esperado

Al finalizar:

1. El backend compila.
2. El backend arranca.
3. Los endpoints de proyectos funcionan con JWT.
4. El frontend compila.
5. `/projects` muestra la tabla de proyectos.
6. Si no hay proyectos, muestra estado vacío claro.
7. El líder puede crear proyectos.
8. El líder puede editar proyectos.
9. El líder puede cancelar proyectos.
10. La acción `Ver actividades` navega a `/projects/:id/activities`.
11. La vista de actividades existe como placeholder.
12. No se implementa nada fuera del alcance.

---
---

Ayuda me a separar la logica de este modal llama el nuevo componente create-edit-activity crea el spec y realicemos pruebas unitarias, validando los maximos y minimos de los campos.

---
---

Actúa siguiendo estrictamente las instrucciones del repositorio.

Estado actual:
- El backend ya tiene JWT funcional.
- El frontend ya tiene login, layout y navegación.
- El módulo Projects ya funciona.
- El módulo Activities debe estar funcional o debe respetarse la estructura ya creada.
- No se implementará RabbitMQ en esta fase.

Objetivo de esta tarea:
Implementar WebSocket para que los cambios en Projects y Activities se reflejen en tiempo real en el frontend.

Alcance permitido:
- WebSocket backend con Spring.
- Cliente WebSocket frontend en Angular.
- Eventos en tiempo real para proyectos.
- Eventos en tiempo real para actividades.
- Refresco automático de tablas al recibir eventos.
- Logs de publicación de eventos.

No implementar:
- RabbitMQ.
- Indicadores EVM.
- Registro de horas.
- Asignaciones.
- Gráficos.
- Cálculo EVM.
- Nuevas tablas.
- Persistencia de eventos.

Documentos obligatorios a revisar:
- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `/docs/01-flujo-funcional.md`
- `/docs/03-backend-especificacion.md`
- `/docs/04-frontend-especificacion.md`
- `/docs/05-reglas-negocio.md`
- `/docs/07-websocket.md`

---

# Backend WebSocket

Implementar WebSocket usando Spring WebSocket con STOMP.

Endpoint base:

```text
/ws
```

Canales requeridos:

```text
/topic/proyectos
/topic/proyectos/{idProyecto}/actividades
```

Eventos mínimos:

```text
PROYECTO_CREADO
PROYECTO_ACTUALIZADO
PROYECTO_CANCELADO
ACTIVIDAD_CREADA
ACTIVIDAD_ACTUALIZADA
ACTIVIDAD_CANCELADA
```

Crear DTO de evento WebSocket:

```text
EventoWebSocketDTO
```

Estructura esperada:

```json
{
  "tipoEvento": "PROYECTO_ACTUALIZADO",
  "idProyecto": 1,
  "idActividad": null,
  "mensaje": "Proyecto actualizado correctamente.",
  "fechaHora": "2026-05-19T10:30:00",
  "requiereRefresco": true
}
```

Crear servicio backend:

```text
WebSocketEventoService
```

Responsabilidad:
- Publicar eventos de proyectos.
- Publicar eventos de actividades.
- Registrar logs de publicación.
- No contener lógica de negocio.

Publicar eventos después de operaciones exitosas:

## Proyectos

Después de crear proyecto:

```text
/topic/proyectos
PROYECTO_CREADO
```

Después de editar proyecto:

```text
/topic/proyectos
PROYECTO_ACTUALIZADO
```

Después de cancelar proyecto:

```text
/topic/proyectos
PROYECTO_CANCELADO
```

## Actividades

Después de crear actividad:

```text
/topic/proyectos/{idProyecto}/actividades
ACTIVIDAD_CREADA
```

Después de editar actividad:

```text
/topic/proyectos/{idProyecto}/actividades
ACTIVIDAD_ACTUALIZADA
```

Después de cancelar actividad:

```text
/topic/proyectos/{idProyecto}/actividades
ACTIVIDAD_CANCELADA
```

Reglas backend:
- No publicar evento si la operación falla.
- No publicar evento antes de confirmar la operación principal.
- No mover lógica de negocio al WebSocket.
- No crear tablas nuevas.
- No modificar Liquibase.
- No exponer entidades JPA directamente.
- No enviar datos sensibles por WebSocket.
- Mantener los endpoints REST como fuente principal de datos.

---

# Seguridad WebSocket

El WebSocket debe respetar autenticación JWT.

Reglas:
- El frontend debe enviar el token JWT al conectarse.
- El backend debe validar el token.
- Si el token no existe o es inválido, rechazar conexión o suscripción.
- El endpoint `/ws` puede requerir configuración especial en Spring Security para permitir handshake, pero la sesión WebSocket debe validar JWT.
- No permitir que usuarios sin sesión reciban eventos.

---

# Frontend WebSocket

Implementar servicio frontend:

```text
src/app/core/services/web-socket.service.ts
```

Puede usar:

```text
@stomp/stompjs
sockjs-client
```

Si las dependencias no existen, agregarlas al frontend.

Responsabilidades del servicio:
- Conectarse a `/ws`.
- Enviar token JWT en la conexión.
- Suscribirse a canales.
- Desconectarse al hacer logout.
- Exponer observables para eventos recibidos.

Canales frontend:

```text
/topic/proyectos
/topic/proyectos/{idProyecto}/actividades
```

---

# Comportamiento en Projects

En la vista:

```text
/projects
```

Suscribirse a:

```text
/topic/proyectos
```

Cuando llegue cualquiera de estos eventos:

```text
PROYECTO_CREADO
PROYECTO_ACTUALIZADO
PROYECTO_CANCELADO
```

El frontend debe:

```text
1. Mostrar mensaje breve si aplica.
2. Refrescar la tabla de proyectos llamando GET /api/proyectos.
3. No recalcular nada en frontend.
```

---

# Comportamiento en Activities

En la vista:

```text
/projects/:id/activities
```

Suscribirse a:

```text
/topic/proyectos/{idProyecto}/actividades
```

Cuando llegue cualquiera de estos eventos:

```text
ACTIVIDAD_CREADA
ACTIVIDAD_ACTUALIZADA
ACTIVIDAD_CANCELADA
```

El frontend debe:

```text
1. Mostrar mensaje breve si aplica.
2. Refrescar la tabla de actividades llamando GET /api/proyectos/{idProyecto}/actividades.
3. No recalcular nada en frontend.
```

Al salir de la vista de actividades, cancelar la suscripción específica del proyecto.

---

# Logout

Al hacer logout:

```text
1. Desconectar WebSocket.
2. Limpiar token.
3. Limpiar usuario.
4. Redirigir a /login.
```

---

# Restricciones frontend

No implementar:
- Indicadores EVM.
- Gráficos.
- Registro de horas.
- Asignaciones.
- RabbitMQ.
- Cálculos en frontend.

No crear estructura `features/`.

Mantener estructura actual:

```text
src/app/core
src/app/views/components
src/app/views/layout
src/app/views/pages
```

---

# Resultado esperado

Al finalizar:

1. El backend compila.
2. El backend arranca.
3. El frontend compila.
4. El usuario inicia sesión normalmente.
5. La vista `/projects` recibe eventos WebSocket.
6. Si otro cambio crea, edita o cancela un proyecto, la tabla se refresca automáticamente.
7. La vista `/projects/:id/activities` recibe eventos WebSocket.
8. Si se crea, edita o cancela una actividad, la tabla se refresca automáticamente.
9. Logout desconecta WebSocket.
10. No se implementa RabbitMQ.
11. No se implementa nada fuera del alcance.

---
---

Actúa siguiendo estrictamente las instrucciones del repositorio.

Estado actual:
- El backend ya conecta con PostgreSQL.
- Liquibase ya creó tablas y datos semilla.
- JWT funciona.
- El frontend ya tiene login, layout y navegación.
- El módulo Projects ya funciona.
- El módulo Activities ya funciona.
- Desde la tabla de actividades ya existen acciones como editar y cancelar actividad.

Objetivo de esta tarea:
Implementar la asignación de usuarios a actividades.

Esta fase debe cubrir únicamente:

- Listar usuarios asignados a una actividad.
- Listar usuarios disponibles para asignar.
- Asignar uno o varios usuarios activos a una actividad.
- Retirar usuarios asignados de una actividad de forma lógica.
- Agregar acción `Asignar usuarios` en la tabla de actividades.
- Crear dialog de asignación de usuarios en frontend.

No implementar todavía:

- Registro de horas.
- Indicadores EVM.
- Gráficos.
- WebSocket adicional.
- Vista colaborador.
- Cálculos EVM.

---

# Documentos obligatorios a revisar antes de implementar

Revisa primero:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/database.instructions.md`
- `/docs/01-flujo-funcional.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/04-frontend-especificacion.md`
- `/docs/05-reglas-negocio.md`

---

# Alcance backend permitido

Implementar únicamente endpoints REST para asignaciones de usuarios a actividades.

Endpoints esperados:

```text
GET    /api/actividades/{idActividad}/asignaciones
GET    /api/actividades/{idActividad}/usuarios-disponibles
POST   /api/actividades/{idActividad}/asignaciones
PATCH  /api/asignaciones/{idAsignacion}/retirar
```

---

# Reglas backend para asignaciones

1. Solo usuarios con rol `LIDER` pueden:
   - asignar usuarios a actividades,
   - retirar usuarios de actividades.

2. Los endpoints deben requerir JWT.

3. No exponer entidades JPA directamente.

4. Usar DTOs de request y response.

5. Usar servicios para lógica de negocio.

6. Los controladores REST no deben contener lógica de negocio.

7. Mantener estructura actual:

```text
resource
service
service/impl
repository
domain
dto
mapper
```

8. No crear tablas nuevas.

9. No modificar changelogs Liquibase ya ejecutados.

10. No implementar todavía registro de horas.

---

# Modelo esperado

Usar la tabla existente:

```text
tbl_asignaciones_actividades
```

Debe relacionar:

```text
actividad
usuario
estado_asignacion
fecha_asignacion
fecha_retiro
```

Si los nombres exactos de campos difieren, usar los nombres reales documentados en `/docs/02-modelo-base-datos.md`.

No inventar campos.

---

# Estados de asignación

Usar los estados existentes en:

```text
tbl_estados_asignaciones
```

Reglas:

- Al asignar un usuario, la asignación debe quedar en estado activo.
- Al retirar un usuario, no se debe eliminar físicamente.
- Al retirar, cambiar el estado de la asignación al estado correspondiente de retiro/inactivo definido en la tabla de estados.
- Si el estado requerido no existe en la semilla, no inventarlo: reportar el problema antes de continuar.

---

# Validaciones backend

Validar:

- `idActividad` obligatorio y existente.
- No permitir asignar usuarios a actividad inexistente.
- No permitir asignar usuarios a actividad `CANCELADA`.
- No permitir asignar usuarios si el proyecto asociado está `CANCELADO`.
- El usuario a asignar debe existir.
- El usuario a asignar debe estar `ACTIVO`.
- No permitir asignaciones duplicadas activas del mismo usuario en la misma actividad.
- Permitir asignar al propio líder si es un usuario activo.
- Permitir asignar colaboradores activos.
- No permitir retirar una asignación inexistente.
- No permitir retirar una asignación ya retirada/inactiva.
- Si no hay asignaciones, retornar lista vacía `[]`, no 404.
- Si no hay usuarios disponibles, retornar lista vacía `[]`, no 404.

---

# Request para asignar usuarios

El endpoint:

```text
POST /api/actividades/{idActividad}/asignaciones
```

Debe permitir asignar uno o varios usuarios.

Request esperado:

```json
{
  "idsUsuarios": [1, 2]
}
```

Response esperado:

```json
[
  {
    "id": 1,
    "idActividad": 1,
    "idUsuario": 2,
    "nombreUsuario": "Colaborador Demo",
    "correoUsuario": "colaborador.demo@evm.local",
    "cargoUsuario": "Desarrollador",
    "estado": "ACTIVA",
    "fechaAsignacion": "2026-05-19T10:30:00",
    "fechaRetiro": null
  }
]
```

Ajustar los nombres según los DTOs existentes, pero mantener claridad en la respuesta.

---

# Usuarios disponibles

El endpoint:

```text
GET /api/actividades/{idActividad}/usuarios-disponibles
```

Debe retornar usuarios activos que todavía no tengan asignación activa en esa actividad.

Response esperado:

```json
[
  {
    "id": 2,
    "nombre": "Colaborador Demo",
    "correo": "colaborador.demo@evm.local",
    "cargo": "Desarrollador",
    "rol": "COLABORADOR"
  }
]
```

---

# Logs backend

Agregar logs claros para:

- usuario asignado a actividad,
- múltiples usuarios asignados,
- usuario retirado de actividad,
- intento de asignación duplicada,
- intento de asignación sobre actividad cancelada,
- intento de asignación con usuario inactivo,
- intento de retiro inválido.

No registrar información sensible.

---

# Alcance frontend permitido

En la vista:

```text
/projects/:id/activities
```

Agregar en la columna acciones de cada actividad:

```text
Asignar usuarios
```

Acciones visibles para cada actividad:

```text
Editar actividad
Asignar usuarios
Cancelar actividad
```

La acción `Asignar usuarios` debe estar visible solo para rol `LIDER`.

Si la actividad está `CANCELADA`, no permitir asignar usuarios.

---

# Dialog de asignación de usuarios

Crear un dialog usando PrimeNG.

Debe abrirse desde:

```text
Actividades -> Acciones -> Asignar usuarios
```

Debe mostrar:

1. Nombre de la actividad seleccionada.
2. Usuarios actualmente asignados.
3. Usuarios disponibles para asignar.
4. Opción para asignar uno o varios usuarios.
5. Opción para retirar usuarios asignados.

---

# Comportamiento del dialog

Al abrir el dialog:

1. Consultar asignaciones actuales:

```text
GET /api/actividades/{idActividad}/asignaciones
```

2. Consultar usuarios disponibles:

```text
GET /api/actividades/{idActividad}/usuarios-disponibles
```

Al asignar:

```text
POST /api/actividades/{idActividad}/asignaciones
```

Al retirar:

```text
PATCH /api/asignaciones/{idAsignacion}/retirar
```

Después de asignar o retirar:

- refrescar asignaciones actuales,
- refrescar usuarios disponibles,
- mostrar mensaje de éxito,
- mantener el dialog abierto.

---

# Diseño frontend sugerido

Dentro del dialog usar una organización clara:

```text
Usuarios asignados
- tabla/lista con nombre, correo, cargo, estado y acción retirar

Usuarios disponibles
- multiselect o tabla con selección múltiple
- botón Asignar seleccionados
```

Aplicar principio `Don't Make Me Think`:

- textos claros,
- acciones visibles,
- mensajes de confirmación,
- estado vacío si no hay usuarios disponibles,
- estado vacío si no hay usuarios asignados.

---

# Servicios frontend

Crear o completar servicio:

```text
AsignacionActividadService
```

Ubicación esperada:

```text
src/app/core/services
```

Debe consumir:

```text
GET    /api/actividades/{idActividad}/asignaciones
GET    /api/actividades/{idActividad}/usuarios-disponibles
POST   /api/actividades/{idActividad}/asignaciones
PATCH  /api/asignaciones/{idAsignacion}/retirar
```

---

# Modelos frontend

Crear modelos en:

```text
src/app/core/models
```

Modelos mínimos:

```text
AsignacionActividadRequest
AsignacionActividadResponse
UsuarioDisponibleResponse
```

No inventar campos no retornados por backend.

---

# Restricciones frontend

No implementar todavía:

- registro de horas,
- indicadores,
- gráficos,
- WebSocket adicional,
- cálculo EVM,
- vista colaborador.

No crear estructura `features/`.

Mantener estructura actual:

```text
src/app/core
src/app/views/components
src/app/views/layout
src/app/views/pages
```

---

# Resultado esperado

Al finalizar:

1. El backend compila.
2. El backend arranca.
3. Los endpoints de asignaciones funcionan con JWT.
4. El frontend compila.
5. En actividades aparece la acción `Asignar usuarios`.
6. El líder puede abrir el dialog de asignaciones.
7. El líder puede asignar usuarios activos a una actividad.
8. El líder puede retirar usuarios asignados.
9. No se permiten asignaciones duplicadas activas.
10. No se permite asignar usuarios a actividades canceladas.
11. No se eliminan asignaciones físicamente.
12. No se implementa nada fuera del alcance.

---
---

Actúa siguiendo estrictamente las instrucciones del repositorio.

Estado actual:
- Login JWT funciona.
- Projects funciona.
- Activities funciona.
- Asignaciones funciona o debe respetarse si ya está implementado.
- Registro/reporte de horas funciona o debe respetarse si ya está implementado.
- Ya existen actividades con BAC, avance planificado, avance real y registros de horas.
- No se deben persistir indicadores EVM derivados.

Objetivo de esta tarea:
Implementar visualización de indicadores EVM para proyectos y actividades, calculados desde backend y representados en frontend con enfoque `Don't Make Me Think`.

Esta fase debe cubrir:

- Indicadores consolidados del proyecto en `/projects/:id/activities`.
- Filtro por ID o nombre de actividad para recalcular indicadores sobre actividades coincidentes.
- Visualización gráfica con barras para PV, EV y AC.
- Visualización clara de CPI, SPI, CV, SV, EAC y VAC.
- Acción `Ver estadísticas` en cada actividad.
- Vista/diálogo de estadísticas específicas por actividad.
- Mostrar el ID de la actividad junto al nombre en la tabla de actividades.

No implementar todavía:
- WebSocket adicional.
- Exportaciones.
- Nuevas tablas.
- Persistencia de indicadores EVM.
- Cálculos EVM en frontend.

---

# Documentos obligatorios a revisar

Antes de implementar, revisar:

- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `/docs/01-flujo-funcional.md`
- `/docs/02-modelo-base-datos.md`
- `/docs/03-backend-especificacion.md`
- `/docs/04-frontend-especificacion.md`
- `/docs/05-reglas-negocio.md`
- `/docs/06-evm-calculos.md`

---

# Regla principal

Los indicadores EVM deben calcularse únicamente en backend.

El frontend no debe calcular:

```text
PV
EV
AC
CV
SV
CPI
SPI
EAC
VAC
```

El frontend solo debe:
- enviar filtros,
- consumir respuestas,
- pintar tarjetas,
- pintar tablas,
- pintar gráficos,
- mostrar mensajes interpretativos.

---

# Fórmulas EVM obligatorias

Usar las fórmulas documentadas:

```text
PV = porcentaje_avance_planificado × BAC
EV = porcentaje_avance_real × BAC
AC = SUM(horas_trabajadas × valor_hora_historico)
CV = EV - AC
SV = EV - PV
CPI = EV / AC
SPI = EV / PV
EAC = BAC / CPI
VAC = BAC - EAC
```

Importante:

Los porcentajes deben interpretarse como porcentaje sobre 100.

Ejemplo:

```text
100% = 1.00
80% = 0.80
45% = 0.45
```

---

# Casos borde obligatorios

Controlar:

- Si AC es 0, CPI no debe generar división por cero.
- Si PV es 0, SPI no debe generar división por cero.
- Si CPI es 0 o no calculable, EAC no debe generar división por cero.
- Si no hay actividades, retornar valores seguros.
- Si no hay registros de horas, AC debe ser 0.
- Si el filtro no encuentra actividades, retornar consolidado vacío seguro.

Para valores no calculables, retornar `null` o un campo explícito que indique que no aplica.

No retornar errores 500 por divisiones.

---

# Interpretación obligatoria

El backend debe retornar interpretación textual de CPI y SPI.

## CPI

```text
CPI > 1     -> Bajo presupuesto / eficiente en costos
CPI = 1     -> En presupuesto
0.90 - 0.99 -> Riesgo en costos
CPI < 0.90  -> Sobre presupuesto / crítico
```

## SPI

```text
SPI > 1     -> Adelantado frente al cronograma
SPI = 1     -> En cronograma
0.90 - 0.99 -> Riesgo en cronograma
SPI < 0.90  -> Atrasado / crítico
```

## Estado visual sugerido

Retornar también un estado simple:

```text
BIEN
RIESGO
CRITICO
SIN_DATOS
```

Este estado será usado por el frontend para colores y badges.

---

# Backend: endpoints requeridos

Implementar endpoints para indicadores.

```text
GET /api/proyectos/{idProyecto}/indicadores
GET /api/proyectos/{idProyecto}/indicadores?filtro=texto
GET /api/actividades/{idActividad}/indicadores
```

## Endpoint proyecto

```text
GET /api/proyectos/{idProyecto}/indicadores
```

Debe calcular indicadores consolidados usando todas las actividades activas del proyecto.

## Endpoint proyecto con filtro

```text
GET /api/proyectos/{idProyecto}/indicadores?filtro=texto
```

Debe calcular indicadores consolidados únicamente con actividades cuyo:

```text
id coincida con el filtro
o nombre contenga el filtro
```

Reglas del filtro:

- Si el filtro está vacío, usar todas las actividades activas del proyecto.
- Si el filtro es numérico, buscar también por ID de actividad.
- Si el filtro es texto, buscar por nombre de actividad.
- Si no hay coincidencias, retornar consolidado seguro sin error 404.

## Endpoint actividad

```text
GET /api/actividades/{idActividad}/indicadores
```

Debe calcular indicadores únicamente para esa actividad.

---

# Backend: DTOs esperados

Crear DTOs claros, por ejemplo:

```text
IndicadoresEvmResponseDTO
IndicadorEvmDetalleActividadDTO
InterpretacionEvmDTO
```

Response sugerido para proyecto:

```json
{
  "idProyecto": 1,
  "nombreProyecto": "BKK – Enterprise Solutions",
  "filtroAplicado": null,
  "cantidadActividades": 9,
  "bac": 140800000,
  "pv": 85000000,
  "ev": 72000000,
  "ac": 60000000,
  "cv": 12000000,
  "sv": -13000000,
  "cpi": 1.2,
  "spi": 0.85,
  "eac": 117333333.33,
  "vac": 23466666.67,
  "estadoCosto": "BIEN",
  "estadoCronograma": "CRITICO",
  "interpretacionCosto": "El proyecto está siendo eficiente en costos.",
  "interpretacionCronograma": "El proyecto está atrasado frente al avance planificado.",
  "actividades": [
    {
      "idActividad": 1,
      "nombreActividad": "Levantamiento y análisis de requerimientos",
      "bac": 12000000,
      "pv": 12000000,
      "ev": 12000000,
      "ac": 0,
      "cv": 12000000,
      "sv": 0,
      "cpi": null,
      "spi": 1,
      "estadoCosto": "SIN_DATOS",
      "estadoCronograma": "BIEN"
    }
  ]
}
```

Response sugerido para actividad:

```json
{
  "idActividad": 1,
  "nombreActividad": "Levantamiento y análisis de requerimientos",
  "idProyecto": 1,
  "nombreProyecto": "BKK – Enterprise Solutions",
  "bac": 12000000,
  "pv": 12000000,
  "ev": 12000000,
  "ac": 0,
  "cv": 12000000,
  "sv": 0,
  "cpi": null,
  "spi": 1,
  "eac": null,
  "vac": null,
  "estadoCosto": "SIN_DATOS",
  "estadoCronograma": "BIEN",
  "interpretacionCosto": "No hay costo real registrado para calcular CPI.",
  "interpretacionCronograma": "La actividad está en cronograma."
}
```

Ajustar nombres según convenciones existentes, pero mantener claridad funcional.

---

# Backend: estructura esperada

Crear o completar:

```text
IndicadorEvmResource
IndicadorEvmService
IndicadorEvmServiceImpl
```

Ubicación:

```text
resource
service
service/impl
dto
```

No crear tabla nueva.

No modificar Liquibase.

No guardar indicadores derivados.

---

# Backend: logs

Agregar logs para:

- consulta de indicadores de proyecto,
- consulta de indicadores con filtro,
- consulta de indicadores de actividad,
- filtro sin resultados,
- casos borde AC = 0,
- casos borde PV = 0,
- errores funcionales controlados.

No registrar datos sensibles.

---

# Frontend: vista de actividades

Modificar la vista:

```text
/projects/:id/activities
```

Debe incluir una sección superior de indicadores del proyecto.

La pantalla debe quedar organizada así:

```text
Título: Actividades del proyecto
Subtítulo: nombre del proyecto

[Panel de indicadores EVM]
[Filtro de actividad]
[Gráfico de barras PV vs EV vs AC]
[Tarjetas CPI/SPI]
[Tabla de indicadores principales]

[Tabla de actividades]
```

---

# Filtro de actividades para indicadores

Agregar un filtro visible en la parte superior del panel de indicadores.

Placeholder sugerido:

```text
Buscar actividad por ID o nombre
```

Reglas:

- Si el filtro está vacío, cargar indicadores de todas las actividades del proyecto.
- Si el usuario escribe ID o nombre, consumir:

```text
GET /api/proyectos/{idProyecto}/indicadores?filtro=texto
```

- El filtro debe buscar por ID y por nombre.
- Usar debounce para evitar muchas llamadas.
- Mostrar texto claro cuando el filtro está aplicado:

```text
Indicadores calculados sobre actividades filtradas.
```

- Si no hay coincidencias, mostrar estado vacío:

```text
No se encontraron actividades para el filtro ingresado.
```

---

# Modificación de tabla de actividades

En la tabla de actividades, modificar la columna `Nombre`.

Debe mostrar:

```text
Nombre de la actividad
ID: 1
```

Ejemplo visual:

```text
Levantamiento y análisis de requerimientos
ID: 1
```

El ID debe verse justo debajo o al lado del nombre, de manera clara pero no invasiva.

---

# Acción Ver estadísticas

En la columna acciones de actividades, agregar:

```text
Ver estadísticas
```

Comportamiento:

1. Al hacer clic, colocar automáticamente el ID de la actividad en el filtro superior.
2. Consumir:

```text
GET /api/proyectos/{idProyecto}/indicadores?filtro={idActividad}
```

3. Actualizar el panel de indicadores con esa actividad.
4. Hacer scroll o foco visual hacia el panel de indicadores si aplica.

Además, puede abrirse un dialog de detalle si ya existe una estructura de dialogs, pero la prioridad es que la pantalla superior refleje los indicadores de esa actividad.

---

# Frontend: gráfico de barras

Usar un gráfico de barras para comparar:

```text
PV
EV
AC
```

Debe representar los valores consolidados que retorne el backend.

Usar PrimeNG Chart si ya está disponible.

Si PrimeNG Chart requiere Chart.js y no está instalado, agregar `chart.js`.

El gráfico debe responder la pregunta:

```text
¿Lo ganado y lo planeado están alineados con lo gastado?
```

No saturar el gráfico.

Debe mostrar máximo:

```text
PV
EV
AC
```

---

# Frontend: tarjetas principales

Mostrar tarjetas para:

```text
CPI
SPI
CV
SV
EAC
VAC
```

Las tarjetas más importantes visualmente son:

```text
CPI
SPI
```

Porque indican rápidamente:

```text
Costo
Cronograma
```

Cada tarjeta debe mostrar:

- nombre del indicador,
- valor,
- interpretación breve,
- estado visual.

Ejemplo:

```text
CPI
1.20
Eficiente en costos
BIEN
```

```text
SPI
0.85
Atrasado frente al cronograma
CRITICO
```

---

# Colores sugeridos

Usar colores de estado de forma simple:

```text
BIEN      -> verde
RIESGO    -> amarillo/naranja
CRITICO   -> rojo
SIN_DATOS -> gris
```

No depender solo del color.

También mostrar texto.

---

# Responsive / pantallas pequeñas

Si la pantalla es pequeña:

- las tarjetas deben apilarse,
- el gráfico debe ocupar ancho completo,
- la tabla de indicadores puede convertirse en cards,
- evitar scroll horizontal innecesario,
- mantener CPI y SPI visibles arriba.

El diseño debe seguir `Don't Make Me Think`.

El usuario debe entender rápidamente:

```text
¿Voy bien en costo?
¿Voy bien en tiempo?
¿Cuánto planeé?
¿Cuánto gané?
¿Cuánto gasté?
```

---

# Frontend: servicios y modelos

Crear o completar servicio:

```text
IndicadorEvmService
```

Ubicación:

```text
src/app/core/services
```

Debe consumir:

```text
GET /api/proyectos/{idProyecto}/indicadores
GET /api/proyectos/{idProyecto}/indicadores?filtro=texto
GET /api/actividades/{idActividad}/indicadores
```

Crear modelos en:

```text
src/app/core/models
```

Modelos mínimos:

```text
IndicadoresEvmResponse
IndicadorEvmDetalleActividad
EstadoEvm
```

No inventar campos no retornados por backend.

---

# Restricciones frontend

No calcular indicadores EVM en frontend.

No implementar nuevos endpoints inventados.

No guardar indicadores en local storage.

No crear nuevas rutas innecesarias.

No crear estructura `features/`.

Mantener estructura actual:

```text
src/app/core
src/app/views/components
src/app/views/layout
src/app/views/pages
```

---

# Resultado esperado

Al finalizar:

1. Backend compila.
2. Backend arranca.
3. Endpoints de indicadores funcionan con JWT.
4. Frontend compila.
5. En `/projects/:id/activities` aparece panel superior de indicadores.
6. Si el filtro está vacío, los indicadores son del conjunto de actividades.
7. Si se filtra por ID o nombre, los indicadores se recalculan según coincidencias.
8. En la tabla de actividades se muestra el ID junto al nombre.
9. En acciones aparece `Ver estadísticas`.
10. Al dar clic en `Ver estadísticas`, el ID se coloca en el filtro y se actualizan indicadores.
11. Se muestra gráfico de barras PV vs EV vs AC.
12. Se muestran CPI, SPI, CV, SV, EAC y VAC con interpretación clara.
13. El diseño es responsive.
14. No se persisten indicadores EVM.
15. No se calcula EVM en frontend.

---
> Bugs y corrección de estilos
---

# Ajustes visuales

1. Buscar los mismos *inputs* que tiene la vista de **Editar/Crear actividades** y aplicarlos en toda la aplicación, especialmente en *“Reporte de horas — Levantamiento y análisis de requerimientos”*. Por favor, ajusta sus *inputs*.

2. El filtro debe estar compuesto por el botón de **Buscar** y el de **Limpiar**, ambos alineados con el *input* del filtro.  
   - Deben ser de tipo botón secundario.  
   - En origen su texto no estará visible, pero a partir de un tamaño de pantalla mayor a “sm” su texto será visible (ejemplo: “Limpiar”).

3. La columna **Acciones** de la tabla debe ser fija en forma vertical, conservando su espacio actual. Esto permitirá realizar *scroll* horizontal y mantener siempre las acciones a la mano.

4. El botón **“Ver estadísticas”** que tiene cada registro debe ir dentro del menú de **Acciones**.

5. Los indicadores serán *responsive*:  

   ### col-12
   - Los indicadores “PV”, “EV”, “AC” se visualizarán igual que “CPI” y “SPI”.

   ### col-sm
   - Primera fila: indicador “CPI”.  
   - Segunda fila: indicador “SPI”.  
   - Tercera fila: indicadores “CV”, “SV”.  
   - Cuarta fila: indicadores “EAC”, “VAC”.  
   - Quinta fila: indicadores “BAC”, “PV” en posición *row*.  
   - Sexta fila: indicadores “EV”, “AC” en posición *row*.  
   - Séptima fila: indicadores “PV”, “EV”, “AC” en forma de diagrama.  

   ### col-md
   - Primera fila: indicadores “CPI” y “SPI”.  
   - Segunda fila: indicadores “CV”, “SV”, “EAC”, “VAC”.  
   - Tercera fila: indicadores “BAC”, “PV”, “EV”, “AC” en posición *row*.  
   - Cuarta fila: indicadores “PV”, “EV”, “AC” en forma de diagrama.  

   ### col-lg en adelante
   - Sección “article” con indicadores “BAC”, “PV”, “EV”, “AC” en posición *column*.  
   - Al lado del artículo, una sección con indicadores “CPI”, “SPI”, “CV”, “SV”, “EAC”, “VAC”:  
     - Primera fila: “CPI” y “SPI”.  
     - Segunda fila: “CV”, “SV”, “EAC”, “VAC”.  
   - Debajo, una sección con indicadores “PV”, “EV”, “AC” en forma de diagrama.

6. Existe un *bug*: al dar clic en cualquier opción (tanto en proyectos como en actividades), la acción no funciona en el primer intento, pero sí en el segundo. Es necesario corregirlo.

7. Crear una columna aparte para el **ID** de la actividad, llamada **“Código”**.
---
# Segundos ajustes
---
# Ajustes e implementación testing.

1. El filtro actualmente esta actuando  "Panel de indicadores EVM" pero es necesario que se implemente también en "Tabla de actividades"
A. El botón "Limpiar" también restablecerá los valores de la tabla, posicionando la en la primera pagina, reseteando la tabla, su sorf y su rowsizeperpage.

2. Es necesesario que cada elemento relevante tenga su propio "id".
A. Esencial para buttons, inputs, tablas, sections

3. Estable un comportamiento similar en "Accinoes"  de proyectos de "Acciones" actividades, con ello  pretendemos que también la columna "Acciones" en proyectos sea fija ante scroll horizontal.

4. En las tablas de proyectos y en Actividades agrega les un contenedor elemento "card" para tener un espaciado.

5. Establece un filtro en proyectos por "nombre" del proyecto

6. Necesito que me ayudes a implementar los spec faltantes en.
A. Projects: 
   * Evalua  las peticiones de ordenamiento y de filtro, controlemos comportamienos no deseados por falta de data.
   *  Evalua y controlemos la acción de cancelar proyectos, no podemos cerrar un proyecto si tiene actividades activas.

B. Activities:
   * Evalua y controla la visualización de los indices, cuando no hay data disponible debe marcarce todo en "0"
   * Evalua y controla la actividad en el filtro, si no se encuentra información debe salir una notificación indicando que no se encontraron registros coincidentes.
   * Evalua y controla la tabla cuando no tenemos información disponible.
   * Evalua y controla la visualización solo para el rol lider de las estadisticas.
   
C. Assign-users: Evalua para su control de cuando no tenemos  usuarios disponibles, 
D. registro-horas: 
   * Evalua y controla sus limites en campos, las horas tienen que ser en numero entero.
   * Evalua cuando no  tenemos  usuarios asignados a esta actividad, debería indicar  que no existen usuarios asignados a esta tarea.
