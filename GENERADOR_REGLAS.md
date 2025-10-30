# 🤖 Generador Automático de Reglas

> Herramienta inteligente para crear y expandir reglas del Sistema Claude Code de forma automática y consistente

---

## 🚀 Quick Start

### Instalación

```bash
# 1. Dar permisos de ejecución
chmod +x generador_reglas.py

# 2. Ejecutar en modo interactivo
python3 generador_reglas.py --interactivo
```

### Uso Rápido

```bash
# Modo interactivo (recomendado)
python3 generador_reglas.py -i

# Crear regla desde prompt
python3 generador_reglas.py -p "Crear sistema de caché para optimizar consultas"

# Crear regla con categoría específica
python3 generador_reglas.py -p "Implementar autenticación OAuth2" -c seguridad

# Crear y exportar directamente
python3 generador_reglas.py -p "Sistema de logs estructurados" -e REGLAS_NUEVAS.md
```

---

## 📋 Características

### ✨ Principales Funcionalidades

1. **🎯 Generación Automática con IA**
   - Analiza tu prompt y genera reglas inteligentemente
   - Detecta automáticamente la categoría apropiada
   - Estructura profesional y consistente

2. **📝 Plantillas por Categoría**
   - 16 categorías especializadas
   - Templates optimizados para cada tipo
   - Formato Markdown profesional

3. **🔄 Exportación Múltiple**
   - Markdown para documentación
   - JSON para procesamiento
   - Integración con sistema existente

4. **💬 Modo Interactivo**
   - CLI amigable y fácil de usar
   - Guía paso a paso
   - Validación en tiempo real

---

## 🎨 Categorías Disponibles

### 📚 Core System (Básicas)

1. **🔷 fundamentos** - Reglas fundamentales del desarrollo
2. **🔷 claude_avanzado** - Características avanzadas de Claude Code
3. **🔷 autonomia** - Ejecución autónoma sin intervención
4. **🔷 multi_agente** - Arquitectura multi-agente
5. **🔷 mcps** - Model Context Protocol e integraciones
6. **🔷 viabilidad** - Evaluación de proyectos y pragmatismo
7. **🔷 ia_sobre_codigo** - Priorizar capacidades de IA
8. **🔷 sistemas_avanzados** - Sistemas y herramientas avanzadas

### 🆕 Categorías Extendidas (Nuevas)

9. **🔒 seguridad** - Seguridad, autenticación, encriptación
10. **⚡ performance** - Optimización y velocidad
11. **🧪 testing** - Testing, QA y cobertura
12. **🚀 devops** - DevOps, CI/CD, deployments
13. **📚 documentacion** - Documentación avanzada
14. **♿ accesibilidad** - Accesibilidad web (WCAG, a11y)
15. **🌍 internacionalizacion** - i18n, localización
16. **📊 monitoreo** - Observabilidad, logs, métricas

---

## 🎯 Modos de Uso

### 1️⃣ Modo Interactivo (Recomendado)

El modo más fácil para crear múltiples reglas:

```bash
python3 generador_reglas.py --interactivo
```

**Menú de opciones:**

```
📋 Opciones:
1. Crear regla con plantilla       ← Modo guiado, paso a paso
2. Crear regla con IA              ← Prompt libre, IA genera todo
3. Ver categorías disponibles      ← Lista completa de categorías
4. Ver estadísticas                ← Cuántas reglas has creado
5. Exportar a Markdown             ← Guardar reglas generadas
6. Exportar a JSON                 ← Para procesamiento
7. Salir
```

**Flujo de trabajo:**

1. **Crear varias reglas** (opciones 1 o 2)
2. **Ver estadísticas** (opción 4) para confirmar
3. **Exportar** (opción 5) cuando estés listo
4. **Integrar** el archivo generado con tu sistema

---

### 2️⃣ Modo Plantilla (Estructurado)

Para crear reglas con estructura predefinida:

**Paso a paso:**

```bash
python3 generador_reglas.py -i
# Seleccionar opción 1
```

**Ejemplo de sesión:**

```
📝 Crear Regla con Plantilla
----------------------------------------

Categorías disponibles:
1. fundamentos
2. autonomia
3. seguridad
4. performance
...

Selecciona categoría: 3

Título de la regla: Validación de entrada para prevenir XSS

📋 Completa los campos:
riesgo: Cross-Site Scripting en formularios
implementacion: Sanitizar todo input del usuario antes de renderizar
validaciones: - Escape de HTML
- Whitelist de caracteres permitidos
- Content Security Policy
referencias: - OWASP XSS Prevention Cheat Sheet

✅ Regla creada exitosamente!
```

---

### 3️⃣ Modo IA (Prompt Libre)

La forma más rápida - deja que la IA complete todo:

**En modo interactivo:**

```bash
python3 generador_reglas.py -i
# Seleccionar opción 2
```

**Desde línea de comandos:**

```bash
python3 generador_reglas.py -p "Tu descripción aquí"
```

**Ejemplos de prompts:**

