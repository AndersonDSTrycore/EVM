---
applyTo: "docs/**,README.md,*.md"
---

# Instrucciones de Documentación

Este archivo define las reglas obligatorias para crear o modificar documentación del proyecto.

Aplica a:

- `/docs/**`
- `README.md`
- archivos `.md`

---

# Objetivo de la documentación

La documentación debe funcionar como fuente de verdad para:

- Copilot.
- Agentes IA.
- Desarrolladores.
- Revisión funcional.
- Implementación backend.
- Implementación frontend.
- Implementación de base de datos.
- Pruebas.

La documentación debe reducir ambigüedad y evitar que Copilot invente reglas, entidades, flujos o estructuras.

---

# Idioma

Toda la documentación debe estar en español.

Excepciones permitidas:

- Nombres técnicos aceptados.
- Siglas EVM.
- Nombres de tecnologías.
- Rutas.
- Comandos.
- Código.
- Nombres de carpetas.
- Nombres de clases cuando corresponda.

---

# Estilo de escritura

La documentación debe ser:

- Clara.
- Directa.
- Ordenada.
- Técnica.
- Sin ambigüedades.
- Sin exceso de creatividad.
- Fácil de leer.
- Fácil de convertir en tareas de implementación.

Evitar:

- Frases vagas.
- Suposiciones.
- Reglas implícitas.
- Texto decorativo.
- Explicaciones innecesariamente largas.
- Cambios de criterio sin justificación.

---

# Regla de no invención

Copilot no debe agregar:

- Nuevas tablas.
- Nuevos campos.
- Nuevos endpoints.
- Nuevos roles.
- Nuevos estados.
- Nuevas reglas de negocio.
- Nuevos flujos.
- Nuevos cálculos EVM.
- Nuevas tecnologías.

Salvo que el usuario lo solicite explícitamente y quede documentado.

---

# Consistencia entre documentos

Antes de modificar documentación, Copilot debe verificar si el cambio afecta otros archivos.

Ejemplos:

Si se modifica una tabla en:

```text
/docs/02-modelo-base-datos.md
```

también puede requerir ajuste en:

```text
/docs/03-backend-especificacion.md
/docs/05-reglas-negocio.md
```

Si se modifica un cálculo EVM en:

```text
/docs/06-evm-calculos.md
```

también puede requerir ajuste en:

```text
/docs/01-flujo-funcional.md
/docs/04-frontend-especificacion.md
/docs/05-reglas-negocio.md
```

Si se modifica un flujo visual en:

```text
/docs/01-flujo-funcional.md
```

también puede requerir ajuste en:

```text
/docs/04-frontend-especificacion.md
```

---

# Formato Markdown

Usar Markdown estándar.

Se permite:

- Títulos.
- Subtítulos.
- Listas.
- Tablas.
- Bloques de código.
- Diagramas Mermaid.
- Separadores.
- Ejemplos JSON.
- Ejemplos textuales.

---

# Reglas para títulos

Usar títulos jerárquicos correctamente.

Ejemplo:

```md
# Título principal

## Sección principal

### Subsección
```

No usar títulos desordenados ni saltos innecesarios.

---

# Reglas para tablas

Las tablas deben usarse para:

- Campos de base de datos.
- Endpoints.
- DTOs.
- Estados.
- Roles y permisos.
- Validaciones.
- Códigos de error.
- Reglas comparativas.

Ejemplo:

```md
| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| nombre | varchar(255) | Sí | Nombre del proyecto |
```

---

# Reglas para bloques de código

Usar bloques de código para:

- Rutas.
- Comandos.
- JSON.
- Fórmulas.
- Estructuras de carpetas.
- Ejemplos SQL.
- Mermaid.

Indicar lenguaje cuando aplique:


```json
{
  "id": 1
}
```

Para texto plano usar:

```text
/api/proyectos
```

---

# Regla especial sobre triple backticks

Cuando se genere documentación que será copiada dentro de otro archivo Markdown o dentro de un prompt, evitar romper el formato por uso incorrecto de triple backticks.

Si el documento completo debe entregarse como bloque Markdown dentro de una conversación, envolverlo con cuatro backticks externos:


````md
# Documento

```text
contenido interno
```



Esto permite incluir bloques internos sin romper el documento.

---

# Documentos principales del proyecto

La documentación principal está organizada así:

```text
/docs/00-contexto-general.md
/docs/01-flujo-funcional.md
/docs/02-modelo-base-datos.md
/docs/03-backend-especificacion.md
/docs/04-frontend-especificacion.md
/docs/05-reglas-negocio.md
/docs/06-evm-calculos.md
/docs/07-websocket.md
/docs/08-roadmap-implementacion.md
```
````

