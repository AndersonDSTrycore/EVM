# Roadmap de Implementación

## Objetivo del documento

Este documento define el orden recomendado para implementar el sistema.

Copilot debe usar este archivo para trabajar por fases, evitando construir funcionalidades fuera de orden o mezclar responsabilidades.

El objetivo es avanzar de forma controlada:

- Primero la base del proyecto.
- Luego la base de datos.
- Luego la seguridad.
- Luego la lógica de negocio.
- Luego EVM.
- Luego frontend.
- Luego tiempo real.
- Luego pruebas y refinamiento.

---

# Regla principal

Copilot no debe implementar todo el sistema en una sola tarea.

Cada fase debe completarse, validarse y confirmarse antes de continuar con la siguiente.

---

# Fase 0: Preparación del repositorio

## Objetivo

Crear y validar la estructura inicial del proyecto.

## Actividades

- Crear estructura raíz del repositorio.
- Crear carpeta `docs`.
- Crear carpeta `.github/instructions`.
- Crear proyecto backend.
- Crear proyecto frontend.
- Crear `docker-compose.yml` inicial.
- Confirmar que la documentación base existe.

## Resultado esperado

```text
Repositorio organizado y listo para iniciar implementación.
```

---

# Fase 1: Base de datos

## Objetivo

Implementar el modelo de base de datos definido en:

```text
/docs/02-modelo-base-datos.md
```

## Actividades

- Crear changelogs Liquibase.
- Crear tablas.
- Crear relaciones.
- Crear restricciones.
- Crear índices.
- Crear datos semilla.
- Crear usuarios iniciales.
- Validar que no existan indicadores EVM persistidos.

## No hacer todavía

- No crear endpoints.
- No crear lógica EVM.
- No crear frontend.
- No crear WebSockets.
- No crear RabbitMQ.

## Resultado esperado

```text
Base de datos creada con modelo completo, relaciones y semillas iniciales.
```

---

# Fase 2: Backend base

## Objetivo

Crear estructura backend y configuración inicial.

## Actividades

- Configurar Spring Boot.
- Configurar conexión PostgreSQL.
- Configurar Liquibase.
- Crear paquetes base.
- Crear entidades JPA.
- Crear repositories.
- Crear DTOs base.
- Crear mappers.
- Configurar OpenAPI / Swagger.

## Resultado esperado

```text
Backend conectado a base de datos y con entidades principales disponibles.
```

---

# Fase 3: Seguridad y autenticación

## Objetivo

Implementar autenticación JWT.

## Actividades

- Crear endpoint de login.
- Configurar Spring Security.
- Generar JWT.
- Validar usuario activo.
- Proteger endpoints.
- Permitir público solo `/api/auth/login`.
- Crear pruebas de autenticación.

## Resultado esperado

```text
Sistema protegido con JWT y login funcional.
```

---

# Fase 4: Gestión de proyectos

## Objetivo

Implementar CRUD lógico de proyectos.

## Actividades

- Crear endpoints de proyectos.
- Crear servicios de proyectos.
- Implementar creación.
- Implementar edición.
- Implementar consulta.
- Implementar cancelación lógica.
- Validar estados.
- Validar permisos por rol.
- Crear pruebas unitarias e integración.

## Resultado esperado

```text
El líder puede gestionar proyectos y el colaborador no puede realizar acciones administrativas.
```

---

# Fase 5: Gestión de actividades

## Objetivo

Implementar actividades asociadas a proyectos.

## Actividades

- Crear endpoints de actividades.
- Crear servicios de actividades.
- Implementar creación.
- Implementar edición.
- Implementar consulta.
- Implementar cancelación lógica.
- Validar BAC.
- Validar porcentajes.
- Validar fechas.
- Validar que la suma de BAC no supere el presupuesto total del proyecto.
- Crear pruebas.

## Resultado esperado

```text
El líder puede gestionar actividades dentro de proyectos respetando presupuesto y estados.
```

---

# Fase 6: Asignación de usuarios

## Objetivo

Permitir asignar usuarios a actividades.

## Actividades

- Crear endpoints de asignaciones.
- Crear servicios de asignaciones.
- Asignar usuarios activos.
- Evitar asignaciones duplicadas activas.
- Retirar asignaciones de forma lógica.
- Validar actividad activa.
- Crear pruebas.

## Resultado esperado

```text
Las actividades pueden tener usuarios asignados y trazabilidad de asignación.
```

---

# Fase 7: Registro de horas

## Objetivo

Permitir registrar horas trabajadas sobre actividades asignadas.

## Actividades

- Crear endpoints de registros de horas.
- Crear servicios de registros de horas.
- Validar usuario asignado.
- Validar horas mayores a cero.
- Tomar valor hora desde cargo del usuario.
- Guardar valor hora histórico.
- Calcular costo total.
- Permitir registro por colaborador.
- Permitir registro por líder en nombre de colaborador.
- Crear pruebas.

## Resultado esperado

```text
El sistema registra horas y calcula costo real con trazabilidad histórica.
```

---

# Fase 8: Cálculos EVM

## Objetivo

Implementar indicadores EVM.

## Actividades

- Crear `IndicadorEvmService`.
- Calcular indicadores por actividad.
- Calcular indicadores consolidados por proyecto.
- Implementar casos borde.
- Implementar interpretación financiera.
- Implementar interpretación de cronograma.
- Implementar estado general EVM.
- Crear DTOs de indicadores.
- Crear endpoints de indicadores.
- Crear pruebas unitarias completas.

## No hacer

