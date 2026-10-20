# Base de datos de la clínica

Esta carpeta tiene `clinica.sql`, una copia de la base hecha con `pg_dump`. El archivo crea las tablas y carga datos de prueba.

Todos los comandos se ejecutan en PowerShell, desde la raíz del repo. Si tu PostgreSQL no es la versión 18, cambiá el `18` de la ruta por tu versión.

## 1. Crear la base vacía

El archivo no crea la base, así que primero hay que crearla:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -h localhost -U postgres clinicadb
```

Te va a pedir la contraseña de tu usuario `postgres`.

## 2. Importar el archivo

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d clinicadb -f backend\database\clinica.sql
```

Para comprobar que se importó, listá las tablas:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d clinicadb -c "\dt"
```

Tienen que aparecer `medicos`, `migrations`, `reservas` y `usuarios`.

### Si falla en `\restrict` o `\unrestrict`

Las versiones nuevas de PostgreSQL agregan una línea `\restrict ...` al principio del archivo y otra `\unrestrict ...` al final. Un `psql` viejo no las reconoce y da error.

Para solucionarlo:

1. Abrí `clinica.sql` con un editor de texto.
2. Borrá la línea que empieza con `\restrict` y la que empieza con `\unrestrict`.
3. Borrá la base con `dropdb.exe` (está en la misma carpeta que `createdb.exe`), creala de nuevo (paso 1) y volvé a importar (paso 2).

## 3. Configurar el backend

1. Copiá `backend/.env.example` y llamá a la copia `backend/.env`.
2. Completá los valores con los datos de tu PC:
   - `DB_PASSWORD`: la contraseña de tu usuario `postgres`.
   - `DB_NAME`: `clinicadb`, o el nombre que hayas usado en el paso 1.
   - `JWT_SECRET`: cualquier texto largo que inventes.

El archivo `.env` no se sube a git.

## 4. Usuarios de prueba

Todos usan la clave `password123`:

| Email | Rol |
|---|---|
| admin1@clinica.com | Administrador |
| medico1@clinica.com | Médico |
| paciente1@clinica.com | Paciente |
