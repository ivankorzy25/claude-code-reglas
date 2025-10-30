#!/usr/bin/env python3
"""
🤖 Generador Automático de Reglas - Claude Code System
Versión: 1.0.0
Autor: ivankorzy25
Descripción: Generador inteligente de reglas para expandir el sistema Claude Code
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import argparse


class GeneradorReglas:
    """Generador automático de reglas para Claude Code"""

    def __init__(self):
        self.reglas = []
        self.numero_actual = 107  # Siguiente regla después de v10.0
        self.categorias = {
            "fundamentos": "🔷 Fundamentos",
            "claude_avanzado": "🔷 Claude Code Avanzado",
            "autonomia": "🔷 Autonomía Total",
            "multi_agente": "🔷 Multi-Agente",
            "mcps": "🔷 MCPs e Integraciones",
            "viabilidad": "🔷 Viabilidad y Pragmatismo",
            "ia_sobre_codigo": "🔷 IA sobre Código",
            "sistemas_avanzados": "🔷 Sistemas Avanzados",
            "seguridad": "🔒 Seguridad y Privacidad",
            "performance": "⚡ Performance y Optimización",
            "testing": "🧪 Testing y QA",
            "devops": "🚀 DevOps y CI/CD",
            "documentacion": "📚 Documentación Avanzada",
            "accesibilidad": "♿ Accesibilidad",
            "internacionalizacion": "🌍 Internacionalización",
            "monitoreo": "📊 Monitoreo y Observabilidad"
        }

        self.plantillas = self._inicializar_plantillas()

    def _inicializar_plantillas(self) -> Dict[str, Dict]:
        """Inicializa plantillas de reglas por categoría"""
        return {
            "fundamentos": {
                "estructura": """## {numero}. {emoji} {titulo}

### Descripción:
{descripcion}

### Regla:
{regla}

### Ejemplo:
```{lenguaje}
{ejemplo}
```

### Checklist:
{checklist}

### Prioridad: {prioridad}
---
""",
                "emoji_default": "📋",
                "prioridad_default": "Alta"
            },
            "autonomia": {
                "estructura": """## {numero}. {emoji} {titulo}

### Objetivo:
{objetivo}

### Implementación:
{implementacion}

### Condiciones:
{condiciones}

### Ejemplo de uso:
```{lenguaje}
{ejemplo}
```

### Prioridad: {prioridad}
---
""",
                "emoji_default": "🤖",
                "prioridad_default": "Crítica"
            },
            "ia_sobre_codigo": {
                "estructura": """## {numero}. {emoji} {titulo}

### Filosofía:
{filosofia}

### Aplicación:
{aplicacion}

### Casos de uso:
{casos_uso}

### Anti-patrones a evitar:
{antipatrones}

### Ejemplo práctico:
```{lenguaje}
{ejemplo}
```

### Prioridad: {prioridad}
---
""",
                "emoji_default": "🧠",
                "prioridad_default": "Muy Alta"
            },
            "seguridad": {
                "estructura": """## {numero}. {emoji} {titulo}

### Riesgo que mitiga:
{riesgo}

### Implementación de seguridad:
{implementacion}

### Validaciones requeridas:
{validaciones}

### Código seguro:
```{lenguaje}
{ejemplo}
```

### Referencias:
{referencias}

### Prioridad: {prioridad}
---
""",
                "emoji_default": "🔒",
                "prioridad_default": "Crítica"
            },
            "performance": {
                "estructura": """## {numero}. {emoji} {titulo}

### Problema de performance:
{problema}

### Solución optimizada:
{solucion}

### Métricas esperadas:
{metricas}

### Implementación:
```{lenguaje}
{ejemplo}
```

### Benchmarks:
{benchmarks}

### Prioridad: {prioridad}
---
""",
                "emoji_default": "⚡",
                "prioridad_default": "Alta"
            },
            "testing": {
                "estructura": """## {numero}. {emoji} {titulo}

### Tipo de test:
{tipo_test}

### Cobertura requerida:
{cobertura}

### Estrategia de testing:
{estrategia}

### Ejemplo de test:
```{lenguaje}
{ejemplo}
```

### Herramientas recomendadas:
{herramientas}

