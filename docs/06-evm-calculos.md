# Cálculos EVM

## Objetivo del documento

Este documento define las fórmulas, reglas de cálculo, casos borde e interpretación de los indicadores EVM del sistema.

Copilot debe usar este documento como fuente principal para implementar:

- Servicio de cálculo EVM.
- DTOs de indicadores.
- Respuestas de indicadores por actividad.
- Respuestas de indicadores consolidados por proyecto.
- Pruebas unitarias de cálculo.

No se deben implementar fórmulas EVM diferentes a las definidas en este documento.

---

# Documentos relacionados

Antes de implementar cálculos EVM, Copilot debe revisar:

```text
/docs/02-modelo-base-datos.md
/docs/03-backend-especificacion.md
/docs/05-reglas-negocio.md
```

---

# Regla principal

Los indicadores EVM son datos derivados.

No se deben almacenar en base de datos:

- PV
- EV
- AC calculado
- CV
- SV
- CPI
- SPI
- EAC
- VAC
- Estado EVM
- Riesgo EVM

Estos valores deben calcularse dinámicamente desde los datos fuente.

---

# Datos fuente para el cálculo

Los cálculos EVM se realizan a partir de:

| Dato | Origen |
|---|---|
| BAC | `tbl_actividades.bac` |
| Porcentaje avance planificado | `tbl_actividades.porcentaje_avance_planificado` |
| Porcentaje avance real | `tbl_actividades.porcentaje_avance_real` |
| Horas trabajadas | `tbl_registros_horas.horas_trabajadas` |
| Valor hora histórico | `tbl_registros_horas.valor_hora_historico` |
| Costo total | `tbl_registros_horas.costo_total` |

---

# Regla sobre porcentajes

Los porcentajes se almacenan en base de datos como valores entre `0` y `100`.

Ejemplos:

| Valor almacenado | Significado |
|---:|---|
| 0 | 0% |
| 25 | 25% |
| 50 | 50% |
| 100 | 100% |

Para los cálculos, el backend debe convertir el porcentaje a decimal dividiendo entre `100`.

Ejemplo:

```text
porcentaje_decimal = porcentaje / 100
```

Por lo tanto:

```text
40% = 40 / 100 = 0.40
```

---

# Glosario EVM

| Sigla | Nombre | Descripción |
|---|---|---|
| BAC | Budget at Completion | Presupuesto total planificado de la actividad |
| PV | Planned Value | Valor planificado del trabajo a la fecha |
| EV | Earned Value | Valor ganado según avance real |
| AC | Actual Cost | Costo real incurrido |
| CV | Cost Variance | Variación de costo |
| SV | Schedule Variance | Variación de cronograma |
| CPI | Cost Performance Index | Índice de desempeño de costo |
| SPI | Schedule Performance Index | Índice de desempeño de cronograma |
| EAC | Estimate at Completion | Estimación del costo total al finalizar |
| VAC | Variance at Completion | Variación estimada al finalizar |

---

# Fórmulas por actividad

## BAC

El BAC corresponde al presupuesto total planificado de la actividad.

```text
BAC = tbl_actividades.bac
```

---

## PV — Planned Value

Representa el valor planificado del trabajo que debería haberse completado según el avance planificado.

```text
PV = (porcentaje_avance_planificado / 100) * BAC
```

Ejemplo:

```text
BAC = 10.000.000
porcentaje_avance_planificado = 50

PV = 0.50 * 10.000.000
PV = 5.000.000
```

---

## EV — Earned Value

Representa el valor ganado según el avance real completado.

```text
EV = (porcentaje_avance_real / 100) * BAC
```

Ejemplo:

```text
BAC = 10.000.000
porcentaje_avance_real = 40

EV = 0.40 * 10.000.000
EV = 4.000.000
```

---

## AC — Actual Cost

Representa el costo real incurrido.

Debe calcularse con base en los registros de horas.

```text
AC = SUM(costo_total)
```

También puede entenderse como:

```text
AC = SUM(horas_trabajadas * valor_hora_historico)
```

El sistema debe preferir `costo_total` si ya está almacenado correctamente en `tbl_registros_horas`.

Si no hay registros de horas:

```text
AC = 0
```

---

## CV — Cost Variance

Representa la variación de costo.

```text
CV = EV - AC
```

Interpretación:

| Condición | Interpretación |
|---|---|
| CV > 0 | Bajo presupuesto |
| CV = 0 | En presupuesto |
| CV < 0 | Sobre presupuesto |

---

## SV — Schedule Variance

Representa la variación del cronograma.

```text
SV = EV - PV
```

Interpretación:

| Condición | Interpretación |
|---|---|
| SV > 0 | Adelantado |
| SV = 0 | En cronograma |
| SV < 0 | Retrasado |

---

## CPI — Cost Performance Index

Representa la eficiencia del costo.

```text
CPI = EV / AC
```