---

# Responsabilidad de cada documento

## /docs/00-contexto-general.md

Debe contener:

- Objetivo del sistema.
- Problema que resuelve.
- Alcance general.
- Glosario mínimo.
- Mapa de documentos.

---

## /docs/01-flujo-funcional.md

Debe contener:

- Flujo general del usuario.
- Flujo del líder.
- Flujo del colaborador.
- Navegación.
- Acciones principales.
- Visualización esperada.
- Principio “Don't Make Me Think”.

---

## /docs/02-modelo-base-datos.md

Debe contener:

- Convenciones.
- Tablas.
- Campos.
- Tipos de datos.
- Relaciones.
- Restricciones.
- Estados operativos.
- Datos semilla.
- MER.

No debe mezclarse con reglas visuales del frontend.

---

## /docs/03-backend-especificacion.md

Debe contener:

- Arquitectura backend.
- Seguridad.
- Endpoints.
- DTOs esperados.
- Logs.
- Manejo de errores.
- OpenAPI.
- Validaciones backend.

No debe definir estilos visuales del frontend.

---

## /docs/04-frontend-especificacion.md

Debe contener:

- Layout.
- Menú.
- Topbar.
- Rutas frontend.
- Componentes.
- Pantallas.
- Tablas.
- Dialogs.
- Gráficos.
- Manejo visual de estados y errores.

No debe definir persistencia de base de datos.

---

## /docs/05-reglas-negocio.md

Debe contener:

- Reglas funcionales.
- Permisos.
- Restricciones.
- Validaciones de negocio.
- Comportamiento por rol.
- Qué se permite y qué no.

No debe convertirse en documento de implementación técnica detallada.

---

## /docs/06-evm-calculos.md

Debe contener:

- Fórmulas.
- Casos borde.
- Interpretaciones.
- DTOs conceptuales de indicadores.
- Reglas de redondeo.
- Pruebas esperadas.

No debe definir tablas físicas para guardar indicadores derivados.

---

## /docs/07-websocket.md

Debe contener:

- Uso de WebSockets.
- Uso de RabbitMQ.
- Eventos.
- Publicadores.
- Consumidores.
- Flujo de actualización en tiempo real.

---

## /docs/08-roadmap-implementacion.md

Debe contener:

- Fases de implementación.
- Orden recomendado.
- Qué se debe construir primero.
- Criterios de avance.
- Qué no debe hacerse todavía.

---

# Regla para modificar documentación

Cuando Copilot modifique un documento, debe:

1. Mantener la estructura existente.
2. No eliminar reglas sin justificación.
3. No contradecir otros documentos.
4. No agregar decisiones nuevas sin indicarlas claramente.
5. Usar lenguaje claro y directo.
6. Mantener consistencia de nombres.
7. Mantener rutas y nombres exactos.

---

# Regla para documentación de decisiones

Toda decisión importante debe documentarse con el siguiente formato:

```md
## Decisión: nombre de la decisión

### Contexto

Descripción breve del problema.

### Decisión

Qué se decidió.

### Motivo

Por qué se decidió.

### Impacto

Qué partes del sistema afecta.
```

---

# Regla para ejemplos

Los ejemplos deben ser coherentes con el modelo del proyecto.

No usar ejemplos inventados que contradigan:

- Modelo de base de datos.
- Reglas de negocio.
- Roles.
- Estados.
- Endpoints.
- DTOs.

---

# Regla para términos EVM

Usar siempre las siglas oficiales:

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

No traducir las siglas.

Se permite traducir la descripción del concepto.

Ejemplo:

```text
CPI — Cost Performance Index — Índice de desempeño de costo
```

---

# Regla para documentación de errores

Cuando se documenten errores, usar la estructura estándar definida en:

```text
/docs/03-backend-especificacion.md
```

Campos esperados:

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

# Regla para actualización de índice

Si se crea un nuevo documento dentro de `/docs`, actualizar el índice o mapa de documentos en:

```text
/docs/00-contexto-general.md
```

---

# Criterio de calidad de documentación

Un documento se considera válido cuando:

- Puede ser usado por Copilot sin ambigüedad.
- No contradice otros documentos.
- No mezcla responsabilidades.
- Tiene estructura clara.
- Usa nombres consistentes.
- Diferencia reglas de negocio, implementación y visualización.
- Indica claramente qué se permite y qué no.