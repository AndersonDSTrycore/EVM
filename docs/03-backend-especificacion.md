# Especificación Backend

## Objetivo del documento

Este documento define las reglas técnicas, arquitectónicas y funcionales para la implementación del backend del sistema de gestión de proyectos, actividades, registro de horas y análisis EVM.

Copilot debe usar este documento como fuente principal para generar:

- Arquitectura backend.
- Controladores REST.
- Servicios.
- DTOs.
- Mappers.
- Repositories.
- Seguridad JWT.
- Manejo de errores.
- Trazabilidad mediante logs.
- Documentación OpenAPI / Swagger.
- Pruebas unitarias e integración.

No se deben crear endpoints, rutas, DTOs, servicios, excepciones ni estructuras de respuesta que no estén definidas o justificadas en este documento y en los documentos relacionados.

---

# Documentos relacionados

Antes de implementar backend, Copilot debe revisar:

```text
/docs/00-contexto-general.md
/docs/01-flujo-funcional.md
/docs/02-modelo-base-datos.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
/docs/07-websocket.md
```

Si existe conflicto entre documentos, debe prevalecer:

1. `/docs/02-modelo-base-datos.md` para persistencia.
2. `/docs/05-reglas-negocio.md` para reglas funcionales.
3. `/docs/06-evm-calculos.md` para cálculos EVM.
4. Este documento para arquitectura backend.

---

# Stack backend

El backend debe implementarse con:

- Java.
- Spring Boot.
- Spring Security.
- JWT Bearer Token.
- Spring Data JPA.
- Hibernate.
- PostgreSQL.
- Liquibase.
- OpenAPI / Swagger.
- Docker Compose.

---

# Arquitectura base

El backend debe seguir la siguiente estructura:

```text
resource
service
service_impl
repository
domain
dto
mapper
config
security
exception
logging
test
```

---

# Responsabilidades por capa

## resource

Capa encargada de exponer endpoints REST.

Reglas:

- No debe contener lógica de negocio.
- No debe realizar cálculos EVM.
- No debe consultar repositories directamente.
- Debe recibir DTOs de entrada.
- Debe retornar DTOs de salida.
- Debe delegar la lógica a servicios.
- Debe declarar correctamente códigos HTTP.
- Debe estar documentada con OpenAPI / Swagger.

---

## service

Capa que define contratos de negocio mediante interfaces.

Reglas:

- Debe declarar métodos de negocio.
- No debe contener implementación.
- Debe tener nombres claros y específicos.

Ejemplo:

```text
ProyectoService
ActividadService
RegistroHorasService
IndicadorEvmService
```

---

## service_impl

Capa que implementa la lógica de negocio.

Reglas:

- Aquí deben vivir las validaciones funcionales.
- Aquí debe vivir la coordinación de repositories.
- Aquí debe estar la lógica transaccional.
- Aquí deben capturarse y relanzarse errores específicos cuando aplique.
- Aquí debe generarse log de operaciones relevantes.
- No debe retornar entidades JPA directamente.

---

## repository

Capa exclusiva para acceso a datos.

Reglas:

- Usar Spring Data JPA.
- No incluir lógica de negocio.
- No calcular indicadores EVM complejos aquí.
- Solo consultas necesarias para recuperar datos fuente.
- Consultas personalizadas deben tener nombres claros.

---

## domain

Capa de entidades JPA.

Reglas:

- Las entidades deben representar fielmente `/docs/02-modelo-base-datos.md`.
- No deben contener lógica de negocio compleja.
- Deben mapear tablas y columnas explícitamente cuando aplique.
- No deben exponerse directamente en responses REST.

---

## dto

Capa de objetos de entrada y salida.

Reglas:

- Usar DTOs para requests.
- Usar DTOs para responses.
- Usar DTOs específicos para indicadores.
- Usar DTOs específicos para errores.
- No reutilizar entidades JPA como DTOs.

---

## mapper

Capa encargada de transformar:

- Entity → DTO.
- DTO → Entity.

Reglas:

- No incluir lógica de negocio.
- No calcular EVM.
- No consultar repositories.

---

## exception

Capa encargada de definir excepciones personalizadas y respuestas de error.

Debe incluir:

- Excepciones de negocio.
- Excepciones de validación.
- Excepciones de seguridad.
- Excepciones de persistencia controlada.
- Manejador global de errores.

---

## logging

Capa o configuración relacionada con trazabilidad.

Debe permitir identificar:

