---
applyTo: "EVM-backend/src/main/resources/db/**"
---

# Instrucciones Base de Datos

Antes de generar migraciones, consultar obligatoriamente:

`/docs/02-modelo-base-datos.md`

Ese documento contiene:
- modelo completo,
- MER,
- tipos de datos,
- relaciones,
- restricciones,
- datos semilla.

Copilot no debe crear, modificar ni eliminar tablas, campos, relaciones, índices o semillas que no estén definidos allí.

Reglas adicionales:
- usar Liquibase,
- respetar PostgreSQL,
- no persistir indicadores EVM,
- no guardar contraseñas en texto plano,
- scripts idempotentes,
- no eliminación física de registros principales.

Ese documento es la única fuente de verdad para:

- tablas,
- campos,
- tipos de datos,
- relaciones,
- restricciones,
- índices,
- estados operativos,
- datos semilla,
- MER.

No se permite crear, modificar o eliminar tablas, campos, relaciones, índices o datos semilla que no estén definidos en `/docs/02-modelo-base-datos.md`.

---

# Motor de base de datos

La base de datos será PostgreSQL.

---

# Migraciones

Las migraciones deben realizarse con Liquibase.

Cada changeset debe tener:

- id único,
- author definido,
- propósito claro,
- cambios pequeños y trazables.

---

# Reglas obligatorias

Copilot debe respetar exactamente las convenciones definidas en `/docs/02-modelo-base-datos.md`.

No se permite:

- crear tablas fuera del modelo,
- cambiar nombres de tablas,
- cambiar nombres de campos,
- cambiar tipos de datos,
- reemplazar tablas catálogo por una tabla genérica,
- agregar columnas para indicadores EVM derivados,
- insertar contraseñas en texto plano,
- crear scripts de eliminación física para datos principales.

---

# Indicadores EVM

No crear columnas ni tablas para:

- PV
- EV
- AC calculado
- CV
- SV
- CPI
- SPI
- EAC
- VAC
- estado EVM
- riesgo EVM

Los indicadores se calculan dinámicamente en backend según:

`/docs/06-evm-calculos.md`

---

# Datos semilla

Los datos semilla deben respetar exclusivamente lo definido en:

`/docs/02-modelo-base-datos.md`

Los inserts deben ser idempotentes.

No deben duplicar datos si se ejecutan más de una vez.

---

# Contraseñas

Las contraseñas de usuarios semilla nunca deben insertarse en texto plano.

Deben almacenarse usando el mecanismo de encriptación definido por Spring Security.

---

# Validación previa

Antes de finalizar cambios en base de datos, Copilot debe verificar:

- que cada tabla exista en `/docs/02-modelo-base-datos.md`,
- que cada campo exista en `/docs/02-modelo-base-datos.md`,
- que cada relación exista en `/docs/02-modelo-base-datos.md`,
- que no se agregaron indicadores EVM persistidos,
- que los datos semilla sean idempotentes,
- que no existan contraseñas en texto plano.

# Inicialización local

Copilot no debe asumir que DBeaver crea la base de datos.

La base de datos física local debe ser creada por Docker Compose.

Credenciales locales iniciales:

- database: `evm_db`
- username: `admin`
- password: `admin`
- host: `localhost`
- port: `55433`

Liquibase debe ejecutarse desde el backend para crear tablas, relaciones, restricciones y datos semilla.