### Prioridad: {prioridad}
---
""",
                "emoji_default": "🧪",
                "prioridad_default": "Alta"
            }
        }

    def crear_regla_automatica(
        self,
        categoria: str,
        titulo: str,
        campos: Dict[str, str],
        emoji: Optional[str] = None,
        prioridad: Optional[str] = None,
        lenguaje: str = "javascript"
    ) -> str:
        """
        Crea una regla automáticamente basada en la categoría y campos

        Args:
            categoria: Categoría de la regla (fundamentos, autonomia, etc.)
            titulo: Título de la regla
            campos: Diccionario con los campos específicos de la plantilla
            emoji: Emoji personalizado (opcional)
            prioridad: Prioridad de la regla (opcional)
            lenguaje: Lenguaje del ejemplo de código

        Returns:
            String con la regla formateada en Markdown
        """
        plantilla_cat = self.plantillas.get(categoria, self.plantillas["fundamentos"])

        # Usar valores por defecto si no se proporcionan
        emoji = emoji or plantilla_cat["emoji_default"]
        prioridad = prioridad or plantilla_cat["prioridad_default"]

        # Agregar campos comunes
        campos_completos = {
            "numero": self.numero_actual,
            "emoji": emoji,
            "titulo": titulo,
            "prioridad": prioridad,
            "lenguaje": lenguaje,
            **campos
        }

        # Generar regla
        regla_texto = plantilla_cat["estructura"].format(**campos_completos)

        # Guardar regla
        regla_obj = {
            "numero": self.numero_actual,
            "categoria": categoria,
            "titulo": titulo,
            "contenido": regla_texto,
            "fecha_creacion": datetime.now().isoformat()
        }

        self.reglas.append(regla_obj)
        self.numero_actual += 1

        return regla_texto

    def crear_regla_ia_inteligente(
        self,
        prompt_usuario: str,
        categoria_sugerida: Optional[str] = None
    ) -> str:
        """
        Genera una regla inteligente basada en un prompt del usuario
        usando patrones de IA

        Args:
            prompt_usuario: Descripción de la regla deseada
            categoria_sugerida: Categoría sugerida (opcional)

        Returns:
            Regla generada
        """
        # Analizar el prompt y extraer componentes
        titulo = self._extraer_titulo(prompt_usuario)
        categoria = categoria_sugerida or self._detectar_categoria(prompt_usuario)
        campos = self._generar_campos_ia(prompt_usuario, categoria)

        return self.crear_regla_automatica(categoria, titulo, campos)

    def _extraer_titulo(self, prompt: str) -> str:
        """Extrae un título apropiado del prompt"""
        # Tomar las primeras 8 palabras como título
        palabras = prompt.split()[:8]
        titulo = " ".join(palabras)

        # Capitalizar primera letra
        return titulo[0].upper() + titulo[1:]

    def _detectar_categoria(self, prompt: str) -> str:
        """Detecta la categoría más apropiada basada en keywords"""
        keywords_categorias = {
            "seguridad": ["segur", "autenticación", "autorización", "encrypt", "token", "password"],
            "performance": ["rápido", "optimiz", "velocidad", "cache", "memoria", "cpu"],
            "testing": ["test", "prueba", "QA", "cobertura", "unitario", "integración"],
            "autonomia": ["autónom", "automátic", "sin intervención", "independiente"],
            "ia_sobre_codigo": ["IA", "inteligencia", "generación", "LLM", "modelo"],
            "devops": ["deploy", "CI/CD", "docker", "kubernetes", "pipeline"],
        }

        prompt_lower = prompt.lower()
        for categoria, keywords in keywords_categorias.items():
            if any(kw in prompt_lower for kw in keywords):
                return categoria

        return "fundamentos"  # Default

    def _generar_campos_ia(self, prompt: str, categoria: str) -> Dict[str, str]:
        """Genera campos inteligentemente basados en el prompt"""
        # Campos base que siempre deben estar
        campos = {
            "descripcion": prompt,
            "regla": f"Implementar: {prompt}",
            "ejemplo": "// Ejemplo generado automáticamente\n// TODO: Completar con implementación específica",
            "checklist": "- [ ] Implementar funcionalidad\n- [ ] Agregar tests\n- [ ] Documentar"
        }

        # Campos específicos por categoría
        if categoria == "seguridad":
            campos.update({
                "riesgo": "Riesgo identificado basado en: " + prompt,
                "implementacion": "Implementación de medidas de seguridad",
                "validaciones": "- Validar input\n- Sanitizar datos\n- Verificar permisos",
                "referencias": "- OWASP Top 10\n- Security Best Practices"
            })
        elif categoria == "performance":
            campos.update({
                "problema": "Problema de performance identificado",
                "solucion": "Optimización propuesta",
                "metricas": "- Tiempo de respuesta\n- Uso de memoria\n- Throughput",
                "benchmarks": "Benchmarks a realizar"
            })
        elif categoria == "testing":
            campos.update({
                "tipo_test": "Tipo de test a implementar",
                "cobertura": "80% mínimo",
                "estrategia": "Estrategia de testing",
                "herramientas": "Jest, Mocha, Pytest, etc."
            })

        return campos

    def exportar_a_markdown(self, archivo_salida: str = "REGLAS_GENERADAS.md"):
        """Exporta todas las reglas generadas a un archivo Markdown"""
        contenido = f"""# 🤖 Reglas Generadas Automáticamente