- No persistir indicadores EVM.
- No calcular EVM en frontend.

## Resultado esperado

```text
El backend calcula EVM de forma centralizada y segura.
```

---

# Fase 9: Frontend base

## Objetivo

Crear estructura visual inicial del frontend.

## Actividades

- Configurar Angular 19.
- Configurar PrimeNG 19.
- Configurar Tailwind CSS.
- Crear layout autenticado.
- Crear sidebar.
- Crear topbar.
- Crear rutas.
- Crear pantalla login.
- Crear dashboard inicial.
- Crear interceptor JWT.
- Crear guard de rutas.
- Crear manejo básico de errores.

## Resultado esperado

```text
Frontend autenticado con layout base funcional.
```

---

# Fase 10: Frontend Projects

## Objetivo

Implementar vista de proyectos.

## Actividades

- Crear vista `/projects`.
- Crear tabla de proyectos.
- Crear dialog crear proyecto.
- Crear dialog editar proyecto.
- Crear confirmación cancelar proyecto.
- Consumir endpoints backend.
- Manejar listas vacías.
- Manejar errores estándar.
- Ocultar acciones según rol.

## Resultado esperado

```text
El líder puede gestionar proyectos desde frontend.
```

---

# Fase 11: Frontend actividades

## Objetivo

Implementar vista de actividades del proyecto.

## Actividades

- Crear ruta `/projects/:id/activities`.
- Crear encabezado de proyecto.
- Crear tabla de actividades.
- Crear dialog crear actividad.
- Crear dialog editar actividad.
- Crear confirmación cancelar actividad.
- Crear dialog asignar usuarios.
- Crear dialog registrar horas.
- Crear dialog ver indicadores.
- Manejar acciones por rol.

## Resultado esperado

```text
El líder puede gestionar actividades, asignaciones, horas e indicadores.
```

---

# Fase 12: Visualización EVM

## Objetivo

Mostrar indicadores y gráficos EVM.

## Actividades

- Crear tarjetas de indicadores.
- Crear semáforos visuales.
- Crear gráfico PV vs EV vs AC.
- Crear visualización por proyecto.
- Crear visualización por actividad.
- Usar datos calculados por backend.
- No calcular fórmulas EVM en frontend.

## Resultado esperado

```text
El usuario entiende visualmente si el proyecto o actividad está bien, en riesgo o crítica.
```

---

# Fase 13: Tiempo real

## Objetivo

Implementar actualización en tiempo real.

## Actividades

- Configurar WebSockets.
- Definir canales.
- Publicar eventos desde backend.
- Consumir eventos en frontend.
- Actualizar tablas.
- Actualizar indicadores.
- Actualizar gráficos.
- Evaluar integración RabbitMQ según necesidad.

## Resultado esperado

```text
Los cambios relevantes actualizan la interfaz sin recargar manualmente.
```

---

# Fase 14: Pruebas y estabilización

## Objetivo

Completar pruebas y estabilizar el sistema.

## Actividades

- Ejecutar pruebas unitarias backend.
- Ejecutar pruebas de integración backend.
- Ejecutar pruebas frontend.
- Validar contratos de endpoints.
- Validar seguridad.
- Validar errores estándar.
- Validar casos borde EVM.
- Validar flujos por rol.
- Validar documentación Swagger.

## Resultado esperado

```text
Sistema probado, estable y coherente con la documentación.
```

---

# Fase 15: Refinamiento visual y experiencia de usuario

## Objetivo

Mejorar claridad visual bajo el principio `Don't Make Me Think`.

## Actividades

- Ajustar colores de estados.
- Ajustar textos de ayuda.
- Mejorar estados vacíos.
- Mejorar mensajes de error.
- Mejorar gráficos.
- Mejorar responsive.
- Mejorar feedback de carga.
- Validar acciones visibles por rol.

## Resultado esperado

```text
Sistema claro, entendible y fácil de usar.
```

---

# Orden recomendado resumido

```text
1. Repositorio y documentación
2. Base de datos
3. Backend base
4. Seguridad JWT
5. Proyectos
6. Actividades
7. Asignaciones
8. Registros de horas
9. Cálculos EVM
10. Frontend base
11. Projects frontend
12. Activities frontend
13. Visualización EVM
14. Tiempo real
15. Pruebas y refinamiento
```

---

# Reglas para Copilot

Copilot debe:

- Trabajar por fases.
- No adelantarse a fases posteriores.
- Consultar la documentación correspondiente antes de implementar.
- Generar primero un plan antes de escribir código.
- No inventar entidades, campos, rutas ni reglas.
- No modificar decisiones documentadas sin instrucción explícita.
- No implementar frontend antes de tener contratos backend claros.
- No implementar EVM en frontend.
- No persistir indicadores EVM.

---

# Criterio general de avance

Una fase se considera terminada cuando:

- Compila correctamente.
- Respeta documentación.
- Tiene pruebas cuando aplica.
- No rompe fases anteriores.
- No introduce lógica fuera de alcance.
- Puede ser explicada y validada funcionalmente.


# Creación de base de datos local

La base de datos local debe ser creada por Docker Compose, no por DBeaver ni por el backend.

Docker Compose debe crear:

- contenedor PostgreSQL,
- base de datos `evm_db`,
- usuario `admin`,
- contraseña `admin`,
- volumen persistente `evm_postgres_data`.

El backend usará Liquibase únicamente para crear estructura interna:

- tablas,
- relaciones,
- restricciones,
- índices,
- datos semilla.

DBeaver se usará solo para conectarse y visualizar la base de datos.