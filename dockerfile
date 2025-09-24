# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente de Prisma
RUN npx prisma generate

# Etapa de producción
FROM node:18-alpine AS production

# Instalar dependencias del sistema
RUN apk add --no-cache openssl dumb-init

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias desde la etapa base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/generated ./generated

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando de inicio con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
