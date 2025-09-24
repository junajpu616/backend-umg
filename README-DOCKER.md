# 🐳 Guía de Docker para Backend UMG

Esta guía te ayudará a ejecutar el proyecto Backend UMG usando Docker y Docker Compose, incluyendo PostgreSQL en contenedores.

## 📋 Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Al menos 2GB de RAM disponible

## 🚀 Inicio Rápido

### 1. Clonar y preparar el proyecto

```bash
git clone <tu-repositorio>
cd backend-umg
```

### 2. Ejecutar con Docker Compose

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# O ejecutar en segundo plano
docker-compose up -d --build
```

### 3. Verificar que todo funciona

- **API Backend**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api-docs
- **PgAdmin** (opcional): http://localhost:8080

## 📁 Estructura de Archivos Docker

```
├── dockerfile              # Imagen del backend
├── docker-compose.yml      # Orquestación de servicios
├── .dockerignore           # Archivos a ignorar en build
├── .env.docker            # Variables de entorno para Docker
├── scripts/
│   └── docker-init.sh     # Script de inicialización
└── README-DOCKER.md       # Esta guía
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (⚠️ elimina datos de BD)
docker-compose down -v

# Reconstruir solo el backend
docker-compose build backend

# Ejecutar comandos dentro del contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d backend_umg
```

### Gestión de Base de Datos

```bash
# Ejecutar migraciones manualmente
docker-compose exec backend npx prisma migrate deploy

# Ejecutar seeding
docker-compose exec backend npm run seed

# Generar cliente Prisma
docker-compose exec backend npx prisma generate

# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status
```

## 🔧 Configuración

### Variables de Entorno

Las variables están configuradas en `.env.docker`:

```env
# PostgreSQL
POSTGRES_DB=backend_umg
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Backend
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/backend_umg?schema=public"
JWT_SECRET="tu_jwt_secreto_super_seguro_cambialo_en_produccion"
PORT=3000
```

### Servicios Incluidos

1. **postgres**: Base de datos PostgreSQL 15
   - Puerto: 5432
   - Usuario: postgres
   - Contraseña: postgres123
   - Base de datos: backend_umg

2. **backend**: API Node.js con Prisma
   - Puerto: 3000
   - Dependencias: postgres
   - Auto-migraciones al iniciar

3. **pgadmin** (opcional): Interfaz web para PostgreSQL
   - Puerto: 8080
   - Email: admin@admin.com
   - Contraseña: admin123

### Habilitar PgAdmin

```bash
# Ejecutar con PgAdmin incluido
docker-compose --profile tools up -d
```

## 🔄 Desarrollo

### Modo Desarrollo con Hot Reload

Para desarrollo, puedes habilitar hot reload editando `docker-compose.yml`:

```yaml
backend:
  # ... otras configuraciones
  volumes:
    - .:/app
    - /app/node_modules
  environment:
    NODE_ENV: development
```

### Ejecutar Comandos de Desarrollo

```bash
# Instalar nuevas dependencias
docker-compose exec backend npm install <paquete>

# Ejecutar tests (si los tienes)
docker-compose exec backend npm test

# Acceder al shell del contenedor
docker-compose exec backend sh
```

## 🐛 Solución de Problemas

### El backend no se conecta a PostgreSQL

1. Verificar que PostgreSQL esté saludable:
   ```bash
   docker-compose ps
   ```

2. Ver logs de PostgreSQL:
   ```bash
   docker-compose logs postgres
   ```

3. Verificar conectividad:
   ```bash
   docker-compose exec backend ping postgres
   ```

### Error en migraciones

```bash
# Resetear migraciones (⚠️ elimina datos)
docker-compose exec backend npx prisma migrate reset

# O aplicar migraciones manualmente
docker-compose exec backend npx prisma migrate deploy
```

### Problemas de permisos

```bash
# Reconstruir imagen sin caché
docker-compose build --no-cache backend

# Verificar permisos del usuario
docker-compose exec backend whoami
```

### Limpiar todo y empezar de nuevo

```bash
# Parar y eliminar todo
docker-compose down -v --rmi all

# Limpiar imágenes huérfanas
docker system prune -f

# Reconstruir desde cero
docker-compose up --build
```

## 📊 Monitoreo

### Ver recursos utilizados

```bash
# Estadísticas de contenedores
docker stats

# Espacio utilizado
docker system df
```

### Backup de Base de Datos

```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres backend_umg > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres backend_umg < backup.sql
```

## 🚀 Producción

Para producción, considera:

1. **Cambiar credenciales** en `.env.docker`
2. **Usar secretos** de Docker Swarm o Kubernetes
3. **Configurar reverse proxy** (nginx, traefik)
4. **Habilitar HTTPS**
5. **Configurar backups automáticos**
6. **Monitoreo y logging**

### Ejemplo para producción

```bash
# Usar archivo de compose específico para producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración de red: `docker network ls`
3. Consulta la documentación de Docker
4. Abre un issue en el repositorio

---

¡Feliz desarrollo con Docker! 🐳✨
