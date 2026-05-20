---
applyTo: "EVM-backend/**,EVM-frontend/**"
---

# Instrucciones de Pruebas

Este archivo define las reglas obligatorias para pruebas automatizadas del proyecto.

Aplica a:

- Backend.
- Frontend.
- Servicios de negocio.
- Endpoints REST.
- Componentes principales.
- Flujos críticos.

---

# Fuente de verdad

Antes de crear o modificar pruebas, Copilot debe revisar:

```text
/docs/03-backend-especificacion.md
/docs/04-frontend-especificacion.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
```

Las pruebas deben validar el comportamiento documentado, no comportamientos inventados.

---

# Regla principal

Toda lógica crítica debe estar cubierta por pruebas.

La prioridad de pruebas es:

1. Lógica EVM.
2. Reglas de negocio.
3. Contratos de endpoints.
4. Seguridad y permisos.
5. Manejo de errores.
6. Componentes y flujos principales del frontend.

---

# Pruebas unitarias backend

La lógica de negocio debe probarse principalmente en servicios.

No enfocar las pruebas unitarias en controladores si la lógica está correctamente ubicada en servicios.

Las pruebas unitarias deben cubrir:

- Servicios de cálculo EVM.
- Servicios de proyectos.
- Servicios de actividades.
- Servicios de asignaciones.
- Servicios de registros de horas.
- Validaciones de negocio.
- Manejo de casos borde.

---

# Cobertura obligatoria de cálculo EVM

Toda la lógica de cálculo EVM debe estar cubierta con pruebas unitarias.

Debe probarse como mínimo:

- Cálculo de PV.
- Cálculo de EV.
- Cálculo de AC.
- Cálculo de CV.
- Cálculo de SV.
- Cálculo de CPI.
- Cálculo de SPI.
- Cálculo de EAC.
- Cálculo de VAC.
- Interpretación financiera.
- Interpretación de cronograma.
- Estado general EVM.

---

# Casos borde EVM obligatorios

Las pruebas unitarias de EVM deben cubrir como mínimo:

## AC igual a cero

Validar qué ocurre cuando:

```text
AC = 0
```

Resultado esperado:

- No debe lanzar error de división por cero.
- CPI debe retornar valor seguro según `/docs/06-evm-calculos.md`.
- EAC y VAC deben manejarse de forma segura si CPI no es calculable.

---

## PV igual a cero

Validar qué ocurre cuando:

```text
PV = 0
```

Resultado esperado:

- No debe lanzar error de división por cero.
- SPI debe retornar valor seguro según `/docs/06-evm-calculos.md`.

---

## No hay actividades

Validar qué ocurre cuando un proyecto no tiene actividades.

Resultado esperado:

- No debe lanzar error.
- Debe retornar consolidado seguro.
- Los valores deben corresponder a lo definido en `/docs/06-evm-calculos.md`.

---

## Actividad sin registros de horas

Validar qué ocurre cuando una actividad no tiene registros de horas.

Resultado esperado:

```text
AC = 0
```

Sin error de cálculo.

---

## Avance real cero

Validar qué ocurre cuando:

```text
porcentaje_avance_real = 0
```

Resultado esperado:

```text
EV = 0
```

Los demás indicadores deben calcularse o manejarse según casos borde.

---

## Avance planificado cero

Validar qué ocurre cuando:

```text
porcentaje_avance_planificado = 0
```

Resultado esperado:

```text
PV = 0
SPI = valor seguro según documento EVM
```

---

# Pruebas de reglas de negocio

Debe existir cobertura para reglas críticas como:

- Crear proyecto con datos válidos.
- Rechazar proyecto con fecha fin menor a fecha inicio.
- Rechazar actividad que supera el presupuesto total del proyecto.
- Crear actividad con datos válidos.
- Rechazar porcentajes fuera del rango 0 a 100.
- Asignar usuario activo a actividad activa.
- Rechazar asignación duplicada activa.
- Rechazar asignación de usuario inactivo.
- Registrar horas para usuario asignado.
- Rechazar registro de horas para usuario no asignado.
- Registrar horas por líder en nombre de colaborador.
- Conservar valor hora histórico.
- Recalcular costo total al actualizar horas.
- Rechazar operación de colaborador sin permisos.

---

# Pruebas de integración backend

Cada endpoint REST debe tener al menos un test de integración que valide el contrato de respuesta.

El test debe validar como mínimo:

- Código HTTP esperado.
- Estructura de respuesta.
- Campos principales del DTO.
- Seguridad JWT cuando aplique.
- Manejo de errores documentado cuando aplique.

---

# Endpoints mínimos con prueba de integración

Deben probarse, como mínimo, los endpoints definidos en `/docs/03-backend-especificacion.md`.

