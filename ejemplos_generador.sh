#!/bin/bash
# 🎯 Ejemplos de Uso del Generador de Reglas
# Script de demostración con casos de uso reales

echo "🤖 Generador Automático de Reglas - Ejemplos de Uso"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ejemplo 1: Regla de Seguridad
echo -e "${BLUE}📋 Ejemplo 1: Generando regla de Seguridad${NC}"
python3 generador_reglas.py -p "Implementar rate limiting para prevenir ataques de fuerza bruta en endpoints de login" -c seguridad
echo ""

# Ejemplo 2: Regla de Performance
echo -e "${BLUE}📋 Ejemplo 2: Generando regla de Performance${NC}"
python3 generador_reglas.py -p "Implementar lazy loading de imágenes con Intersection Observer para mejorar tiempo de carga inicial" -c performance
echo ""

# Ejemplo 3: Regla de Testing
echo -e "${BLUE}📋 Ejemplo 3: Generando regla de Testing${NC}"
python3 generador_reglas.py -p "Configurar tests E2E con Playwright para flujos críticos de usuario" -c testing
echo ""

# Ejemplo 4: Regla de DevOps
echo -e "${BLUE}📋 Ejemplo 4: Generando regla de DevOps${NC}"
python3 generador_reglas.py -p "Setup de pipeline CI/CD con GitHub Actions incluyendo tests, linting y deploy automático" -c devops
echo ""

# Ejemplo 5: Regla de IA sobre Código
echo -e "${BLUE}📋 Ejemplo 5: Generando regla de IA sobre Código${NC}"
python3 generador_reglas.py -p "Usar Claude Code para generar documentación automática en lugar de escribir README manualmente" -c ia_sobre_codigo
echo ""

# Exportar todas las reglas
echo -e "${GREEN}✅ Exportando todas las reglas generadas...${NC}"
python3 generador_reglas.py -e EJEMPLOS_COMPLETOS.md
echo ""

echo -e "${GREEN}🎉 ¡Ejemplos completados!${NC}"
echo ""
echo "Archivos generados:"
echo "  📄 EJEMPLOS_COMPLETOS.md - Todas las reglas en Markdown"
echo ""
echo "Para ver las reglas generadas:"
echo "  cat EJEMPLOS_COMPLETOS.md"
echo ""
echo "Para usar el modo interactivo:"
echo "  python3 generador_reglas.py -i"
