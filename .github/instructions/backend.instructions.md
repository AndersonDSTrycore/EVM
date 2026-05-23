---
applyTo: "EVM-backend/**"
---

# Instrucciones Backend

Este archivo define las reglas obligatorias para cualquier cambio dentro del backend.

Antes de generar o modificar código backend, Copilot debe revisar obligatoriamente:

1. `/docs/00-contexto-general.md`
2. `/docs/02-modelo-base-datos.md`
3. `/docs/03-backend-especificacion.md`
4. `/docs/05-reglas-negocio.md`
5. `/docs/06-evm-calculos.md`
6. `/docs/07-websocket.md`

Si una entidad, endpoint, campo, DTO, regla de negocio o cálculo no está documentado en esos archivos, Copilot debe preguntar antes de implementarlo.

---

# Stack Backend

El backend debe implementarse con:

- Java
- Spring Boot
- Spring Security
- JWT Bearer Token
- Spring Data JPA / Hibernate
- PostgreSQL
- OpenAPI / Swagger
- Docker Compose

---

# Arquitectura Backend

El backend debe seguir esta estructura base:

- resource
- service
- service_impl
- repository
- domain
- dto
- mapper
- config
- security
- test

La lógica debe respetar la separación de responsabilidades.

---

# Reglas obligatorias de arquitectura

- Los controladores REST no deben contener lógica de negocio.
- Toda lógica de negocio debe vivir en servicios.
- La lógica EVM debe estar centralizada en un servicio especializado.
- No exponer entidades JPA directamente en las respuestas REST.
- Usar DTOs para request y response.
- Usar mappers para transformar entidades a DTOs y DTOs a entidades.
- Usar repositories únicamente para acceso a datos.
- No consultar la base de datos directamente desde controladores.
- No duplicar lógica EVM en diferentes servicios.
- No crear clases utilitarias genéricas si la lógica pertenece a un servicio de dominio.

---

# Reglas sobre EVM

Los indicadores EVM derivados NO deben persistirse en base de datos:

- PV
- EV
- AC calculado
- CV
- SV
- CPI
- SPI
- EAC
- VAC

Estos valores deben calcularse dinámicamente al consultar proyectos, actividades o indicadores.

La definición de fórmulas, casos borde e interpretación debe tomarse exclusivamente de:

`/docs/06-evm-calculos.md`

---

# Reglas de base de datos

El backend debe respetar exactamente el modelo definido en:

`/docs/02-modelo-base-datos.md`

No se permite:

- crear tablas no documentadas,
- cambiar nombres de tablas,
- cambiar nombres de campos,
- cambiar tipos de datos,
- crear estados no documentados,
- almacenar datos derivados no permitidos.

Las tablas deben:

- estar en español,
- iniciar con `tbl_`,
- estar en plural,
- usar snake_case.

Los campos deben:

- estar en español,
- usar snake_case,
- ser descriptivos.

Las llaves primarias deben llamarse:

`id`

Las llaves foráneas deben iniciar con:

`id_`

---

# Reglas de entidades JPA

Las entidades deben representar fielmente las tablas documentadas.

No usar nombres inventados para entidades, relaciones o columnas.

Cada entidad debe:

- mapear explícitamente su tabla con `@Table`,
- mapear columnas cuando el nombre físico lo requiera,
- declarar relaciones JPA solo si están definidas en el modelo,
- evitar lógica de negocio compleja dentro de la entidad.

---

# Reglas de DTOs

Usar DTOs separados para:

- creación,
- actualización,
- respuesta,
- consulta de indicadores cuando aplique.

Ejemplo esperado:

- ProyectoRequestDTO
- ProyectoResponseDTO
- ActividadRequestDTO
- ActividadResponseDTO
- IndicadorActividadDTO
- IndicadorProyectoDTO

No retornar entidades directamente desde los resources.

---

# Reglas de validación

Usar Bean Validation para validar request DTOs.

Validaciones mínimas:

- campos obligatorios con `@NotNull` o `@NotBlank`,
- valores monetarios mayores o iguales a cero,
- porcentajes entre 0 y 100,
- horas trabajadas mayores a cero,
- fechas coherentes.

Las reglas de negocio complejas deben validarse en servicios, no solo con anotaciones.

---

# Reglas de endpoints

Los endpoints deben estar definidos en:

`/docs/03-backend-especificacion.md`

No se deben crear rutas nuevas sin documentación previa.

Todos los endpoints deben:

- usar DTOs,
- retornar códigos HTTP adecuados,
- manejar errores de validación,
- estar documentados con OpenAPI / Swagger.

---

# Reglas de seguridad

El backend debe usar JWT Bearer Token.

Las operaciones deben respetar roles/permisos:

- Líder
- Usuario colaborador

Regla general:

- El líder puede gestionar proyectos, actividades, asignaciones y registros.
- El colaborador solo puede consultar y registrar horas sobre actividades asignadas.

Las reglas exactas deben tomarse de:

`/docs/05-reglas-negocio.md`

---

# Reglas de tiempo real

La integración de WebSockets y RabbitMQ debe seguir lo definido en:

`/docs/07-websocket.md`

No usar RabbitMQ para lógica que pueda resolverse de forma directa y síncrona, salvo que el documento indique lo contrario.

Los eventos deben representar cambios relevantes del dominio, por ejemplo:

- proyecto actualizado,
- actividad actualizada,
- horas registradas,
- indicadores recalculados,
- alerta presupuestal generada.

---

# Reglas de pruebas

Crear pruebas unitarias para:

- servicios de cálculo EVM,
- reglas de negocio,
- validaciones de presupuesto,
- registro de horas,
- consolidado de indicadores por proyecto.

Casos mínimos:

- división por cero,
- actividad sin registros de horas,
- proyecto sin actividades,
- avance real cero,
- avance planificado cero,
- presupuesto de actividades superior al presupuesto del proyecto,
- registro de horas con valor hora histórico.

---

# Reglas de calidad

- No dejar lógica duplicada.
- No usar nombres genéricos como `Data`, `Info`, `Manager`, `Helper` sin justificación.
- No mezclar lógica de seguridad con lógica de negocio.
- No mezclar lógica de cálculo con lógica de persistencia.
- Mantener métodos pequeños y descriptivos.
- Mantener clases con una sola responsabilidad.