## Autenticación

```text
POST /api/auth/login
```

Validar:

- Login exitoso.
- Login fallido.

---

## Proyectos

```text
GET /api/proyectos
GET /api/proyectos/{id}
POST /api/proyectos
PUT /api/proyectos/{id}
DELETE /api/proyectos/{id}
```

Validar:

- Contrato de respuesta.
- JWT requerido.
- GET colección vacía retorna `[]`.
- GET recurso inexistente retorna 404.
- DELETE realiza cancelación lógica.

---

## Actividades

```text
GET /api/proyectos/{idProyecto}/actividades
GET /api/actividades/{id}
POST /api/proyectos/{idProyecto}/actividades
PUT /api/actividades/{id}
DELETE /api/actividades/{id}
```

Validar:

- Contrato de respuesta.
- Validación de presupuesto.
- GET colección vacía retorna `[]`.
- DELETE realiza cancelación lógica.

---

## Asignaciones

```text
GET /api/actividades/{idActividad}/asignaciones
POST /api/actividades/{idActividad}/asignaciones
DELETE /api/asignaciones/{id}
```

Validar:

- Contrato de respuesta.
- Usuario asignado correctamente.
- Rechazo de duplicado.
- Retiro lógico de asignación.

---

## Registros de horas

```text
GET /api/actividades/{idActividad}/registros-horas
POST /api/actividades/{idActividad}/registros-horas
PUT /api/registros-horas/{id}
```

Validar:

- Contrato de respuesta.
- Cálculo de `valor_hora_historico`.
- Cálculo de `costo_total`.
- Rechazo de usuario no asignado.
- GET colección vacía retorna `[]`.

---

## Indicadores EVM

```text
GET /api/proyectos/{idProyecto}/indicadores
GET /api/actividades/{idActividad}/indicadores
```

Validar:

- Contrato de respuesta.
- Indicadores calculados.
- Interpretaciones retornadas.
- No persistencia de indicadores.
- Casos borde.

---

# Pruebas de seguridad

Debe existir cobertura para:

- Petición sin JWT.
- Petición con JWT inválido.
- Petición con usuario sin permisos.
- Colaborador intentando crear proyecto.
- Colaborador intentando asignar usuarios.
- Colaborador intentando consultar actividad no asignada.
- Usuario inactivo intentando operar.

Resultados esperados:

```text
401 Unauthorized
403 Forbidden
```

según corresponda.

---

# Pruebas de errores

Debe existir cobertura para la estructura estándar de error definida en:

```text
/docs/03-backend-especificacion.md
```

La respuesta de error debe contener:

- titulo.
- mensaje.
- detalle.
- estado.
- codigo.
- ruta.
- metodo.
- parametros_recibidos.
- fecha_hora.

Casos mínimos:

- Request inválido.
- Recurso individual no encontrado.
- Conflicto de negocio.
- Error de autorización.
- Error de autenticación.

---

# Pruebas frontend

Las pruebas frontend deben validar comportamiento visual y de interacción, no fórmulas EVM.

El frontend no calcula indicadores EVM.

Debe probarse como mínimo:

- Renderizado de layout autenticado.
- Sidebar.
- Topbar.
- Login.
- Protección de rutas.
- Interceptor JWT.
- Manejo de errores estándar.
- Estado vacío para listas.
- Apertura de dialogs.
- Submit bloqueado en formularios inválidos.
- Renderizado de indicadores recibidos desde backend.
- Ocultamiento de acciones según rol.

---

# Pruebas de contratos frontend

Los servicios frontend deben tener pruebas con mocks para validar:

- Consumo de proyectos.
- Consumo de actividades.
- Consumo de asignaciones.
- Consumo de registros de horas.
- Consumo de indicadores EVM.
- Manejo de listas vacías.
- Manejo de errores estándar.

---

# Datos de prueba

Los datos de prueba deben ser coherentes con:

```text
/docs/02-modelo-base-datos.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
```

No usar entidades, campos, roles o estados inventados.

---

# Regla de no duplicación

No duplicar lógica de cálculo EVM en pruebas frontend.

Las pruebas frontend pueden verificar que se renderizan valores como:

```text
cpi
spi
estado_general
```

pero no deben recalcularlos.

---

# Criterio de aceptación de pruebas

Una implementación se considera correctamente probada cuando:

- Toda lógica EVM tiene pruebas unitarias.
- Los casos borde EVM están cubiertos.
- La capa de negocio tiene cobertura suficiente.
- Cada endpoint tiene al menos un test de integración.
- Los contratos de respuesta se validan.
- Las reglas de seguridad están probadas.
- Los errores estándar están probados.
- El frontend prueba interacción, renderizado y consumo de servicios.
- No se prueban comportamientos no documentados.