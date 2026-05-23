# Entorno Local de Base de Datos

## Objetivo del documento

Este documento define cómo debe inicializarse, configurarse, limpiarse y validarse la base de datos local del proyecto.

Su objetivo es evitar ambigüedades durante la creación del entorno local y prevenir errores derivados de:

- bases de datos inexistentes,
- contenedores mal configurados,
- volúmenes antiguos,
- conflictos de puertos,
- credenciales inconsistentes,
- uso incorrecto de DBeaver,
- ejecución incompleta de Liquibase.

---

# Decisión arquitectónica

La base de datos física local debe ser creada por Docker Compose.

El backend no debe encargarse de crear la base de datos física.

El backend, mediante Liquibase, sí debe encargarse de crear:

- tablas,
- relaciones,
- llaves primarias,
- llaves foráneas,
- restricciones,
- índices,
- datos semilla.

DBeaver no será responsable de crear la base de datos.

DBeaver se usará únicamente para:

- conectarse a PostgreSQL,
- visualizar tablas,
- ejecutar consultas manuales,
- validar datos,
- revisar estructura.

---

# Flujo correcto de inicialización

El flujo esperado para ambiente local es:

```text
1. Docker Compose levanta PostgreSQL.
2. PostgreSQL crea la base de datos local.
3. PostgreSQL crea el usuario local.
4. El backend arranca.
5. Liquibase ejecuta los changelogs.
6. Liquibase crea tablas, relaciones y datos semilla.
7. DBeaver se conecta para visualizar la base de datos.
```

---

# Configuración local oficial

Para evitar conflicto con otros proyectos locales, este proyecto usará un puerto externo distinto al puerto estándar `5432`.

## Parámetros de conexión

```text
Host: localhost
Port: 55433
Database: evm_db
Username: admin
Password: admin
```

## JDBC URL

```text
jdbc:postgresql://localhost:55433/evm_db
```

---

# Docker Compose esperado

El archivo `docker-compose.yml` debe crear el servicio PostgreSQL del proyecto.

```yaml
services:
  evm-postgres:
    image: postgres:16
    container_name: evm-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: evm_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "55433:5432"
    volumes:
      - evm_postgres_data:/var/lib/postgresql/data
    networks:
      - evm-network

volumes:
  evm_postgres_data:

networks:
  evm-network:
    driver: bridge
```

---

# Explicación del puerto

PostgreSQL dentro del contenedor usa el puerto:

```text
5432
```

El equipo local expondrá el puerto:

```text
55433
```

Por eso la conexión desde DBeaver o backend local debe usar:

```text
localhost:55433
```

No usar `localhost:5432` para este proyecto, salvo que se cambie explícitamente la configuración.

---

# Configuración del backend

El backend debe conectarse usando las mismas credenciales definidas por Docker Compose.

Ejemplo para ambiente local:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:55433/evm_db
    username: admin
    password: admin

  liquibase:
    enabled: true