- Qué operación se ejecutó.
- Qué usuario la ejecutó.
- Qué parámetros relevantes recibió.
- Qué entidad fue afectada.
- Qué error ocurrió.
- En qué capa ocurrió.

---

# Seguridad

## Regla obligatoria

Nada se puede consumir sin JWT Token, excepto los endpoints explícitamente públicos de autenticación.

Endpoints públicos permitidos inicialmente:

```text
POST /api/auth/login
```

Todo lo demás requiere:

```text
Authorization: Bearer <token>
```

---

# JWT

El backend debe manejar autenticación mediante JWT Bearer Token.

El token debe permitir identificar:

- id del usuario autenticado.
- correo.
- rol de sistema.
- permisos funcionales cuando aplique.

---

# Roles funcionales

Roles iniciales:

```text
LIDER
COLABORADOR
```

---

# Reglas de acceso

## Líder

Puede:

- Gestionar proyectos.
- Gestionar actividades.
- Asignar usuarios.
- Registrar horas propias.
- Registrar horas en nombre de colaboradores asignados.
- Consultar dashboards generales.
- Consultar indicadores consolidados.

---

## Colaborador

Puede:

- Consultar únicamente sus actividades asignadas.
- Registrar horas sobre actividades asignadas.
- Consultar indicadores de sus actividades.

No puede:

- Crear proyectos.
- Editar proyectos.
- Eliminar proyectos.
- Consultar información global de proyectos ajenos.
- Asignar usuarios.

---

# Trazabilidad mediante logs

El backend debe manejar logs para garantizar trazabilidad de los hechos relevantes del sistema.

Los logs deben permitir responder:

- Qué ocurrió.
- Cuándo ocurrió.
- Quién lo ejecutó.
- Sobre qué entidad ocurrió.
- Qué parámetros relevantes fueron recibidos.
- Si la operación fue exitosa o fallida.
- Qué error se produjo en caso de fallo.

---

# Eventos que deben generar log

Como mínimo, se debe registrar log en:

## Autenticación

- Login exitoso.
- Login fallido.
- Token inválido.
- Intento de acceso sin token.

## Proyectos

- Creación de proyecto.
- Actualización de proyecto.
- Cancelación o cambio de estado de proyecto.
- Consulta de proyectos.
- Consulta de detalle de proyecto.

## Actividades

- Creación de actividad.
- Actualización de actividad.
- Cancelación o cambio de estado de actividad.
- Consulta de actividades por proyecto.
- Consulta de indicadores de actividad.

## Asignaciones

- Asignación de usuario a actividad.
- Retiro de usuario de actividad.
- Intento de asignación duplicada.
- Intento de asignar usuario inactivo.
- Intento de asignar usuario a actividad finalizada o cancelada.

## Registros de horas

- Registro de horas.
- Actualización de registro de horas.
- Intento de registrar horas para usuario no asignado.
- Intento de registrar horas sobre actividad no permitida.
- Registro de horas hecho por líder en nombre de colaborador.

## EVM

- Cálculo de indicadores por actividad.
- Cálculo consolidado por proyecto.
- Error durante cálculo de indicadores.
- Detección de sobrepresupuesto.
- Detección de retraso o desviación.

---

# Nivel de logs

Usar niveles de log de forma consistente:

| Nivel | Uso |
|---|---|
| INFO | Operaciones importantes exitosas |
| WARN | Situaciones controladas o reglas de negocio incumplidas |
| ERROR | Errores reales o fallos técnicos |
| DEBUG | Detalle técnico útil en desarrollo |
| TRACE | No usar salvo necesidad puntual |

---

# Información mínima en logs

Cada log relevante debe incluir, cuando aplique:

- `usuario_autenticado`.
- `rol_usuario`.
- `operacion`.
- `entidad`.
- `id_entidad`.
- `parametros_recibidos`.
- `resultado`.
- `mensaje`.

Ejemplo conceptual:

```text
INFO - usuario=juan@empresa.com rol=LIDER operacion=CREAR_ACTIVIDAD entidad=tbl_actividades id_proyecto=10 resultado=EXITOSO
```

---

# Información sensible en logs

No se debe registrar:

- Contraseñas.
- Tokens JWT completos.
- Hashes de contraseña.
- Datos sensibles innecesarios.
- Cabeceras completas de autorización.

Si se requiere registrar token para depuración, solo se permite registrar una versión enmascarada.

---

# Manejo de errores

El backend debe manejar errores de forma controlada, clara y trazable.

