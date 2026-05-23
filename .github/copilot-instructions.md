# Instrucciones globales para GitHub Copilot

Este repositorio contiene una aplicación fullstack para gestión de proyectos, actividades, registro de horas y análisis EVM.

Copilot debe trabajar con temperatura conceptual cero: no debe inventar entidades, campos, rutas, nombres, estados ni reglas de negocio que no estén definidos en `/docs`.

Antes de generar código, debe revisar primero:

1. `/docs/00-contexto-general.md`
2. `/docs/01-flujo-funcional.md`
3. `/docs/02-modelo-base-datos.md`
4. `/docs/03-backend-especificacion.md`
5. `/docs/04-frontend-especificacion.md`
6. `/docs/05-reglas-negocio.md`
7. `/docs/06-evm-calculos.md`

Si una regla no está documentada, Copilot debe preguntar antes de implementarla.

No se permite:
- crear tablas no especificadas,
- cambiar nombres de campos,
- cambiar nombres de rutas,
- almacenar indicadores EVM derivados,
- mover lógica de negocio a controladores,
- crear componentes visuales fuera del flujo definido,
- inventar estados no documentados.

El idioma del código, nombres de tablas, campos, comentarios funcionales y documentación será español, excepto siglas técnicas como BAC, PV, EV, AC, CPI, SPI, EAC y VAC.

El backend debe implementarse en Java Spring Boot.

El frontend debe implementarse en Angular 19 con PrimeNG 19 y Tailwind CSS.

La base de datos será PostgreSQL.

Las tablas deben llamarse en plural, iniciar con `tbl_` y usar snake_case.

Toda lógica EVM debe estar cubierta por pruebas unitarias tanto en el backend como en el frontend.

## Glosario EVM obligatorio

Copilot debe respetar las siguientes siglas del modelo EVM:

- BAC: Budget at Completion. Presupuesto total planificado de la actividad.
- PV: Planned Value. Valor planificado.
- EV: Earned Value. Valor ganado.
- AC: Actual Cost. Costo real incurrido.
- CV: Cost Variance. Variación de costo.
- SV: Schedule Variance. Variación de cronograma.
- CPI: Cost Performance Index. Índice de desempeño de costo.
- SPI: Schedule Performance Index. Índice de desempeño de cronograma.
- EAC: Estimate at Completion. Estimación del costo al finalizar.
- VAC: Variance at Completion. Variación estimada al finalizar.

Los indicadores EVM derivados no deben persistirse en base de datos. Deben calcularse dinámicamente desde los datos fuente definidos en `/docs/02-modelo-base-datos.md` y las reglas de `/docs/06-evm-calculos.md`.