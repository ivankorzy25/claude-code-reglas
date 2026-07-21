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
echo -e "${BLUE}[1/5] Creando estructura de directorios...${NC}"
mkdir -p ~/claude-code-global/0000_templates
mkdir -p ~/claude-code-global/0002_hooks_automaticos
mkdir -p ~/claude-code-global/0003_colaboracion
mkdir -p ~/claude-code-global/0004_experiments
mkdir -p ~/claude-code-global/0005_knowledge_base
echo -e "${GREEN}✓ Directorios creados${NC}"
echo ""

# Paso 2: Descargar archivos principales
echo -e "${BLUE}[2/5] Descargando archivos del sistema...${NC}"
cd ~/claude-code-global

curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/SISTEMA_COMPLETO_V10_ULTIMATE.md -o SISTEMA_COMPLETO_V10_ULTIMATE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/INDICE_GENERAL.md -o INDICE_GENERAL.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/GUIA_PORTABILIDAD_Y_BACKUP.md -o GUIA_PORTABILIDAD_Y_BACKUP.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/README.md -o README.md

echo -e "${GREEN}✓ Archivos descargados${NC}"
echo ""

# Paso 3: Configurar Claude Code
echo -e "${BLUE}[3/5] Configurando Claude Code...${NC}"

# Crear directorio .claude si no existe
mkdir -p ~/.claude

# Copiar reglas principales
cp ~/claude-code-global/SISTEMA_COMPLETO_V10_ULTIMATE.md ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md

# Descargar configuracion global
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/CLAUDE.md -o ~/.claude/CLAUDE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/settings.json -o ~/.claude/settings.json

echo -e "${GREEN}✓ Claude Code configurado${NC}"
echo ""

# Paso 4: MCP de Firebase (gratis, sin tarjeta, control total via login de Google)
echo -e "${BLUE}[4/5] Configurando MCP de Firebase...${NC}"
if command -v claude >/dev/null 2>&1; then
    claude mcp add --scope user firebase -- npx -y firebase-tools@latest mcp >/dev/null 2>&1 || true
    echo -e "${GREEN}✓ MCP de Firebase registrado (disponible en todos tus proyectos)${NC}"
    echo "  La primera vez que Claude lo use te va a pedir 'firebase login' (gratis, con tu cuenta de Google, sin tarjeta)."
else
    echo "  'claude' CLI no encontrado, se omite. Despues podes correr:"
    echo "  claude mcp add --scope user firebase -- npx -y firebase-tools@latest mcp"
fi
echo ""

# Paso 5: Verificacion
echo -e "${BLUE}[5/5] Verificando instalacion...${NC}"

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
echo "  MCP de Firebase (correr 'firebase login' una vez para activarlo)"
echo ""
echo "Las reglas se aplicaran automaticamente en tu proxima sesion de Claude Code."
echo ""
echo "Documentacion completa: ~/claude-code-global/"
echo "Para actualizar: volver a ejecutar este script"
echo ""
