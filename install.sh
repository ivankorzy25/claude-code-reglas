#!/bin/bash

# Script de instalacion automatica - Sistema Claude Code ULTIMATE v10.0
# Uso: curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/install.sh | bash

set -e

echo "=========================================="
echo "Sistema Claude Code ULTIMATE v10.0"
echo "Instalacion Automatica"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar sistema operativo
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo -e "${BLUE}Sistema detectado: ${MACHINE}${NC}"
echo ""

# Paso 1: Crear directorios
echo -e "${BLUE}[1/4] Creando estructura de directorios...${NC}"
mkdir -p ~/claude-code-global/0000_templates
mkdir -p ~/claude-code-global/0002_hooks_automaticos
mkdir -p ~/claude-code-global/0003_colaboracion
mkdir -p ~/claude-code-global/0004_experiments
mkdir -p ~/claude-code-global/0005_knowledge_base
echo -e "${GREEN}✓ Directorios creados${NC}"
echo ""

# Paso 2: Descargar archivos principales
echo -e "${BLUE}[2/4] Descargando archivos del sistema...${NC}"
cd ~/claude-code-global

curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/SISTEMA_COMPLETO_V10_ULTIMATE.md -o SISTEMA_COMPLETO_V10_ULTIMATE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/INDICE_GENERAL.md -o INDICE_GENERAL.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/GUIA_PORTABILIDAD_Y_BACKUP.md -o GUIA_PORTABILIDAD_Y_BACKUP.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/README.md -o README.md

echo -e "${GREEN}✓ Archivos descargados${NC}"
echo ""

# Paso 3: Configurar Claude Code
echo -e "${BLUE}[3/4] Configurando Claude Code...${NC}"

# Crear directorio .claude si no existe
mkdir -p ~/.claude

# Copiar reglas principales
cp ~/claude-code-global/SISTEMA_COMPLETO_V10_ULTIMATE.md ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md

# Descargar configuracion global
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/CLAUDE.md -o ~/.claude/CLAUDE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/settings.json -o ~/.claude/settings.json

echo -e "${GREEN}✓ Claude Code configurado${NC}"
echo ""

# Paso 4: Verificacion
echo -e "${BLUE}[4/4] Verificando instalacion...${NC}"

if [ -f ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md ] && [ -f ~/.claude/CLAUDE.md ]; then
    echo -e "${GREEN}✓ Instalacion completada exitosamente${NC}"
else
    echo -e "${RED}✗ Error en la instalacion${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}INSTALACION COMPLETADA${NC}"
echo "=========================================="
echo ""
echo "Archivos instalados:"
echo "  ~/.claude/CLAUDE.md"
echo "  ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md"
echo "  ~/.claude/settings.json"
echo "  ~/claude-code-global/"
echo ""
echo "Las reglas se aplicaran automaticamente en tu proxima sesion de Claude Code."
echo ""
echo "Documentacion completa: ~/claude-code-global/"
echo "Para actualizar: volver a ejecutar este script"
echo ""
