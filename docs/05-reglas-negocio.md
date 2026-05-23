# Reglas de Negocio

## Objetivo del documento

Este documento define las reglas funcionales obligatorias del sistema de gestión de proyectos, actividades, asignaciones, registro de horas y análisis EVM.

Copilot debe usar este documento como fuente principal para implementar:

- Validaciones de negocio.
- Permisos por rol.
- Restricciones funcionales.
- Comportamientos esperados.
- Mensajes de error funcional.
- Flujos permitidos y no permitidos.

No se deben implementar reglas de negocio que no estén definidas en este documento.

---

# Documentos relacionados

Antes de implementar reglas de negocio, Copilot debe revisar:

```text
/docs/00-contexto-general.md
/docs/01-flujo-funcional.md
/docs/02-modelo-base-datos.md
/docs/03-backend-especificacion.md
/docs/06-evm-calculos.md
/docs/07-websocket.md
```

Si existe conflicto entre documentos, debe prevalecer:

1. `/docs/05-reglas-negocio.md` para reglas funcionales.
2. `/docs/02-modelo-base-datos.md` para persistencia.
3. `/docs/06-evm-calculos.md` para cálculos EVM.
4. `/docs/03-backend-especificacion.md` para arquitectura backend.

---

# Principios funcionales del sistema

El sistema debe seguir estos principios:

- El usuario no debe calcular indicadores manualmente.
- El costo real se calcula desde registros de horas.
- El valor hora histórico debe conservarse.
- Los indicadores EVM son derivados y no se persisten.
- Los estados operativos se almacenan.
- Los estados EVM se calculan dinámicamente.
- El líder gestiona.
- El colaborador registra y consulta únicamente lo asignado.
- Ninguna operación protegida puede ejecutarse sin JWT.

---

# Roles funcionales

El sistema tendrá inicialmente dos roles funcionales:

```text
LIDER
COLABORADOR
```

Estos roles están definidos en:

```text
tbl_roles_sistema
```

---

# Regla RN-001: Autenticación obligatoria

## Descripción

Todo consumo de API requiere autenticación JWT, excepto el endpoint de login.

## Endpoint público permitido

```text
POST /api/auth/login
```

## Regla

Si una petición no incluye token JWT válido, el backend debe rechazarla.

## Resultado esperado

```text
401 Unauthorized
```

---

# Regla RN-002: Autorización por rol

## Descripción

El sistema debe validar los permisos según el rol funcional del usuario autenticado.

## Permisos del rol LIDER

El líder puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Consultar proyectos.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios a actividades.
- Retirar usuarios de actividades.
- Registrar horas propias si está asignado.
- Registrar horas en nombre de colaboradores asignados.
- Consultar indicadores de proyecto.
- Consultar indicadores de actividad.
- Consultar dashboard general.

## Permisos del rol COLABORADOR

El colaborador puede:

- Consultar únicamente actividades asignadas.
- Registrar horas únicamente en actividades asignadas.
- Consultar indicadores de sus actividades asignadas.
- Consultar sus registros de horas.

El colaborador no puede:

- Crear proyectos.
- Editar proyectos.
- Cancelar proyectos.
- Crear actividades.
- Editar actividades.
- Cancelar actividades.
- Asignar usuarios.
- Retirar usuarios.
- Consultar proyectos ajenos de forma global.

## Resultado esperado si no tiene permisos

```text
403 Forbidden
```

---

# Regla RN-003: Creación de proyectos

## Descripción

Solo un usuario con rol `LIDER` puede crear proyectos.

## Datos obligatorios

- Nombre.
- Fecha inicio.
- Fecha fin.
- Presupuesto total.
- Estado inicial.

## Estado inicial esperado

Todo proyecto creado debe iniciar con estado:

```text
ACTIVO
```

## Validaciones

- El nombre no puede estar vacío.
- La fecha fin debe ser mayor o igual a la fecha inicio.
- El presupuesto total debe ser mayor o igual a cero.

## Resultado esperado

