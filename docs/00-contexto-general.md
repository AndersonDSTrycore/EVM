# Contexto General del Proyecto

## Objetivo del documento

Este documento presenta el contexto general del sistema y funciona como punto de entrada para comprender la solución.

Debe ser leído antes de consultar documentos más específicos.

Este archivo no reemplaza las especificaciones detalladas de backend, frontend, base de datos, reglas de negocio o cálculos EVM.

---

# Nombre del proyecto

```text
Sistema de Gestión de Proyectos con Valor Ganado EVM
```

---

# Propósito del sistema

Construir una aplicación interna que permita gestionar proyectos, actividades, asignaciones de usuarios, registros de horas y análisis de desempeño mediante indicadores EVM.

El sistema debe ayudar a los líderes de proyecto a entender, en tiempo real, si un proyecto va bien o mal en términos de:

- Presupuesto.
- Cronograma.
- Avance real.
- Avance planificado.
- Consumo de recursos.
- Riesgo operativo.

---

# Problema que se busca resolver

Conocer únicamente cuánto dinero se ha gastado o cuánto trabajo se ha completado no es suficiente para evaluar la salud real de un proyecto.

Lo importante es analizar la relación entre:

- Avance planificado.
- Avance real.
- Costo real.
- Presupuesto asignado.

Ejemplo:

```text
Un proyecto puede haber consumido el 60% del presupuesto, pero solo haber completado el 40% del trabajo.
```

Ese escenario representa una señal de alerta.

La metodología EVM permite cuantificar este tipo de desviaciones mediante indicadores calculados automáticamente.

---

# Metodología base

La metodología de análisis será:

```text
Earned Value Management — EVM
```

También conocida como:

```text
Valor Ganado
```

EVM permite integrar:

- Alcance.
- Tiempo.
- Costo.

El usuario no debe calcular estos indicadores manualmente.

El sistema debe calcularlos automáticamente y presentarlos de forma clara.

---

# Idea central del sistema

El flujo principal del sistema es:

```text
Proyecto
  → Actividades
    → Asignación de usuarios
      → Registro de horas
        → Cálculo de costo real
          → Cálculo de indicadores EVM
            → Dashboard visual
```

---

# Principio de experiencia de usuario

El sistema debe seguir el principio:

```text
Don't Make Me Think
```

Esto significa que el usuario no debe esforzarse para interpretar la información.

La aplicación debe mostrar:

- Estados claros.
- Semáforos visuales.
- Indicadores resumidos.
- Alertas.
- Gráficos comparativos.
- Mensajes entendibles.

El objetivo es que el líder pueda identificar rápidamente:

- Si el proyecto está saludable.
- Si está atrasado.
- Si está sobre presupuesto.
- Qué actividad genera riesgo.
- Qué acciones requieren atención.

---

# Usuarios principales

## Líder

Usuario encargado de gestionar el proyecto.

Puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios a actividades.
- Registrar horas propias si está asignado.
- Registrar horas en nombre de colaboradores.
- Consultar indicadores por actividad.
- Consultar indicadores consolidados por proyecto.

---

## Colaborador

Usuario asignado a actividades específicas.

Puede:

- Consultar sus actividades asignadas.
- Registrar horas sobre sus actividades.
- Consultar indicadores de sus actividades.

No puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios.

---

# Alcance funcional inicial

El sistema debe cubrir inicialmente:

- Login con JWT.
- Dashboard inicial.
- Gestión de proyectos.
- Gestión de actividades.
- Asignación de usuarios a actividades.
- Registro de horas.
- Cálculo de costo real.
- Cálculo de indicadores EVM.
- Dashboard de indicadores.
- Visualización de gráficos.
- Seguridad por rol.
- Manejo de errores controlado.
- Trazabilidad mediante logs.
- Actualización en tiempo real.

---

# Alcance técnico inicial

## Backend

El backend se implementará con:

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

## Frontend

El frontend se implementará con:

- Angular 19.
- PrimeNG 19.
- Tailwind CSS.
- TypeScript.

---

## Base de datos

La base de datos será:

```text
PostgreSQL
```

Las tablas deben:

- Estar en español.
- Estar en plural.
- Iniciar con `tbl_`.
- Usar `snake_case`.

---

# Decisiones principales del proyecto

## Decisión 1: el costo real nace del registro de horas

El costo real no será digitado manualmente.

Se calculará desde:

```text
horas_trabajadas × valor_hora_historico
```

---

## Decisión 2: conservar valor hora histórico

Cuando se registre una hora trabajada, se guardará el valor hora vigente del usuario trabajado.

Esto evita que cambios futuros en el cargo alteren los costos históricos.

---

## Decisión 3: los indicadores EVM no se persisten

Los indicadores EVM son valores derivados.

No se deben guardar en base de datos:

- PV.
- EV.
- AC calculado.
- CV.
- SV.
- CPI.
- SPI.
- EAC.
- VAC.

Deben calcularse dinámicamente.

---

## Decisión 4: los estados operativos sí se persisten

Los estados administrativos del sistema se guardan en tablas catálogo.

Ejemplos:

- Estado de proyecto.
- Estado de actividad.
- Estado de usuario.
- Estado de asignación.

---

## Decisión 5: los estados EVM no se persisten

Estados como:

- Saludable.
- En riesgo.
- Sobre presupuesto.
- Retrasado.
- Adelantado.

Deben calcularse dinámicamente y retornarse en DTOs de respuesta.

---

# Mapa de documentación

La documentación principal se encuentra en:

```text
/docs
```

## Documentos

| Documento | Propósito |
|---|---|
| `/docs/00-contexto-general.md` | Contexto general y mapa del proyecto |
| `/docs/01-flujo-funcional.md` | Flujo funcional, navegación y experiencia de usuario |
| `/docs/02-modelo-base-datos.md` | Modelo de datos, tablas, relaciones, MER y semillas |
| `/docs/03-backend-especificacion.md` | Arquitectura backend, endpoints, seguridad, errores y logs |
| `/docs/04-frontend-especificacion.md` | Layout, componentes, rutas, vistas y comportamiento visual |
| `/docs/05-reglas-negocio.md` | Reglas funcionales, permisos y restricciones |
| `/docs/06-evm-calculos.md` | Fórmulas EVM, casos borde e interpretación |
| `/docs/07-websocket.md` | WebSockets, RabbitMQ y eventos de actualización |
| `/docs/08-roadmap-implementacion.md` | Fases recomendadas de construcción |

---

# Uso recomendado por Copilot

Copilot debe usar este documento como entrada general.

Para implementar funcionalidades específicas debe consultar el documento correspondiente.

## Para base de datos

Consultar:

```text
/docs/02-modelo-base-datos.md
```

---

## Para backend

Consultar:

```text
/docs/03-backend-especificacion.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
```

---

## Para frontend

Consultar:

```text
/docs/01-flujo-funcional.md
/docs/04-frontend-especificacion.md
```

---

## Para tiempo real

Consultar:

```text
/docs/07-websocket.md
```

---

# Regla de no invención

Copilot no debe inventar:

- Tablas.
- Campos.
- Endpoints.
- Roles.
- Estados.
- Rutas.
- Componentes.
- Cálculos.
- Reglas de negocio.
- Flujos visuales.

Si algo no está definido en la documentación, debe preguntar antes de implementarlo.

---

# Resumen ejecutivo

El sistema debe permitir:

```text
Registrar trabajo realizado y conocer automáticamente si el proyecto va bien o mal.
```

La plataforma no debe sentirse como una calculadora financiera ni como un ERP complejo.

Debe sentirse como una herramienta clara para seguimiento de proyectos, donde el usuario entiende rápidamente:

- Qué está pasando.
- Qué está en riesgo.
- Qué está consumiendo presupuesto.
- Qué actividad requiere atención.