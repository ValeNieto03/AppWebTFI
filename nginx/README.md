# Ejecutar con nginx y PM2

Esta guía describe cómo servir Angular con nginx y mantener NestJS en ejecución con PM2.

## 1. Preparar el proyecto

Seguí primero `backend/database/README.md` para crear la base, importar los datos y configurar `backend/.env`.

Instalá PM2 una sola vez desde PowerShell:

```powershell
npm install -g pm2
```

## 2. Compilar y copiar Angular

Los siguientes comandos se ejecutan desde la raíz del repositorio. Si nginx está instalado en otra carpeta, cambiá el valor de `$rutaNginx`.

```powershell
$rutaNginx = 'C:\nginx'
npm --prefix .\frontend ci
npm --prefix .\frontend run build
New-Item -ItemType Directory -Force "$rutaNginx\html\clinica" | Out-Null
Copy-Item .\frontend\dist\frontend\browser\* "$rutaNginx\html\clinica" -Recurse -Force
Copy-Item .\nginx\nginx.conf "$rutaNginx\conf\nginx.conf" -Force
```

nginx busca `index.html` y los archivos compilados dentro de `html/clinica`.

## 3. Iniciar NestJS con PM2

Desde la carpeta `backend`, instalá las dependencias y ejecutá el script de despliegue:

```powershell
Set-Location .\backend
npm ci
npm run deploy
pm2 status
```

El archivo `ecosystem.config.json` inicia `dist/main.js` con `PORT=3000`. Las credenciales de PostgreSQL y `JWT_SECRET` se leen desde `backend/.env`; no se guardan en la configuración de PM2.

## 4. Revisar e iniciar nginx

Desde la raíz del repositorio, comprobá la configuración y después iniciá nginx:

```powershell
Set-Location ..
& "$rutaNginx\nginx.exe" -t -p "$rutaNginx\" -c conf\nginx.conf
& "$rutaNginx\nginx.exe" -p "$rutaNginx\" -c conf\nginx.conf
```

Abrí `http://localhost` para Angular y `http://localhost/api` para Swagger. nginx entrega Angular y reenvía las rutas `/api` al backend.

Para detener los procesos:

```powershell
pm2 stop clinica-backend
& "$rutaNginx\nginx.exe" -s stop -p "$rutaNginx\" -c conf\nginx.conf
```