```text
201 Created
```

---

# Regla RN-004: Edición de proyectos

## Descripción

Solo un usuario con rol `LIDER` puede editar proyectos.

## Validaciones

- El proyecto debe existir.
- El proyecto no debe estar cancelado.
- El proyecto no debe estar finalizado si se intentan modificar datos operativos.
- La fecha fin debe ser mayor o igual a la fecha inicio.
- El presupuesto total debe ser mayor o igual a cero.

## Restricción presupuestal

No se debe permitir reducir el presupuesto total del proyecto por debajo de la suma de los BAC de sus actividades activas o no canceladas.

## Resultado esperado si rompe la regla

```text
409 Conflict
```

---

# Regla RN-005: Cancelación de proyectos

## Descripción

La eliminación de proyectos será lógica, no física.

## Regla

Cuando se invoque eliminación de proyecto:

```text
DELETE /api/proyectos/{id}
```

El sistema debe cambiar el estado operativo del proyecto a:

```text
CANCELADO
```

## Restricciones

- No eliminar físicamente el registro.
- No eliminar actividades asociadas.
- No eliminar registros de horas.
- No permitir nuevas actividades sobre un proyecto cancelado.
- No permitir nuevos registros de horas sobre actividades de un proyecto cancelado.

---

# Regla RN-006: Consulta de proyectos

## Descripción

El líder puede consultar proyectos de forma global.

El colaborador no debe ver el listado global de todos los proyectos.

## Regla para LIDER

Puede consultar todos los proyectos permitidos por el sistema.

## Regla para COLABORADOR

Debe consultar sus actividades asignadas y desde ellas identificar el proyecto relacionado.

## Consulta sin resultados

Si una consulta de colección no encuentra datos, debe retornar:

```json
[]
```

No debe retornar 404.

---

# Regla RN-007: Creación de actividades

## Descripción

Solo un usuario con rol `LIDER` puede crear actividades dentro de un proyecto.

## Estado inicial esperado

Toda actividad creada debe iniciar con estado:

```text
PENDIENTE
```

## Datos obligatorios

- Proyecto.
- Nombre.
- BAC.
- Porcentaje avance planificado.
- Porcentaje avance real.
- Fecha inicio.
- Fecha fin.

## Validaciones

- El proyecto debe existir.
- El proyecto debe estar activo.
- El nombre no puede estar vacío.
- El BAC debe ser mayor o igual a cero.
- Los porcentajes deben estar entre 0 y 100.
- La fecha fin debe ser mayor o igual a la fecha inicio.
- La actividad debe pertenecer al proyecto indicado.

---

# Regla RN-008: Control presupuestal de actividades

## Descripción

La suma de los BAC de las actividades de un proyecto no debe superar el presupuesto total del proyecto.

## Fórmula

```text
SUM(bac de actividades no canceladas) <= presupuesto_total del proyecto
```

## Aplica en

- Creación de actividad.
- Edición de actividad.
- Reactivación futura de actividad si aplica.

## Resultado esperado si se supera el presupuesto

```text
409 Conflict
```

## Mensaje esperado

```text
La suma de los presupuestos de las actividades supera el presupuesto total del proyecto.
```

---

# Regla RN-009: Edición de actividades

## Descripción

Solo un usuario con rol `LIDER` puede editar actividades.

## Validaciones

- La actividad debe existir.
- La actividad no debe estar cancelada.
- La actividad no debe estar finalizada si se intentan modificar datos operativos.
- El BAC debe ser mayor o igual a cero.
- Los porcentajes deben estar entre 0 y 100.
- La fecha fin debe ser mayor o igual a la fecha inicio.
- La suma de BAC del proyecto debe seguir siendo válida.

---

# Regla RN-010: Cancelación de actividades

## Descripción

La eliminación de actividades será lógica, no física.

## Regla

Cuando se invoque eliminación de actividad:

```text
DELETE /api/actividades/{id}
```

El sistema debe cambiar el estado operativo de la actividad a:

```text
CANCELADA
```

## Restricciones

- No eliminar físicamente la actividad.
- No eliminar asignaciones históricas.
- No eliminar registros de horas.
- No permitir nuevos registros de horas sobre una actividad cancelada.

---

# Regla RN-011: Asignación de usuarios a actividades

## Descripción

Solo un usuario con rol `LIDER` puede asignar usuarios a actividades.

## Validaciones

- La actividad debe existir.
- El usuario debe existir.
- El usuario debe estar activo.
- La actividad no debe estar finalizada.
- La actividad no debe estar cancelada.
- No debe existir una asignación activa duplicada para el mismo usuario y actividad.

## Estado inicial esperado

Toda asignación creada debe iniciar con estado:

```text
ACTIVA
```

## Resultado esperado si ya existe asignación activa

```text
409 Conflict
```

---

# Regla RN-012: Retiro de usuarios de actividades

## Descripción

Solo un usuario con rol `LIDER` puede retirar usuarios de actividades.

## Regla

Retirar un usuario no elimina la asignación físicamente.

Debe cambiar el estado de la asignación a:

```text
RETIRADA
```

Y registrar:

```text
fecha_retiro
```

## Restricciones

- No eliminar registros de horas históricos.
- No permitir nuevos registros de horas para asignaciones retiradas.
- Mantener trazabilidad de asignaciones pasadas.

---

# Regla RN-013: Registro de horas por colaborador

## Descripción

Un colaborador puede registrar horas únicamente sobre actividades donde tenga asignación activa.

## Validaciones

- La actividad debe existir.
- El usuario autenticado debe estar asignado a la actividad.
- La asignación debe estar activa.
- La actividad no debe estar cancelada.
- La actividad no debe estar finalizada.
- El proyecto de la actividad debe estar activo.
- Las horas trabajadas deben ser mayores a cero.
- La fecha de trabajo es obligatoria.

## Usuario trabajado

Cuando un colaborador registra sus propias horas:

```text
id_usuario = usuario autenticado
id_usuario_registra = usuario autenticado
```

---

# Regla RN-014: Registro de horas por líder en nombre de colaborador

## Descripción

Un líder puede registrar horas en nombre de un colaborador asignado a una actividad.

## Validaciones

- El líder debe estar autenticado.
- El usuario colaborador debe existir.
- El usuario colaborador debe estar activo.
- El usuario colaborador debe estar asignado activamente a la actividad.
- La actividad no debe estar cancelada.
- La actividad no debe estar finalizada.
- El proyecto debe estar activo.
- Las horas trabajadas deben ser mayores a cero.
- La fecha de trabajo es obligatoria.

## Usuario trabajado y usuario que registra

Cuando un líder registra horas por un colaborador:

```text
id_usuario = usuario colaborador
id_usuario_registra = usuario líder autenticado
```

---

# Regla RN-015: Valor hora histórico

## Descripción

El valor hora utilizado en un registro de horas debe ser el valor hora vigente del cargo del usuario trabajado en el momento del registro.

## Regla

Al crear un registro de horas:

```text
valor_hora_historico = tbl_cargos.valor_hora del usuario trabajado
```

Este valor se guarda en:

```text
tbl_registros_horas.valor_hora_historico
```

## Objetivo

Evitar que cambios futuros en el valor hora del cargo alteren registros históricos.

---

# Regla RN-016: Cálculo de costo total del registro de horas

## Descripción

El costo total del registro de horas debe ser calculado por el backend.

## Fórmula

```text
costo_total = horas_trabajadas * valor_hora_historico
```

## Restricción

El frontend no debe enviar `costo_total` como valor definitivo.

Si lo envía, el backend debe ignorarlo y recalcularlo.

---

# Regla RN-017: Consulta de actividades por colaborador

## Descripción

El colaborador solo debe visualizar actividades asignadas.

## Regla

Cuando un usuario con rol `COLABORADOR` consulte actividades, el backend debe filtrar por:

```text
id_usuario autenticado
asignación activa
```