La aplicación debe contar con:

```text
GlobalExceptionHandler
```

Este manejador centralizará la estructura final de respuesta de errores.

Adicionalmente, los servicios podrán usar `try-catch` para capturar errores específicos, registrar logs y relanzar excepciones controladas.

---

# Regla sobre try-catch

No se debe usar `try-catch` genérico sin propósito.

Cada `catch` debe tener una intención clara.

Se deben usar múltiples `catch` cuando sea necesario para diferenciar el origen del problema.

Ejemplos de errores a diferenciar:

- Variables de origen indefinidas.
- Datos nulos no permitidos.
- Error de conexión con base de datos.
- Error de integridad de datos.
- Error de estructura de tabla.
- Error de validación de negocio.
- Error de autenticación.
- Error de autorización.
- Error inesperado.

---

# Tipos de errores esperados

## Error por variables indefinidas o nulas

Ocurre cuando un valor requerido no existe, llega nulo o no puede procesarse.

Ejemplos:

- `idProyecto` nulo.
- `idActividad` nulo.
- `idUsuario` nulo.
- Request incompleto.
- Campo obligatorio vacío.

Debe retornar un error controlado de validación.

---

## Error de conexión con base de datos

Ocurre cuando no se puede establecer comunicación con PostgreSQL.

Ejemplos:

- Base de datos no disponible.
- Timeout de conexión.
- Credenciales inválidas.
- Pool de conexiones agotado.

Debe generar log `ERROR`.

---

## Error de integridad de datos

Ocurre cuando un dato rompe restricciones de base de datos.

Ejemplos:

- Llave foránea inexistente.
- Registro duplicado en campo único.
- Violación de restricción NOT NULL.
- Violación de restricción CHECK.
- Valor numérico fuera de rango.

Debe retornar un error controlado indicando que los datos no cumplen la estructura esperada.

---

## Error de regla de negocio

Ocurre cuando técnicamente el request es válido, pero viola una regla funcional.

Ejemplos:

- La suma de BAC de actividades supera el presupuesto del proyecto.
- Usuario no asignado intenta registrar horas.
- Colaborador intenta modificar proyecto.
- Actividad cancelada recibe registro de horas.
- Proyecto finalizado recibe nuevas actividades.

Debe retornar un error controlado de negocio.

---

## Error de autenticación

Ocurre cuando:

- No se envía token.
- Token inválido.
- Token expirado.
- Credenciales incorrectas.

Debe retornar un error de seguridad.

---

## Error de autorización

Ocurre cuando el usuario está autenticado, pero no tiene permisos para la acción.

Ejemplo:

- Colaborador intenta crear proyecto.
- Colaborador intenta asignar usuarios.
- Usuario intenta consultar actividad no asignada.

Debe retornar un error de permisos.

---

## Error inesperado

Ocurre cuando no se puede clasificar el error.

Debe:

- Generar log `ERROR`.
- Retornar mensaje controlado.
- No exponer stacktrace al frontend.
- No exponer detalles internos sensibles.

---

# Estructura estándar de errores

Todo error real debe retornar una estructura específica.

## Campos obligatorios

| Campo | Descripción |
|---|---|
| titulo | Título descriptivo del error |
| mensaje | Mensaje inicial entendible |
| detalle | Mensaje detallado del suceso |
| estado | Código HTTP |
| codigo | Código interno funcional o técnico |
| ruta | Ruta donde ocurrió el error |
| metodo | Método HTTP |
| parametros_recibidos | Parámetros relevantes recibidos |
| fecha_hora | Fecha y hora del error |

---

## Ejemplo de respuesta de error

```json
{
  "titulo": "Error al registrar horas",
  "mensaje": "No fue posible registrar las horas trabajadas.",
  "detalle": "El usuario indicado no se encuentra asignado a la actividad.",
  "estado": 400,
  "codigo": "REGISTRO_HORAS_USUARIO_NO_ASIGNADO",
  "ruta": "/api/actividades/15/registros-horas",
  "metodo": "POST",
  "parametros_recibidos": {
    "id_actividad": 15,
    "id_usuario": 8,
    "fecha_trabajo": "2026-05-18",
    "horas_trabajadas": 4
  },
  "fecha_hora": "2026-05-18T10:30:00"
}
```

---

# Códigos HTTP esperados