Interpretación:

| Condición | Interpretación |
|---|---|
| CPI > 1 | Bajo presupuesto / eficiente en costos |
| CPI = 1 | En presupuesto |
| CPI < 1 | Sobre presupuesto / ineficiente en costos |

---

## SPI — Schedule Performance Index

Representa la eficiencia del cronograma.

```text
SPI = EV / PV
```

Interpretación:

| Condición | Interpretación |
|---|---|
| SPI > 1 | Adelantado |
| SPI = 1 | En cronograma |
| SPI < 1 | Retrasado |

---

## EAC — Estimate at Completion

Representa la estimación del costo total al finalizar.

```text
EAC = BAC / CPI
```

---

## VAC — Variance at Completion

Representa la variación estimada al finalizar.

```text
VAC = BAC - EAC
```

Interpretación:

| Condición | Interpretación |
|---|---|
| VAC > 0 | Se estima terminar bajo presupuesto |
| VAC = 0 | Se estima terminar en presupuesto |
| VAC < 0 | Se estima terminar sobre presupuesto |

---

# Casos borde obligatorios

## Caso 1: AC igual a cero

Cuando `AC = 0`, no se debe ejecutar división directa para calcular CPI.

```text
CPI = EV / AC
```

## Regla

Si `AC = 0`:

- Si `EV = 0`, entonces `CPI = null`.
- Si `EV > 0`, entonces `CPI = null`.

## Motivo

No debe generarse error de división por cero.

## Interpretación

```text
Sin costo registrado suficiente para calcular CPI.
```

---

# Caso 2: PV igual a cero

Cuando `PV = 0`, no se debe ejecutar división directa para calcular SPI.

```text
SPI = EV / PV
```

## Regla

Si `PV = 0`:

- Si `EV = 0`, entonces `SPI = null`.
- Si `EV > 0`, entonces `SPI = null`.

## Motivo

No debe generarse error de división por cero.

## Interpretación

```text
Sin avance planificado suficiente para calcular SPI.
```

---

# Caso 3: CPI nulo

Cuando `CPI = null`, no se debe calcular directamente:

```text
EAC = BAC / CPI
```

## Regla

Si `CPI = null`:

```text
EAC = null
VAC = null
```

## Interpretación

```text
No es posible estimar costo final sin CPI válido.
```

---

# Caso 4: Actividad sin registros de horas

Si una actividad no tiene registros de horas:

```text
AC = 0
```

Los demás indicadores se calculan según sus reglas, respetando división por cero.

---

# Caso 5: Proyecto sin actividades

Si un proyecto no tiene actividades:

```text
BAC = 0
PV = 0
EV = 0
AC = 0
CV = 0
SV = 0
CPI = null
SPI = null
EAC = null
VAC = null
```

Debe retornar valores seguros y no lanzar error.

---

# Caso 6: Avance real cero

Si:

```text
porcentaje_avance_real = 0
```

Entonces:

```text
EV = 0
```

Los demás indicadores se calculan desde ese valor, respetando casos borde.

---

# Caso 7: Avance planificado cero

Si:

```text
porcentaje_avance_planificado = 0
```

Entonces:

```text
PV = 0
SPI = null
```

---

# Consolidado por proyecto

Los indicadores consolidados de un proyecto se calculan agregando la información de todas sus actividades no canceladas.

## Actividades consideradas

Para el consolidado inicial se deben considerar actividades cuyo estado operativo sea diferente de:

```text
CANCELADA
```

Las actividades finalizadas sí pueden participar en el consolidado porque representan trabajo real ejecutado.

---

## BAC consolidado

```text
BAC_PROYECTO = SUM(BAC de actividades consideradas)
```

---

## PV consolidado

```text
PV_PROYECTO = SUM(PV de actividades consideradas)
```

---

## EV consolidado

```text
EV_PROYECTO = SUM(EV de actividades consideradas)
```

---

## AC consolidado

```text
AC_PROYECTO = SUM(AC de actividades consideradas)
```

---

## CV consolidado

```text
CV_PROYECTO = EV_PROYECTO - AC_PROYECTO
```

---

## SV consolidado

```text
SV_PROYECTO = EV_PROYECTO - PV_PROYECTO
```

---

## CPI consolidado

```text
CPI_PROYECTO = EV_PROYECTO / AC_PROYECTO
```

Aplican los mismos casos borde definidos para CPI.

---

## SPI consolidado

```text
SPI_PROYECTO = EV_PROYECTO / PV_PROYECTO
```

Aplican los mismos casos borde definidos para SPI.

---

## EAC consolidado

```text
EAC_PROYECTO = BAC_PROYECTO / CPI_PROYECTO
```

Si `CPI_PROYECTO = null`, entonces:

```text
EAC_PROYECTO = null
```

---

## VAC consolidado

```text
VAC_PROYECTO = BAC_PROYECTO - EAC_PROYECTO
```