## No permitido

El colaborador no debe recibir actividades de otros usuarios.

---

# Regla RN-018: Consulta de indicadores

## Descripción

Los indicadores EVM deben calcularse dinámicamente.

## Indicadores por actividad

Se calculan con los datos de la actividad y sus registros de horas.

## Indicadores por proyecto

Se calculan consolidando todas las actividades del proyecto.

## Regla obligatoria

No persistir indicadores EVM.

---

# Regla RN-019: Interpretación de CPI

## Descripción

El CPI indica eficiencia de costo.

## Regla

```text
CPI > 1 = Bajo presupuesto / eficiente en costos
CPI = 1 = En presupuesto
CPI < 1 = Sobre presupuesto / ineficiente en costos
```

---

# Regla RN-020: Interpretación de SPI

## Descripción

El SPI indica eficiencia de cronograma.

## Regla

```text
SPI > 1 = Adelantado
SPI = 1 = En cronograma
SPI < 1 = Retrasado
```

---

# Regla RN-021: Consulta de colecciones vacías

## Descripción

Cuando una consulta GET de colección no encuentre datos, no debe responder 404.

## Regla

Debe responder:

```text
200 OK
```

Con:

```json
[]
```

O, si el frontend requiere mensaje contextual:

```json
{
  "mensaje": "No se encontraron registros.",
  "datos": []
}
```

---

# Regla RN-022: Consulta de recurso individual inexistente

## Descripción

Cuando se consulte un recurso individual por ID y no exista, sí debe responder 404.

## Ejemplo

```text
GET /api/proyectos/999
```

## Resultado esperado

```text
404 Not Found
```

Con estructura estándar de error.

---

# Regla RN-023: Manejo de errores funcionales

## Descripción

Todo error funcional debe retornar la estructura estándar definida en:

```text
/docs/03-backend-especificacion.md
```

Debe incluir:

- titulo.
- mensaje.
- detalle.
- estado.
- codigo.
- ruta.
- metodo.
- parametros_recibidos.
- fecha_hora.

---

# Regla RN-024: Trazabilidad de operaciones

## Descripción

Toda operación relevante debe generar log.

## Operaciones mínimas

- Login exitoso.
- Login fallido.
- Creación de proyecto.
- Edición de proyecto.
- Cancelación de proyecto.
- Creación de actividad.
- Edición de actividad.
- Cancelación de actividad.
- Asignación de usuario.
- Retiro de usuario.
- Registro de horas.
- Consulta de indicadores.
- Error de negocio.
- Error técnico.

---

# Regla RN-025: Eventos en tiempo real

## Descripción

Los cambios relevantes deben publicar eventos para actualización en tiempo real.

## Eventos mínimos

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

La implementación específica se define en:

```text
/docs/07-websocket.md
```

---

# Regla RN-026: Proyectos finalizados

## Descripción

Un proyecto finalizado representa un proyecto cerrado operativamente.

## Restricciones

Cuando un proyecto esté en estado:

```text
FINALIZADO
```

No se debe permitir:

- Crear nuevas actividades.
- Editar actividades operativas.
- Asignar usuarios.
- Registrar horas.
- Cambiar presupuesto.

Sí se debe permitir:

- Consultar proyecto.
- Consultar actividades.
- Consultar registros históricos.
- Consultar indicadores finales.

---

# Regla RN-027: Actividades finalizadas

## Descripción

Una actividad finalizada representa una actividad cerrada operativamente.

## Restricciones

Cuando una actividad esté en estado:

```text
FINALIZADA
```

No se debe permitir:

- Editar datos operativos.
- Registrar horas.
- Asignar usuarios.
- Retirar usuarios salvo decisión administrativa futura.

Sí se debe permitir:

- Consultar actividad.
- Consultar registros históricos.
- Consultar indicadores finales.

---

# Regla RN-028: Proyectos pausados

## Descripción

Un proyecto pausado representa un proyecto suspendido temporalmente.

## Restricciones iniciales