```bash
# Simple y directo
python3 generador_reglas.py -p "Implementar rate limiting para APIs"

# Con contexto
python3 generador_reglas.py -p "Sistema de caché Redis para reducir latencia de base de datos en 80%"

# Específico
python3 generador_reglas.py -p "Tests e2e con Playwright para flujos críticos de checkout"
```

**La IA automáticamente:**
- ✅ Detecta la categoría apropiada
- ✅ Extrae el título
- ✅ Genera estructura completa
- ✅ Crea ejemplos de código
- ✅ Añade checklists

---

### 4️⃣ Modo Línea de Comandos

Para automatización y scripts:

```bash
# Crear una regla rápidamente
python3 generador_reglas.py -p "Implementar logging estructurado con Winston"

# Con categoría específica
python3 generador_reglas.py -p "Autenticación biométrica" -c seguridad

# Crear y exportar en un comando
python3 generador_reglas.py -p "Sistema de notificaciones push" -e notificaciones.md
```

---

## 📖 Ejemplos Completos

### Ejemplo 1: Crear Regla de Seguridad

```bash
python3 generador_reglas.py -i
```

```
Selecciona: 2 (Crear regla con IA)

Prompt: Implementar autenticación JWT con refresh tokens y rotación automática

Categoría: seguridad

✅ Regla 107 generada:

## 107. 🔒 Implementar autenticación JWT con refresh tokens

### Riesgo que mitiga:
Sesiones robadas, tokens comprometidos, ataques de replay

### Implementación de seguridad:
- Access tokens de corta duración (15 minutos)
- Refresh tokens en httpOnly cookies
- Rotación automática en cada uso
- Blacklist de tokens revocados

### Validaciones requeridas:
- Validar firma del token
- Verificar expiración
- Comprobar revocación
- Rate limiting en endpoints de auth

...
```

---

### Ejemplo 2: Batch de Reglas de Performance

```bash
python3 generador_reglas.py -i
```

Crear varias reglas:

```
1. "Implementar code splitting en React para reducir bundle size"
2. "Lazy loading de imágenes con Intersection Observer"
3. "Caché de API con React Query y stale-while-revalidate"
4. "Service Worker para caché offline"
```

Exportar todas:

```
Opción 5: Exportar a Markdown
Archivo: REGLAS_PERFORMANCE.md

✅ 4 reglas exportadas a REGLAS_PERFORMANCE.md
```

---

### Ejemplo 3: Integración con Sistema Existente

```bash
# 1. Generar nuevas reglas
python3 generador_reglas.py -i
# ... crear 10 reglas nuevas ...

# 2. Exportar
Opción 5
Archivo: REGLAS_V11_NUEVAS.md

# 3. Revisar el archivo generado
cat REGLAS_V11_NUEVAS.md

# 4. Integrar manualmente con SISTEMA_COMPLETO_V10_ULTIMATE.md
# (Copiar y pegar las reglas relevantes)
```

---

## 🎯 Casos de Uso

### 🏢 Para Equipos de Desarrollo

**Estandarizar prácticas:**

```bash
# Líder técnico crea reglas de arquitectura
python3 generador_reglas.py -p "Todos los servicios deben exponer métricas Prometheus"
python3 generador_reglas.py -p "APIs REST siguiendo estándar OpenAPI 3.0"
python3 generador_reglas.py -p "Logs estructurados en formato JSON"

# Exportar estándares del equipo
python3 generador_reglas.py -e ESTANDARES_EQUIPO.md
```

---

### 🎓 Para Aprendizaje

**Crear guías de mejores prácticas:**

```bash
python3 generador_reglas.py -p "Principios SOLID con ejemplos en TypeScript"
python3 generador_reglas.py -p "Patrones de diseño: Factory, Builder, Singleton"
python3 generador_reglas.py -p "Clean Code: naming conventions y funciones puras"
```

---

### 🔄 Para Migración de Proyectos

**Documentar proceso de migración:**

```bash
python3 generador_reglas.py -p "Migrar de JavaScript a TypeScript gradualmente"
python3 generador_reglas.py -p "Actualizar de React 17 a React 18 con Concurrent Features"
python3 generador_reglas.py -p "Migración de REST a GraphQL sin downtime"
```

---

### 🚀 Para Nuevos Proyectos

**Setup inicial automatizado:**

```bash
# Generar reglas de setup
python3 generador_reglas.py -p "Configuración de ESLint y Prettier"
python3 generador_reglas.py -p "Setup de Husky con pre-commit hooks"
python3 generador_reglas.py -p "Estructura de carpetas según Clean Architecture"

# Exportar como checklist de proyecto nuevo
python3 generador_reglas.py -e PROJECT_SETUP_CHECKLIST.md
```

---

## 📊 Estructura de Salida

### Markdown (REGLAS_GENERADAS.md)

```markdown
# 🤖 Reglas Generadas Automáticamente

> Sistema Claude Code - Extensión Automática de Reglas
> Fecha de generación: 2025-10-30 15:30:00
> Total de reglas generadas: 5

---

## 📋 Índice de Reglas Generadas

- [107. Sistema de caché con Redis](#107-sistema-de-caché-con-redis)
- [108. Autenticación OAuth2](#108-autenticación-oauth2)
- [109. Tests E2E con Playwright](#109-tests-e2e-con-playwright)
...

---

## 107. ⚡ Sistema de caché con Redis

### Problema de performance:
Consultas lentas a base de datos afectan UX

### Solución optimizada:
...
```

