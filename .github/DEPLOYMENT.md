# Configuración de Deployment en GitHub Actions

Este proyecto usa GitHub Actions para compilar y desplegar automáticamente la aplicación cuando se hace merge a `main`.

## Secretos requeridos en GitHub

Para que el pipeline funcione correctamente, debes configurar los siguientes **Secrets** en tu repositorio de GitHub:

### Cómo agregar secretos en GitHub:
1. Ve a tu repositorio en GitHub
2. Navega a: **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Agrega cada uno de los siguientes secretos:

---

### Secretos necesarios:

#### `SERVER_HOST` (obligatorio)
- **Descripción:** Dirección IP o dominio del servidor de producción
- **Ejemplo:** `192.168.1.100` o `servidor.midominio.com`

#### `SERVER_USER` (obligatorio)
- **Descripción:** Usuario SSH para conectarse al servidor
- **Ejemplo:** `ubuntu`, `root`, `deploy`

#### `SSH_PRIVATE_KEY` (obligatorio)
- **Descripción:** Clave privada SSH para autenticación
- **Cómo obtenerla:**
  1. En tu servidor, genera un par de claves SSH (si no lo has hecho):
     ```bash
     ssh-keygen -t ed25519 -C "github-actions-deploy"
     ```
  2. Agrega la clave pública al archivo `~/.ssh/authorized_keys` del servidor:
     ```bash
     cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
     ```
  3. Copia el contenido de la clave PRIVADA:
     ```bash
     cat ~/.ssh/id_ed25519
     ```
  4. Pega TODO el contenido (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`) en el secreto de GitHub

#### `SERVER_DEPLOY_PATH` (obligatorio)
- **Descripción:** Ruta completa en el servidor donde se desplegarán los archivos
- **Ejemplo:** `/var/www/html/alianza-app` o `/home/ubuntu/app/public`

#### `SERVER_PORT` (opcional)
- **Descripción:** Puerto SSH del servidor (por defecto es 22)
- **Ejemplo:** `22`, `2222`
- Si no se proporciona, se usa el puerto 22 por defecto

---

## Variables de entorno de producción

El pipeline usa automáticamente las siguientes variables de entorno durante la compilación:

```env
VITE_BACKEND_URL=/api/
VITE_ZONA_0=12
```

Estas están configuradas directamente en el archivo [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

---

## Flujo de deployment

1. Cuando se hace merge de una Pull Request a `main` (o push directo a `main`)
2. GitHub Actions ejecuta automáticamente el workflow
3. Instala las dependencias (`npm ci`)
4. Compila la aplicación con Vite (`npm run build`)
5. Envía los archivos compilados (carpeta `dist/`) al servidor vía SCP
6. Los archivos se colocan en `SERVER_DEPLOY_PATH` en el servidor
7. Reinicia Nginx para aplicar los cambios

---

## Configuración adicional requerida en el servidor

Para que el pipeline pueda reiniciar Nginx, el usuario SSH debe tener permisos sudo sin contraseña para el comando nginx.

**Configurar permisos sudo para Nginx:**

1. En el servidor, edita el archivo sudoers:
   ```bash
   sudo visudo
   ```

2. Agrega esta línea al final (reemplaza `ubuntu` con tu `SERVER_USER`):
   ```
   ubuntu ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx, /usr/bin/systemctl restart nginx
   ```

3. Guarda y cierra el editor (Ctrl+X, luego Y, luego Enter)

4. Verifica que funciona:
   ```bash
   sudo systemctl reload nginx
   ```
   (No debe pedir contraseña)

---

## Validar el deployment

Después del primer deployment, verifica:

1. Que los archivos estén en la ruta correcta del servidor:
   ```bash
   ssh user@server "ls -la /ruta/deploy"
   ```

2. Que el servidor web (nginx/apache) esté configurado para servir desde esa ruta

3. Que la aplicación funcione correctamente accediendo desde el navegador

---

## Troubleshooting

### Error de permisos SSH
- Verifica que la clave privada esté completa en el secreto
- Asegúrate de que el usuario tenga permisos en `SERVER_DEPLOY_PATH`

### Error de conexión
- Verifica que `SERVER_HOST` y `SERVER_PORT` sean correctos
- Asegúrate de que el servidor permita conexiones SSH desde IPs externas

### Archivos no aparecen en el servidor
- Verifica que `SERVER_DEPLOY_PATH` exista en el servidor
- Revisa los logs del workflow en GitHub Actions para más detalles