```

---

# Responsabilidad de Liquibase

Liquibase debe crear la estructura interna de la base de datos.

Debe encargarse de:

- crear tablas,
- crear secuencias si aplican,
- crear restricciones,
- crear índices,
- crear relaciones,
- insertar datos semilla.

Liquibase no debe asumir que la base de datos física no existe.

La base de datos `evm_db` debe existir antes de que el backend arranque.

---

# Responsabilidad de DBeaver

DBeaver no crea la base de datos principal del proyecto.

DBeaver debe configurarse únicamente para conectarse a:

```text
Host: localhost
Port: 55433
Database: evm_db
Username: admin
Password: admin
```

DBeaver se usará para validar que Liquibase haya creado correctamente:

- tablas,
- relaciones,
- catálogos,
- usuarios semilla,
- datos iniciales.

---

# Levantar la base de datos

Desde la raíz del proyecto ejecutar:

```bash
docker compose up -d
```

Validar que el contenedor esté activo:

```bash
docker ps
```

Debe aparecer un contenedor llamado:

```text
evm-postgres
```

---

# Validar logs del contenedor

Para revisar que PostgreSQL inició correctamente:

```bash
docker logs evm-postgres
```

Una inicialización correcta debe indicar que PostgreSQL está listo para aceptar conexiones.

---

# Conexión desde DBeaver

Crear una nueva conexión PostgreSQL con:

```text
Host: localhost
Port: 55433
Database: evm_db
Username: admin
Password: admin
```

Si DBeaver no conecta, validar:

1. Que Docker esté iniciado.
2. Que el contenedor `evm-postgres` esté arriba.
3. Que el puerto usado sea `55433`.
4. Que no se esté usando la conexión antigua de otro proyecto.
5. Que las credenciales sean `admin/admin`.

---

# Validación inicial con SQL

Una vez conectado desde DBeaver, se puede validar la conexión con:

```sql
SELECT current_database();
```

Resultado esperado:

```text
evm_db
```

También se puede validar el usuario:

```sql
SELECT current_user;
```

Resultado esperado:

```text
admin
```

---

# Validar ejecución de Liquibase

Después de iniciar el backend, Liquibase debe crear sus tablas de control:

```text
databasechangelog
databasechangeloglock
```

También deben existir las tablas del modelo documentado en:

```text
/docs/02-modelo-base-datos.md
```

Ejemplos:

```text
tbl_roles_sistema
tbl_cargos
tbl_estados_usuarios
tbl_usuarios
tbl_estados_proyectos
tbl_proyectos
tbl_estados_actividades
tbl_actividades
tbl_estados_asignaciones
tbl_asignaciones_actividades
tbl_registros_horas
```

---

# Validar datos semilla

Después de ejecutar Liquibase, deben existir datos iniciales en:

```text
tbl_roles_sistema
tbl_cargos
tbl_estados_usuarios
tbl_estados_proyectos
tbl_estados_actividades
tbl_estados_asignaciones
tbl_usuarios
```

Consultas sugeridas:

```sql
SELECT * FROM tbl_roles_sistema;
SELECT * FROM tbl_cargos;
SELECT * FROM tbl_estados_usuarios;
SELECT * FROM tbl_estados_proyectos;
SELECT * FROM tbl_usuarios;
```

---

# Limpieza segura del entorno local

Si la base de datos queda mal creada o Liquibase falla durante la primera inicialización, se puede limpiar únicamente el entorno de este proyecto.

No usar:

```bash
docker volume prune
```

Ese comando puede eliminar volúmenes de otros proyectos.

## Detener contenedor específico

```bash
docker stop evm-postgres
```

## Eliminar contenedor específico

```bash
docker rm evm-postgres
```

## Eliminar volumen específico del proyecto

```bash
docker volume rm evm_postgres_data
```

## Levantar nuevamente

```bash
docker compose up -d
```

Esto recreará la base de datos desde cero.

---

# Regla sobre otros proyectos locales

Este proyecto no debe depender de contenedores, bases de datos o volúmenes de otros proyectos.

Si existe otro PostgreSQL local usando:

```text
localhost:5432
```

este proyecto debe mantenerse en:

```text
localhost:55433
```

Esto reduce conflictos con entornos anteriores.

---

# Problemas comunes

## Error: la base de datos no existe

Causa probable:

- El contenedor no fue creado correctamente.
- El volumen ya existía con configuración anterior.
- Se cambió `POSTGRES_DB` después de creado el volumen.

Solución:

```bash
docker stop evm-postgres
docker rm evm-postgres
docker volume rm evm_postgres_data
docker compose up -d
```

---

## Error: credenciales inválidas

Causa probable:

- El volumen fue creado con credenciales anteriores.
- Se modificó `POSTGRES_USER` o `POSTGRES_PASSWORD` después de la primera inicialización.

Solución:

Eliminar el volumen específico:

```bash
docker volume rm evm_postgres_data
```

Luego levantar de nuevo:

```bash
docker compose up -d
```

---

## Error: puerto ocupado

Causa probable:

- Otro PostgreSQL está usando el puerto local.
- Otro contenedor usa el mismo puerto.

Validar contenedores:

```bash
docker ps
```

Solución recomendada:

- Mantener este proyecto usando `55433`.
- No cambiarlo a `5432` si otro entorno ya lo usa.

---

## DBeaver conecta pero no aparecen tablas

Causa probable:

- PostgreSQL está creado, pero el backend no ha ejecutado Liquibase.
- Liquibase está deshabilitado.
- El backend apunta a otra base de datos.
- El backend usa otro puerto.

Validar configuración backend:

```text
jdbc:postgresql://localhost:55433/evm_db
```

Validar que Liquibase esté habilitado:

```yaml
spring:
  liquibase:
    enabled: true
```

---

# Checklist de entorno local

Antes de implementar funcionalidades, validar:

- Docker Desktop está iniciado.
- `docker compose up -d` ejecuta correctamente.
- Existe el contenedor `evm-postgres`.
- El puerto local usado es `55433`.
- La base de datos es `evm_db`.
- El usuario es `admin`.
- La contraseña es `admin`.
- DBeaver conecta correctamente.
- El backend apunta a `localhost:55433/evm_db`.
- Liquibase está habilitado.
- Existen tablas `databasechangelog` y `databasechangeloglock`.
- Existen las tablas del modelo.
- Existen los datos semilla.
- No se usó `docker volume prune`.

---

# Criterio de aceptación

El entorno local de base de datos se considera correctamente configurado cuando:

1. Docker levanta PostgreSQL sin errores.
2. DBeaver conecta usando `localhost:55433`.
3. La base `evm_db` existe.
4. El usuario `admin` puede conectarse.
5. El backend arranca sin errores de conexión.
6. Liquibase ejecuta los changelogs.
7. Las tablas del modelo existen.
8. Los datos semilla existen.
9. No hay dependencia de bases de datos antiguas ni de otros proyectos.