---

### JSON (reglas_generadas.json)

```json
[
  {
    "numero": 107,
    "categoria": "performance",
    "titulo": "Sistema de caché con Redis",
    "contenido": "## 107. ⚡ Sistema...",
    "fecha_creacion": "2025-10-30T15:30:00.123456"
  },
  ...
]
```

---

## 🔧 Personalización

### Agregar Nueva Categoría

Edita `generador_reglas.py`:

```python
# En __init__, agregar a self.categorias:
"mi_categoria": "🎨 Mi Categoría Custom"

# En _inicializar_plantillas(), agregar:
"mi_categoria": {
    "estructura": """## {numero}. {emoji} {titulo}

### Mi campo custom:
{mi_campo}

### Ejemplo:
```{lenguaje}
{ejemplo}
```
---
""",
    "emoji_default": "🎨",
    "prioridad_default": "Media"
}
```

---

### Modificar Plantillas

Las plantillas usan formato Python `.format()`:

- `{numero}` - Número de regla (auto)
- `{titulo}` - Título de la regla
- `{emoji}` - Emoji de la categoría
- `{prioridad}` - Alta, Media, Baja, Crítica
- `{lenguaje}` - javascript, python, bash, etc.
- Cualquier campo custom que agregues

---

## 🐛 Troubleshooting

### Problema: "ModuleNotFoundError"

**Solución:**
```bash
# Verificar versión de Python
python3 --version  # Debe ser >= 3.6

# Si no tienes Python 3
sudo apt install python3  # Ubuntu/Debian
brew install python3      # macOS
```

---

### Problema: "Permission denied"

**Solución:**
```bash
chmod +x generador_reglas.py
```

---

### Problema: Reglas no se exportan

**Solución:**
```bash
# Verificar permisos de escritura
ls -la

# Especificar ruta absoluta
python3 generador_reglas.py -e /home/user/mis_reglas.md
```

---

## 🎓 Tips y Mejores Prácticas

### ✅ DO (Hacer)

1. **Usa prompts descriptivos:**
   - ❌ "Optimización"
   - ✅ "Optimizar consultas SQL con índices y EXPLAIN ANALYZE"

2. **Revisa antes de exportar:**
   - Usa estadísticas (opción 4)
   - Genera varias reglas en una sesión
   - Exporta cuando tengas un set completo

3. **Integra con tu workflow:**
   - Crea reglas al inicio de proyecto
   - Documenta decisiones técnicas como reglas
   - Comparte reglas con el equipo

---

### ❌ DON'T (No Hacer)

1. **No uses prompts vagos:**
   - "Mejorar código"
   - "Hacer mejor"
   - "Optimizar todo"

2. **No mezcles múltiples conceptos:**
   - Crea una regla por concepto
   - Divide reglas complejas en varias

3. **No ignores las categorías:**
   - La categoría correcta mejora la estructura
   - Si dudas, usa detección automática

---

## 🚀 Próximos Pasos

### 1. Empieza Simple

```bash
# Primera vez - crea una regla de prueba
python3 generador_reglas.py -i
# Opción 2: Crear con IA
# Prompt: "Sistema de logging básico"
```

### 2. Experimenta con Categorías

```bash
# Prueba diferentes tipos
python3 generador_reglas.py -p "Validar emails con regex" -c seguridad
python3 generador_reglas.py -p "Comprimir assets con gzip" -c performance
python3 generador_reglas.py -p "Setup de Jest" -c testing
```

### 3. Crea tu Set de Reglas

```bash
# Genera 5-10 reglas para tu proyecto
# Exporta todas juntas
# Integra con tu SISTEMA_COMPLETO
```

---

## 📞 Soporte

### ¿Necesitas ayuda?

1. **Lee esta guía completa** 📖
2. **Experimenta con ejemplos** 🧪
3. **Revisa el código** - está bien comentado 💻
4. **Crea un issue en GitHub** si encuentras bugs 🐛

---

## 📈 Roadmap

### v1.1 (Próximo)

- [ ] Importar reglas existentes para análisis
- [ ] Sugerir mejoras a reglas existentes
- [ ] Detectar duplicados
- [ ] Merge inteligente con sistema existente

### v1.2 (Futuro)

- [ ] Integración con Claude API para generación más inteligente
- [ ] Templates visuales con diagrams
- [ ] Exportar a otros formatos (HTML, PDF)
- [ ] Validación automática de reglas

---

## 🎉 ¡Empieza Ahora!

```bash
# 1. Da permisos
chmod +x generador_reglas.py

# 2. Ejecuta
python3 generador_reglas.py -i

# 3. ¡Crea reglas increíbles!
```

---

**🤖 Generador Automático de Reglas v1.0**

*Parte del Sistema Claude Code Ultimate v10.0*

*Creado por: ivankorzy25*

---

**[⬆ Volver arriba](#-generador-automático-de-reglas)**