| Caso | Código HTTP |
|---|---|
| Operación exitosa | 200 |
| Creación exitosa | 201 |
| Actualización exitosa sin cuerpo | 204 |
| Request inválido | 400 |
| Token ausente o inválido | 401 |
| Sin permisos | 403 |
| Recurso individual no encontrado | 404 |
| Conflicto de negocio o duplicado | 409 |
| Error de validación semántica | 422 |
| Error interno inesperado | 500 |
| Base de datos no disponible | 503 |

---

# Regla especial para peticiones GET

Las peticiones GET que retornan colecciones NO deben lanzar 404 cuando no existan registros.

Ejemplos:

```text
GET /api/proyectos
GET /api/proyectos/{id}/actividades
GET /api/usuarios/{id}/actividades
GET /api/actividades/{id}/registros-horas
```

Si no hay datos, deben retornar:

```json
[]
```

Código HTTP:

```text
200 OK
```

---

# GET con mensaje informativo

Si se requiere enviar un mensaje informativo al frontend, se puede usar una estructura de respuesta envolvente.

Ejemplo:

```json
{
  "mensaje": "No se encontraron actividades para este proyecto.",
  "datos": []
}
```

Esta estructura solo debe usarse si el frontend requiere mostrar un mensaje contextual.

---

# GET de recurso individual

Cuando se consulte un recurso individual por ID:

```text
GET /api/proyectos/{id}
GET /api/actividades/{id}
GET /api/usuarios/{id}
```

Si el recurso no existe, sí se puede retornar:

```text
404 Not Found
```

Con la estructura estándar de error.

---

# Respuestas exitosas

Las respuestas exitosas deben ser claras y consistentes.

## Respuesta para colecciones

```json
[
  {
    "id": 1,
    "nombre": "Proyecto EVM"
  }
]
```

O, si se requiere mensaje:

```json
{
  "mensaje": "Consulta realizada correctamente.",
  "datos": [
    {
      "id": 1,
      "nombre": "Proyecto EVM"
    }
  ]
}
```

---

## Respuesta para creación

```text
201 Created
```

Debe retornar el recurso creado o un DTO resumen del recurso creado.

---

## Respuesta para actualización

Puede retornar:

```text
200 OK
```

con el recurso actualizado, o:

```text
204 No Content
```

si no se requiere cuerpo.

Para este proyecto se recomienda usar:

```text
200 OK
```

retornando el recurso actualizado, para facilitar la actualización del frontend en tiempo real.

---

# Endpoints iniciales esperados

## Autenticación

```text
POST /api/auth/login
```

Público.

Retorna JWT Token.

---

## Proyectos

```text
GET /api/proyectos
GET /api/proyectos/{id}
POST /api/proyectos
PUT /api/proyectos/{id}
DELETE /api/proyectos/{id}
```

Regla:

- `DELETE` no elimina físicamente.
- Debe cambiar el estado operativo a `CANCELADO`.

---

## Actividades

```text
GET /api/proyectos/{idProyecto}/actividades
GET /api/actividades/{id}
POST /api/proyectos/{idProyecto}/actividades
PUT /api/actividades/{id}
DELETE /api/actividades/{id}
```

Regla:

- `DELETE` no elimina físicamente.
- Debe cambiar el estado operativo a `CANCELADA`.

---

## Asignaciones

```text
GET /api/actividades/{idActividad}/asignaciones
POST /api/actividades/{idActividad}/asignaciones
DELETE /api/asignaciones/{id}
```

Regla:

- `DELETE` no elimina físicamente.
- Debe cambiar el estado de asignación a `RETIRADA` o `CANCELADA`.

---

## Registros de horas

```text
GET /api/actividades/{idActividad}/registros-horas
POST /api/actividades/{idActividad}/registros-horas
PUT /api/registros-horas/{id}
```

Regla:

- No se define eliminación física inicial para registros de horas.

---

## Indicadores EVM

```text
GET /api/proyectos/{idProyecto}/indicadores
GET /api/actividades/{idActividad}/indicadores
```

Regla:

- Los indicadores son calculados dinámicamente.
- No se persisten en base de datos.

---

# OpenAPI / Swagger

El backend debe documentar endpoints con OpenAPI / Swagger.

Debe estar disponible localmente en una de las siguientes rutas:

```text
/swagger-ui
/swagger-ui.html
/api-docs
/v3/api-docs
```

Cada endpoint debe documentar:

- Descripción.
- Parámetros.
- Request body.
- Response body.
- Códigos HTTP posibles.
- Errores esperados.
- Reglas de seguridad.

---

