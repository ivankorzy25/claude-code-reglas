# Guia de Instalacion - Sistema Claude Code ULTIMATE v10.0

## Instalacion Automatica (Linux/Mac)

### Metodo 1: Script de Instalacion (Recomendado)

```bash
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/install.sh | bash
```

### Metodo 2: Instalacion Manual

#### Paso 1: Crear Directorios

```bash
# Crear directorio global
mkdir -p ~/claude-code-global

# Crear estructura de directorios
mkdir -p ~/claude-code-global/0000_templates
mkdir -p ~/claude-code-global/0002_hooks_automaticos
mkdir -p ~/claude-code-global/0003_colaboracion
mkdir -p ~/claude-code-global/0004_experiments
mkdir -p ~/claude-code-global/0005_knowledge_base
```

#### Paso 2: Descargar Archivos

```bash
cd ~/claude-code-global

# Descargar archivos principales
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/SISTEMA_COMPLETO_V10_ULTIMATE.md -o SISTEMA_COMPLETO_V10_ULTIMATE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/INDICE_GENERAL.md -o INDICE_GENERAL.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/GUIA_PORTABILIDAD_Y_BACKUP.md -o GUIA_PORTABILIDAD_Y_BACKUP.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/README.md -o README.md
```

#### Paso 3: Configurar Claude Code

```bash
# Copiar reglas a configuracion global de Claude
cp ~/claude-code-global/SISTEMA_COMPLETO_V10_ULTIMATE.md ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md

# Descargar archivos de configuracion
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/CLAUDE.md -o ~/.claude/CLAUDE.md
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/settings.json -o ~/.claude/settings.json
```

#### Paso 4: Actualizar Permisos (Opcional)

Agregar a `~/.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Read(//home/$USER/claude-code-global/**)",
      "Read(//home/$USER/.claude/**)",
      "Bash(git:*)"
    ]
  }
}
```

## Instalacion en Windows

### PowerShell

```powershell
# Crear directorios
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global\0000_templates"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global\0002_hooks_automaticos"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global\0003_colaboracion"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global\0004_experiments"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\claude-code-global\0005_knowledge_base"

# Descargar archivos
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/SISTEMA_COMPLETO_V10_ULTIMATE.md" -OutFile "$env:USERPROFILE\claude-code-global\SISTEMA_COMPLETO_V10_ULTIMATE.md"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/CLAUDE.md" -OutFile "$env:USERPROFILE\.claude\CLAUDE.md"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/config/settings.json" -OutFile "$env:USERPROFILE\.claude\settings.json"

# Copiar reglas
Copy-Item "$env:USERPROFILE\claude-code-global\SISTEMA_COMPLETO_V10_ULTIMATE.md" "$env:USERPROFILE\.claude\SISTEMA_COMPLETO_V10_ULTIMATE.md"
```

## Verificacion de Instalacion

### Verificar archivos instalados:

```bash
# Linux/Mac
ls -lh ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md
ls -lh ~/.claude/CLAUDE.md
ls -lh ~/claude-code-global/

# Windows PowerShell
dir $env:USERPROFILE\.claude\SISTEMA_COMPLETO_V10_ULTIMATE.md
dir $env:USERPROFILE\.claude\CLAUDE.md
dir $env:USERPROFILE\claude-code-global\
```

### Verificar que funciona:

1. Abre Claude Code en cualquier proyecto
2. Las reglas deberian aplicarse automaticamente
3. Verifica que Claude mencione las reglas al inicio

## Estructura Final

```
~/.claude/
├── CLAUDE.md                          # Configuracion global
├── SISTEMA_COMPLETO_V10_ULTIMATE.md   # 106 reglas completas
├── settings.json                       # Variables de entorno
└── settings.local.json                 # Permisos locales

~/claude-code-global/
├── SISTEMA_COMPLETO_V10_ULTIMATE.md   # Backup de reglas
├── INDICE_GENERAL.md
├── GUIA_PORTABILIDAD_Y_BACKUP.md
├── README.md
├── 0000_templates/                     # Templates de proyectos
├── 0002_hooks_automaticos/             # Hooks pre/post
├── 0003_colaboracion/                  # Recursos de equipo
├── 0004_experiments/                   # Experimentos
└── 0005_knowledge_base/                # Base de conocimiento
```

## Uso en Proyectos Nuevos

### Opcion 1: Usar configuracion global (por defecto)
Las reglas se aplican automaticamente. No hay que hacer nada.

### Opcion 2: Personalizar por proyecto
Crear `.claude/CLAUDE.md` en el proyecto:

```markdown
# Configuracion del Proyecto

## Reglas Globales
APLICAR reglas de: ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md

## Reglas Especificas del Proyecto
- [Regla especifica 1]
- [Regla especifica 2]
```

## Actualizacion

```bash
# Actualizar reglas
cd ~/claude-code-global
curl -sL https://raw.githubusercontent.com/ivankorzy25/claude-code-reglas/main/SISTEMA_COMPLETO_V10_ULTIMATE.md -o SISTEMA_COMPLETO_V10_ULTIMATE.md
cp SISTEMA_COMPLETO_V10_ULTIMATE.md ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md
```

## Desinstalacion

```bash
# Eliminar configuracion global
rm -rf ~/claude-code-global
rm ~/.claude/CLAUDE.md
rm ~/.claude/SISTEMA_COMPLETO_V10_ULTIMATE.md

# Restaurar settings.json original (hacer backup primero)
# rm ~/.claude/settings.json
```

## Soporte

- Reportar issues: https://github.com/ivankorzy25/claude-code-reglas/issues
- Documentacion completa: Ver archivos en ~/claude-code-global/
