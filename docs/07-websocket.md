# WebSocket

## Objetivo del documento

Este documento define el uso esperado de WebSocket dentro del sistema.

WebSocket permitirá notificar al frontend cambios relevantes en tiempo real, evitando que el usuario tenga que recargar manualmente las vistas.

Este documento no define RabbitMQ ni mensajería asincrónica interna.

---

# Decisión técnica

Para la primera versión del sistema se usará únicamente:

```text
WebSocket
```

No se implementará RabbitMQ en esta fase.

---

# Objetivo de WebSocket

WebSocket se usará para actualizar en tiempo real:

- Dashboard de proyectos.
- Vista de actividades.
- Indicadores consolidados.
- Gráficos.
- Estados visuales.
- Alertas operativas.

---

# Regla principal

WebSocket no debe contener lógica de negocio.

Las reglas de negocio deben permanecer en los servicios backend.

WebSocket solo debe notificar que ocurrió un cambio relevante.

---

# Eventos esperados

Los eventos mínimos esperados son:

```text
PROYECTO_CREADO
PROYECTO_ACTUALIZADO
PROYECTO_CANCELADO
ACTIVIDAD_CREADA
ACTIVIDAD_ACTUALIZADA
ACTIVIDAD_CANCELADA
USUARIO_ASIGNADO_ACTIVIDAD
USUARIO_RETIRADO_ACTIVIDAD
HORAS_REGISTRADAS
INDICADORES_RECALCULADOS
ALERTA_PRESUPUESTAL
```

---

# Endpoint WebSocket sugerido

Endpoint base:

```text
/ws
```

Canales sugeridos:

```text
/topic/proyectos
/topic/proyectos/{idProyecto}
/topic/actividades/{idActividad}
/user/queue/notificaciones
```

---

# Estructura base de evento

Todo evento WebSocket debe mantener una estructura consistente.

Ejemplo:

```json
{
  "tipo_evento": "HORAS_REGISTRADAS",
  "id_proyecto": 1,
  "id_actividad": 3,
  "id_usuario": 2,
  "mensaje": "Se registraron horas sobre la actividad.",
  "fecha_hora": "2026-05-19T10:30:00",
  "requiere_refresco": true
}
```

---

# Comportamiento esperado del backend

Cuando ocurra una acción relevante, el backend debe:

1. Ejecutar la operación principal.
2. Confirmar que la operación fue exitosa.
3. Recalcular indicadores si aplica.
4. Publicar evento WebSocket.
5. Registrar log del evento publicado.

Ejemplo:

```text
Registrar horas
  → Guardar registro
  → Calcular costo total
  → Recalcular indicadores
  → Publicar evento HORAS_REGISTRADAS
  → Publicar evento INDICADORES_RECALCULADOS
```

---

# Comportamiento esperado del frontend

Cuando el frontend reciba un evento, debe actualizar la vista correspondiente.

## Vista `/projects`

Puede refrescar:

- Tabla de proyectos.
- Estados visuales.
- Indicadores generales si existen.

## Vista `/projects/:id/activities`

Puede refrescar:

- Encabezado del proyecto.
- Indicadores consolidados.
- Gráfico PV vs EV vs AC.
- Tabla de actividades.
- Responsables.
- Estados EVM.

## Dialog de indicadores de actividad

Puede refrescar:

- Indicadores de la actividad.
- Mensajes interpretativos.
- Estado financiero.
- Estado de cronograma.

---

# Regla sobre EVM

El frontend no debe recalcular indicadores EVM al recibir eventos WebSocket.

El frontend debe:

- Refrescar datos desde backend.
- O representar datos calculados enviados por backend.

No calcular en frontend:

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

---

# Seguridad WebSocket

Las conexiones WebSocket deben respetar autenticación.

Reglas:

- El usuario debe estar autenticado.
- El token JWT debe validarse.
- El usuario solo debe recibir eventos permitidos según su rol.
- Un colaborador no debe recibir eventos de actividades no asignadas.
- Un líder solo debe recibir eventos de proyectos que puede consultar o gestionar.

---

# Eventos por rol

## LIDER

Puede recibir eventos relacionados con:

- Sus proyectos.
- Actividades de sus proyectos.
- Asignaciones de sus actividades.
- Registros de horas de sus actividades.
- Recalculo de indicadores.
- Alertas presupuestales.

## COLABORADOR

Puede recibir eventos relacionados únicamente con:

- Actividades asignadas.
- Cambios en actividades asignadas.
- Registros propios de horas.
- Indicadores de actividades asignadas.

---

# Logging

El backend debe registrar logs cuando:

- Se publica un evento WebSocket.
- Falla la publicación de un evento.
- Se rechaza una notificación por permisos.
- Se notifica un evento crítico.
- Se recalculan indicadores derivados de una acción.

---

# Qué no debe hacerse

No se debe:

- Implementar RabbitMQ en esta fase.
- Calcular EVM en frontend.
- Guardar indicadores EVM derivados.
- Enviar datos sensibles innecesarios por WebSocket.
- Notificar cambios antes de confirmar la operación principal.
- Permitir que colaboradores reciban eventos de actividades no asignadas.
- Usar WebSocket para reemplazar endpoints REST.

---

# Estado de implementación

WebSocket queda definido como una fase posterior.

No debe implementarse antes de completar:

- Seguridad JWT.
- CRUD de proyectos.
- CRUD de actividades.
- Asignaciones.
- Registro de horas.
- Cálculos EVM.
- Endpoints REST principales.
- Frontend base funcional.

---

# Criterio de aceptación

WebSocket se considera correctamente implementado cuando:

- El usuario autenticado puede conectarse.
- El JWT se valida.
- El backend publica eventos relevantes.
- El frontend recibe eventos.
- Las vistas se actualizan sin recargar manualmente.
- El colaborador solo recibe eventos permitidos.
- El líder recibe eventos de sus proyectos.
- El frontend no recalcula EVM.