# Validaciones obligatorias

## Proyectos

- Nombre obligatorio.
- Fecha inicio obligatoria.
- Fecha fin obligatoria.
- Fecha fin mayor o igual a fecha inicio.
- Presupuesto total mayor o igual a cero.

---

## Actividades

- Nombre obligatorio.
- Proyecto obligatorio.
- BAC mayor o igual a cero.
- Porcentaje avance planificado entre 0 y 100.
- Porcentaje avance real entre 0 y 100.
- Fecha fin mayor o igual a fecha inicio.
- La suma de BAC de actividades no debe superar presupuesto total del proyecto.

---

## Usuarios

- Nombre obligatorio.
- Correo obligatorio.
- Correo único.
- Contraseña obligatoria en creación.
- Rol de sistema obligatorio.
- Cargo obligatorio.
- Estado de usuario obligatorio.

---

## Asignaciones

- Actividad obligatoria.
- Usuario obligatorio.
- No permitir asignación activa duplicada.
- No permitir asignar usuario inactivo.
- No permitir asignar en actividad finalizada o cancelada.

---

## Registros de horas

- Actividad obligatoria.
- Usuario obligatorio.
- Fecha de trabajo obligatoria.
- Horas trabajadas mayor a cero.
- Usuario debe estar asignado a la actividad.
- Valor hora histórico debe tomarse del cargo del usuario.
- Costo total debe calcularse en backend.

---

# Transacciones

Deben usarse transacciones en operaciones que modifiquen datos.

Operaciones transaccionales mínimas:

- Crear proyecto.
- Actualizar proyecto.
- Cancelar proyecto.
- Crear actividad.
- Actualizar actividad.
- Cancelar actividad.
- Asignar usuario.
- Retirar asignación.
- Registrar horas.
- Actualizar registro de horas.

---

# Regla sobre cálculos EVM

Los cálculos EVM deben estar centralizados en un servicio especializado.

Nombre sugerido:

```text
IndicadorEvmService
```

No se permite duplicar fórmulas en:

- resources,
- mappers,
- frontend,
- repositories,
- componentes visuales.

Las fórmulas exactas deben estar documentadas en:

```text
/docs/06-evm-calculos.md
```

---

# Integración con tiempo real

Los cambios relevantes deben permitir actualización en tiempo real.

Después de operaciones como:

- crear actividad,
- actualizar actividad,
- registrar horas,
- asignar usuario,
- recalcular indicadores,

el backend debe publicar eventos según lo definido en:

```text
/docs/07-websocket.md
```

---

# Pruebas backend

Deben existir pruebas para:

- servicios de proyectos,
- servicios de actividades,
- servicios de asignaciones,
- servicios de registro de horas,
- servicio de cálculo EVM,
- manejo de errores,
- reglas de seguridad,
- validaciones de negocio.

---

# Casos mínimos de prueba

## EVM

- AC igual a cero.
- PV igual a cero.
- BAC igual a cero.
- Actividad sin registros de horas.
- Proyecto sin actividades.
- Avance real cero.
- Avance planificado cero.

## Reglas de negocio

- Crear actividad que supera presupuesto del proyecto.
- Registrar horas para usuario no asignado.
- Colaborador intentando crear proyecto.
- Asignar usuario inactivo.
- Registrar horas sobre actividad cancelada.

## Errores

- Request con campos obligatorios nulos.
- Error de validación.
- Error de autenticación.
- Error de autorización.
- Error de integridad de datos.
- Recurso individual inexistente.

---

# Calidad de código

Reglas obligatorias:

- No dejar lógica de negocio en resources.
- No exponer entidades JPA.
- No duplicar cálculos.
- No usar nombres genéricos.
- No capturar excepciones sin registrar log.
- No retornar stacktrace al frontend.
- No exponer detalles sensibles.
- Mantener métodos pequeños y descriptivos.
- Mantener clases con una sola responsabilidad.

---

# Criterio de aceptación backend

El backend se considera correctamente implementado cuando:

- Todos los endpoints requieren JWT, excepto login.
- Los endpoints están documentados en Swagger.
- Los GET de colecciones retornan lista vacía cuando no hay datos.
- Los errores retornan estructura estándar.
- Los logs permiten rastrear operaciones relevantes.
- La lógica EVM está centralizada.
- Los indicadores EVM no se persisten.
- Las reglas de negocio están cubiertas por pruebas.
- La base de datos respeta `/docs/02-modelo-base-datos.md`.