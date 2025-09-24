#!/bin/bash

# Script de inicialización para Docker
# Este script maneja la inicialización de la base de datos y migraciones

set -e

echo "🐳 Iniciando configuración de Docker para Backend UMG..."

# Función para esperar a que PostgreSQL esté listo
wait_for_postgres() {
    echo "⏳ Esperando a que PostgreSQL esté disponible..."
    
    until pg_isready -h postgres -p 5432 -U postgres; do
        echo "PostgreSQL no está listo - esperando..."
        sleep 2
    done
    
    echo "✅ PostgreSQL está listo!"
}

# Función para ejecutar migraciones
run_migrations() {
    echo "🔄 Ejecutando migraciones de Prisma..."
    
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Migraciones ejecutadas exitosamente"
    else
        echo "❌ Error al ejecutar migraciones"
        exit 1
    fi
}

# Función para ejecutar seeding (opcional)
run_seed() {
    if [ "$RUN_SEED" = "true" ]; then
        echo "🌱 Ejecutando seeding de datos iniciales..."
        
        npm run seed
        
        if [ $? -eq 0 ]; then
            echo "✅ Seeding ejecutado exitosamente"
        else
            echo "⚠️  Warning: Error al ejecutar seeding (continuando...)"
        fi
    fi
}

# Función principal
main() {
    echo "🚀 Iniciando Backend UMG..."
    
    # Esperar a PostgreSQL
    wait_for_postgres
    
    # Ejecutar migraciones
    run_migrations
    
    # Ejecutar seeding si está habilitado
    run_seed
    
    echo "🎉 Inicialización completada. Iniciando servidor..."
    
    # Iniciar la aplicación
    exec npm start
}

# Ejecutar función principal
main "$@"
