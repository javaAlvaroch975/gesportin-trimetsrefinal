#!/bin/bash

# Script de verificación de APIs completas
# Verifica que todas las entidades tienen su Repository, Service y API

echo "======================================"
echo "Verificación de Completitud de APIs"
echo "======================================"
echo ""

# Lista de todas las entidades basadas en database.sql
entities=(
    "Articulo"
    "Carrito"
    "Categoria"
    "Club"
    "Comentario"
    "Compra"
    "Cuota"
    "Equipo"
    "Factura"
    "Jugador"
    "Liga"
    "Noticia"
    "Pago"
    "Partido"
    "Puntuacion"
    "Temporada"
    "Tipoarticulo"
    "Tipousuario"
    "Usuario"
)

base_path="/home/raznara/Proyectos/gesportin/src/main/java/net/ausiasmarch/gesportin"

total=0
complete=0
incomplete=0

for entity in "${entities[@]}"; do
    echo "Verificando: $entity"
    
    entity_file="${base_path}/entity/${entity}Entity.java"
    repo_file="${base_path}/repository/${entity}Repository.java"
    service_file="${base_path}/service/${entity}Service.java"
    api_file="${base_path}/api/${entity}Api.java"
    
    has_entity=false
    has_repo=false
    has_service=false
    has_api=false
    
    [ -f "$entity_file" ] && has_entity=true
    [ -f "$repo_file" ] && has_repo=true
    [ -f "$service_file" ] && has_service=true
    [ -f "$api_file" ] && has_api=true
    
    status="  "
    if $has_entity && $has_repo && $has_service && $has_api; then
        status="✅"
        ((complete++))
    else
        status="❌"
        ((incomplete++))
    fi
    
    echo "  $status Entity: $has_entity | Repository: $has_repo | Service: $has_service | API: $has_api"
    ((total++))
done

echo ""
echo "======================================"
echo "Resumen:"
echo "  Total de entidades: $total"
echo "  Completas (con Entity, Repo, Service y API): $complete"
echo "  Incompletas: $incomplete"
echo "======================================"

if [ $incomplete -eq 0 ]; then
    echo "✅ ¡Todas las APIs están completas!"
    exit 0
else
    echo "⚠️  Hay $incomplete entidades incompletas"
    exit 1
fi