Si `EAC_PROYECTO = null`, entonces:

```text
VAC_PROYECTO = null
```

---

# Interpretación general del estado EVM

El backend debe retornar interpretaciones humanas junto con los indicadores.

## Interpretación financiera

Basada en CPI y CV.

| Condición | Estado financiero | Mensaje |
|---|---|---|
| CPI = null | SIN_DATOS | No hay información suficiente para calcular eficiencia de costos |
| CPI > 1 | BAJO_PRESUPUESTO | Se está avanzando con menor costo del esperado |
| CPI = 1 | EN_PRESUPUESTO | El costo está alineado con el avance |
| CPI < 1 | SOBRE_PRESUPUESTO | Se está gastando más de lo que se avanza |

---

## Interpretación de cronograma

Basada en SPI y SV.

| Condición | Estado cronograma | Mensaje |
|---|---|---|
| SPI = null | SIN_DATOS | No hay información suficiente para calcular eficiencia de cronograma |
| SPI > 1 | ADELANTADO | El avance real supera el avance planificado |
| SPI = 1 | EN_CRONOGRAMA | El avance real está alineado con el avance planificado |
| SPI < 1 | RETRASADO | El avance real está por debajo del avance planificado |

---

# Estado general calculado

El estado general EVM no se persiste.

Debe calcularse dinámicamente para respuestas de dashboard.

## Reglas iniciales

| Condición | Estado general |
|---|---|
| CPI = null y SPI = null | SIN_DATOS |
| CPI >= 1 y SPI >= 1 | SALUDABLE |
| CPI < 1 y SPI >= 1 | RIESGO_COSTO |
| CPI >= 1 y SPI < 1 | RIESGO_CRONOGRAMA |
| CPI < 1 y SPI < 1 | CRITICO |

---

# DTO esperado para indicador de actividad

El backend debe retornar un DTO conceptual similar a:

```json
{
  "id_actividad": 1,
  "nombre_actividad": "Backend API",
  "bac": 10000000,
  "pv": 5000000,
  "ev": 4000000,
  "ac": 6000000,
  "cv": -2000000,
  "sv": -1000000,
  "cpi": 0.67,
  "spi": 0.80,
  "eac": 14925373.13,
  "vac": -4925373.13,
  "estado_financiero": "SOBRE_PRESUPUESTO",
  "mensaje_financiero": "Se está gastando más de lo que se avanza.",
  "estado_cronograma": "RETRASADO",
  "mensaje_cronograma": "El avance real está por debajo del avance planificado.",
  "estado_general": "CRITICO"
}
```

---

# DTO esperado para indicador de proyecto

El backend debe retornar un DTO conceptual similar a:

```json
{
  "id_proyecto": 1,
  "nombre_proyecto": "Proyecto EVM",
  "bac": 25000000,
  "pv": 12000000,
  "ev": 10000000,
  "ac": 15000000,
  "cv": -5000000,
  "sv": -2000000,
  "cpi": 0.67,
  "spi": 0.83,
  "eac": 37313432.84,
  "vac": -12313432.84,
  "estado_financiero": "SOBRE_PRESUPUESTO",
  "mensaje_financiero": "Se está gastando más de lo que se avanza.",
  "estado_cronograma": "RETRASADO",
  "mensaje_cronograma": "El avance real está por debajo del avance planificado.",
  "estado_general": "CRITICO"
}
```

---

# Redondeo

Los valores monetarios deben manejarse con precisión decimal.

En backend Java se debe usar:

```text
BigDecimal
```

No usar `double` ni `float` para cálculos monetarios.

## Regla de redondeo

Para valores monetarios:

```text
scale = 2
rounding = HALF_UP
```

Para índices CPI y SPI:

```text
scale = 4
rounding = HALF_UP
```

Ejemplo:

```text
CPI = 0.666666
CPI redondeado = 0.6667
```

---

# Pruebas unitarias obligatorias

Se deben crear pruebas unitarias para validar:

- Cálculo de PV.
- Cálculo de EV.
- Cálculo de AC.
- Cálculo de CV.
- Cálculo de SV.
- Cálculo de CPI.
- Cálculo de SPI.
- Cálculo de EAC.
- Cálculo de VAC.
- Actividad sin registros de horas.
- Proyecto sin actividades.
- AC igual a cero.
- PV igual a cero.
- CPI nulo.
- SPI nulo.
- Consolidado por proyecto.
- Redondeo monetario.
- Redondeo de índices.

---

# Responsabilidad de implementación

La lógica EVM debe estar centralizada en backend.

Servicio sugerido:

```text
IndicadorEvmService
```

El frontend no debe recalcular indicadores.

El frontend solo debe representar:

- Valores calculados.
- Estados calculados.
- Mensajes interpretativos.
- Semáforos visuales.
- Gráficos con valores recibidos del backend.