Cuando un proyecto esté en estado:

```text
PAUSADO
```

No se debe permitir:

- Crear nuevas actividades.
- Registrar horas.
- Asignar usuarios.

Sí se debe permitir:

- Consultar información.
- Consultar indicadores.
- Cambiar estado nuevamente a ACTIVO si el usuario es LIDER.

---

# Regla RN-029: Actividades pausadas

## Descripción

Una actividad pausada representa una actividad suspendida temporalmente.

## Restricciones iniciales

Cuando una actividad esté en estado:

```text
PAUSADA
```

No se debe permitir:

- Registrar horas.
- Asignar nuevos usuarios.

Sí se debe permitir:

- Consultar información.
- Consultar indicadores.
- Cambiar estado nuevamente a ACTIVA si el usuario es LIDER.

---

# Regla RN-030: Actualización del avance de actividad

## Descripción

El avance planificado y avance real se registran a nivel de actividad.

## Regla

Solo el líder puede actualizar:

```text
porcentaje_avance_planificado
porcentaje_avance_real
```

## Restricciones

- Los valores deben estar entre 0 y 100.
- Una actividad con avance real 100 puede pasar a estado FINALIZADA.
- El sistema no debe finalizar automáticamente la actividad salvo que la regla sea definida explícitamente en el futuro.

---

# Regla RN-031: No eliminar registros de horas

## Descripción

Los registros de horas son información histórica y financiera.

## Regla

No se permite eliminación física inicial de registros de horas.

## Motivo

Los registros de horas impactan:

- AC.
- Presupuesto consumido.
- Indicadores EVM.
- Trazabilidad financiera.
- Auditoría.

---

# Regla RN-032: Actualización de registros de horas

## Descripción

La actualización de registros de horas debe ser controlada.

## Permitido

Se permite actualizar:

- fecha_trabajo,
- horas_trabajadas,
- descripcion.

## No permitido

No se debe permitir actualizar manualmente:

- valor_hora_historico,
- costo_total.

## Regla

Si se actualizan `horas_trabajadas`, el backend debe recalcular:

```text
costo_total = horas_trabajadas * valor_hora_historico
```

---

# Regla RN-033: Validación de usuario activo

## Descripción

Solo usuarios activos pueden operar normalmente en el sistema.

## Regla

Un usuario con estado diferente de:

```text
ACTIVO
```

No debe poder:

- iniciar sesión,
- registrar horas,
- ser asignado a actividades,
- ejecutar operaciones funcionales.

---

# Regla RN-034: Validación de catálogos activos

## Descripción

Solo catálogos activos pueden usarse en operaciones nuevas.

## Aplica a

- Roles de sistema.
- Cargos.
- Estados de usuarios.
- Estados de proyectos.
- Estados de actividades.
- Estados de asignaciones.

## Regla

Si un catálogo tiene:

```text
activo = false
```

no debe usarse para nuevas operaciones.

---

# Regla RN-035: Responsabilidad de cálculo

## Descripción

El backend es la única fuente de verdad para cálculos financieros y EVM.

## Regla

El frontend no debe calcular ni decidir:

- AC.
- PV.
- EV.
- CPI.
- SPI.
- CV.
- SV.
- EAC.
- VAC.
- Estado EVM.

El frontend solo debe representar la información retornada por el backend.

---

# Resumen de reglas críticas

Las reglas más críticas del sistema son:

1. Nada se consume sin JWT, excepto login.
2. El líder gestiona proyectos, actividades, asignaciones y registros.
3. El colaborador solo opera sobre sus actividades asignadas.
4. El costo real nace del registro de horas.
5. El valor hora histórico debe conservarse.
6. Los indicadores EVM no se almacenan.
7. Los estados operativos sí se almacenan.
8. Los estados EVM se calculan.
9. Las colecciones vacías retornan `[]`, no 404.
10. Los errores deben tener estructura estándar.
11. Toda operación relevante debe generar log.
12. No se elimina físicamente información financiera histórica.