> Sistema Claude Code - Extensión Automática de Reglas
> Fecha de generación: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
> Total de reglas generadas: {len(self.reglas)}

---

## 📋 Índice de Reglas Generadas

"""
        # Índice
        for regla in self.reglas:
            contenido += f"- [{regla['numero']}. {regla['titulo']}](#{regla['numero']}-{regla['titulo'].lower().replace(' ', '-')})\n"

        contenido += "\n---\n\n"

        # Reglas completas
        for regla in self.reglas:
            contenido += regla['contenido'] + "\n"

        # Guardar archivo
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write(contenido)

        return archivo_salida

    def exportar_a_json(self, archivo_salida: str = "reglas_generadas.json"):
        """Exporta las reglas a formato JSON para procesamiento posterior"""
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            json.dump(self.reglas, f, indent=2, ensure_ascii=False)

        return archivo_salida

    def listar_categorias(self) -> List[str]:
        """Lista todas las categorías disponibles"""
        return list(self.categorias.keys())

    def obtener_estadisticas(self) -> Dict:
        """Obtiene estadísticas de las reglas generadas"""
        stats = {
            "total_reglas": len(self.reglas),
            "numero_siguiente": self.numero_actual,
            "reglas_por_categoria": {}
        }

        for regla in self.reglas:
            cat = regla['categoria']
            stats['reglas_por_categoria'][cat] = stats['reglas_por_categoria'].get(cat, 0) + 1

        return stats


def cli_interactivo():
    """Interfaz de línea de comandos interactiva"""
    print("🤖 Generador Automático de Reglas - Claude Code System")
    print("=" * 60)

    generador = GeneradorReglas()

    while True:
        print("\n📋 Opciones:")
        print("1. Crear regla con plantilla")
        print("2. Crear regla con IA (prompt libre)")
        print("3. Ver categorías disponibles")
        print("4. Ver estadísticas")
        print("5. Exportar a Markdown")
        print("6. Exportar a JSON")
        print("7. Salir")

        opcion = input("\nSelecciona una opción (1-7): ").strip()

        if opcion == "1":
            crear_regla_plantilla(generador)
        elif opcion == "2":
            crear_regla_ia(generador)
        elif opcion == "3":
            mostrar_categorias(generador)
        elif opcion == "4":
            mostrar_estadisticas(generador)
        elif opcion == "5":
            archivo = input("Nombre del archivo (default: REGLAS_GENERADAS.md): ").strip()
            archivo = archivo or "REGLAS_GENERADAS.md"
            generador.exportar_a_markdown(archivo)
            print(f"✅ Reglas exportadas a: {archivo}")
        elif opcion == "6":
            archivo = input("Nombre del archivo (default: reglas_generadas.json): ").strip()
            archivo = archivo or "reglas_generadas.json"
            generador.exportar_a_json(archivo)
            print(f"✅ Reglas exportadas a: {archivo}")
        elif opcion == "7":
            print("\n👋 ¡Hasta pronto!")
            break
        else:
            print("❌ Opción inválida")


def crear_regla_plantilla(generador: GeneradorReglas):
    """Crea una regla usando plantilla estructurada"""
    print("\n📝 Crear Regla con Plantilla")
    print("-" * 40)

    # Mostrar categorías
    categorias = generador.listar_categorias()
    for i, cat in enumerate(categorias, 1):
        print(f"{i}. {cat}")

    cat_idx = int(input("\nSelecciona categoría (número): ")) - 1
    categoria = categorias[cat_idx]

    titulo = input("Título de la regla: ").strip()

    # Campos según categoría
    print("\n📋 Completa los campos (Enter para saltar):")
    campos = {}

    plantilla = generador.plantillas[categoria]
    estructura = plantilla["estructura"]

    # Extraer campos de la plantilla
    import re
    campos_necesarios = re.findall(r'\{(\w+)\}', estructura)
    campos_necesarios = [c for c in campos_necesarios if c not in ['numero', 'emoji', 'titulo', 'prioridad', 'lenguaje']]

    for campo in set(campos_necesarios):
        valor = input(f"{campo}: ").strip()
        if valor:
            campos[campo] = valor
        else:
            campos[campo] = f"TODO: Completar {campo}"

    # Crear regla
    regla = generador.crear_regla_automatica(categoria, titulo, campos)
    print("\n✅ Regla creada exitosamente:")
    print(regla)


def crear_regla_ia(generador: GeneradorReglas):
    """Crea una regla usando IA basada en prompt"""
    print("\n🧠 Crear Regla con IA")
    print("-" * 40)
    print("Describe la regla que quieres crear (puede ser texto libre):")

    prompt = input("\n> ").strip()

    # Opcional: sugerir categoría
    print("\n¿Quieres especificar una categoría? (Enter para autodetección)")
    categorias = generador.listar_categorias()
    for i, cat in enumerate(categorias, 1):
        print(f"{i}. {cat}")

    cat_input = input("\nCategoría (número o Enter): ").strip()
    categoria_sugerida = None
    if cat_input:
        categoria_sugerida = categorias[int(cat_input) - 1]

    # Generar regla
    regla = generador.crear_regla_ia_inteligente(prompt, categoria_sugerida)
    print("\n✅ Regla generada exitosamente:")
    print(regla)


def mostrar_categorias(generador: GeneradorReglas):
    """Muestra todas las categorías disponibles"""
    print("\n📚 Categorías Disponibles:")
    print("-" * 40)
    for cat, nombre in generador.categorias.items():
        print(f"• {nombre} ({cat})")


def mostrar_estadisticas(generador: GeneradorReglas):
    """Muestra estadísticas de las reglas generadas"""
    stats = generador.obtener_estadisticas()
    print("\n📊 Estadísticas:")
    print("-" * 40)
    print(f"Total de reglas generadas: {stats['total_reglas']}")
    print(f"Número de la siguiente regla: {stats['numero_siguiente']}")
    print("\nReglas por categoría:")
    for cat, count in stats['reglas_por_categoria'].items():
        print(f"  • {cat}: {count}")


def main():
    """Función principal con argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(
        description='Generador Automático de Reglas para Claude Code System'
    )
    parser.add_argument(
        '--interactivo', '-i',
        action='store_true',
        help='Modo interactivo'
    )
    parser.add_argument(
        '--prompt', '-p',
        type=str,
        help='Crear regla desde prompt'
    )
    parser.add_argument(
        '--categoria', '-c',
        type=str,
        help='Especificar categoría para el prompt'
    )
    parser.add_argument(
        '--exportar', '-e',
        type=str,
        help='Exportar reglas a archivo Markdown'
    )

    args = parser.parse_args()

    if args.interactivo:
        cli_interactivo()
    elif args.prompt:
        generador = GeneradorReglas()
        regla = generador.crear_regla_ia_inteligente(args.prompt, args.categoria)
        print(regla)

        if args.exportar:
            generador.exportar_a_markdown(args.exportar)
            print(f"\n✅ Exportado a: {args.exportar}")
    else:
        # Por defecto, modo interactivo
        cli_interactivo()


if __name__ == "__main__":
    main()
