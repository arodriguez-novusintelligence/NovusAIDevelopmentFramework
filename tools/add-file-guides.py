#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Añade una cabecera explicativa y específica a archivos versionados.
# Configuración: Ajustar EXTENSIONS o las reglas purpose/configuration al incorporar nuevos formatos.
"""Add idempotent Spanish guide comments to comment-capable repository files."""
from __future__ import annotations

import ast
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "NADF-GUIDE"
EXTENSIONS = {".md", ".yml", ".yaml", ".py", ".html", ".htm", ".css", ".js", ".ts", ".sh", ".ps1", ".txt"}


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return [ROOT / line for line in result.stdout.splitlines() if line]


def title_from_markdown(text: str, fallback: str) -> str:
    match = re.search(r"^#\s+(.+)$", text, flags=re.MULTILINE)
    return match.group(1).strip() if match else fallback


def yaml_identity(text: str, fallback: str) -> str:
    for key in ("description", "name", "id"):
        match = re.search(rf"^{key}:\s*[\"']?(.+?)[\"']?\s*$", text, flags=re.MULTILINE)
        if match:
            return match.group(1).strip("\"'")
    return fallback


def python_identity(text: str, fallback: str) -> str:
    try:
        value = ast.get_docstring(ast.parse(text))
        if value:
            return value.splitlines()[0].rstrip(".")
    except SyntaxError:
        pass
    return fallback


def purpose(path: Path, text: str) -> str:
    rel = path.relative_to(ROOT).as_posix()
    fallback = path.stem.replace("-", " ").replace("_", " ")
    if path.suffix == ".md":
        return f"Documenta {title_from_markdown(text, fallback)}."
    if path.suffix in {".yml", ".yaml"}:
        return f"Define {yaml_identity(text, fallback)} como configuración declarativa NADF."
    if path.suffix == ".py":
        return f"Implementa {python_identity(text, fallback)}."
    if path.suffix in {".html", ".htm"}:
        title = re.search(r"<title>(.*?)</title>", text, flags=re.IGNORECASE | re.DOTALL)
        return f"Presenta {title.group(1).strip() if title else fallback} en formato HTML."
    if rel == ".gitignore":
        return "Excluye secretos, dependencias, outputs generados y estado local del control de versiones."
    if path.name == "requirements.txt":
        return "Declara dependencias Python necesarias para validar y operar herramientas NADF."
    return f"Implementa o configura {fallback} dentro de NADF."


def configuration(path: Path, text: str) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("docs/html/"):
        return "No editar directamente; actualizar docs/md y ejecutar tools/build-enterprise-docs.py."
    if rel.startswith("docs/") or path.suffix == ".md":
        if rel.startswith(".claude/agents/"):
            return "Revisar identidad, responsabilidades, permisos, entradas, salidas y límites del agente."
        if rel.startswith(".claude/commands/"):
            return "Ajustar proyecto activo, workflow, gates y rutas sin incorporar secretos."
        if rel.startswith("examples/"):
            return "Adaptar IDs, paths y criterios del sample manteniendo aislamiento y PROD prohibido."
        return "Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados."
    if rel.startswith(".github/workflows/"):
        return "Configurar variables del repositorio, environment DEV y rol AWS OIDC; nunca añadir keys."
    if rel.startswith("enterprise-governance/"):
        return "Copiar al proyecto y ajustar responsables, límites y excepciones con evidencia auditable."
    if "/projects/" in rel:
        return "Configurar ID, scope, adapters, entornos, budget y gates propios del proyecto."
    if "/workflow-library/" in rel:
        return "Ajustar triggers, pasos, dependencias, gates y outputs usando referencias del proyecto."
    if "/skill-registry/" in rel:
        return "Revisar capacidades, herramientas, restricciones y artifacts esperados del rol."
    if "/requirement-sources/" in rel:
        return "Configurar provider, mapping, seguridad y referencias de credenciales; nunca valores."
    if rel.startswith("schemas/") or "/state-machines/" in rel:
        return "Cambiar solo con versionado, fixtures, compatibilidad y validator actualizados."
    if path.suffix == ".py":
        if "argparse" in text:
            return "Configurar mediante argumentos CLI documentados; no hardcodear proyectos o secretos."
        return "No requiere configuración directa; conservar rutas relativas y ejecución determinista."
    if rel == ".gitignore":
        return "Añadir patrones de estado local; mantener visibles templates y archivos .env.example."
    if path.name == "requirements.txt":
        return "Fijar rangos compatibles y validar instalación en el runtime Python soportado."
    return "Revisar valores por entorno y mantener secretos fuera del repositorio."


def guide(path: Path, text: str) -> str:
    p = purpose(path, text)
    c = configuration(path, text)
    suffix = path.suffix.lower()
    if suffix == ".md":
        return f"<!-- {MARKER}\nPropósito: {p}\nConfiguración: {c}\n-->\n"
    if suffix in {".yml", ".yaml", ".py", ".sh", ".ps1", ".txt"} or path.name == ".gitignore":
        return f"# {MARKER}\n# Propósito: {p}\n# Configuración: {c}\n"
    if suffix in {".js", ".ts", ".css"}:
        return f"/* {MARKER}\n * Propósito: {p}\n * Configuración: {c}\n */\n"
    if suffix in {".html", ".htm"}:
        return f"<!-- {MARKER}\nPropósito: {p}\nConfiguración: {c}\n-->\n"
    raise ValueError(f"Formato no soportado: {path}")


def insertion_offset(path: Path, text: str) -> int:
    if path.suffix == ".md" and text.startswith("---\n"):
        closing = text.find("\n---\n", 4)
        if closing >= 0:
            return closing + len("\n---\n")
    if path.suffix == ".py" and text.startswith("#!"):
        return text.find("\n") + 1
    if path.suffix in {".html", ".htm"}:
        match = re.match(r"(?i)<!doctype html>\s*", text)
        if match:
            return match.end()
    return 0


def write_preserving_format(path: Path, text: str, had_bom: bool, newline: str) -> None:
    encoded = text.replace("\n", newline).encode("utf-8")
    if had_bom:
        encoded = b"\xef\xbb\xbf" + encoded
    path.write_bytes(encoded)


def process(path: Path) -> bool:
    if not path.is_file():
        return False
    if path.suffix.lower() not in EXTENSIONS and path.name != ".gitignore":
        return False
    raw = path.read_bytes()
    had_bom = raw.startswith(b"\xef\xbb\xbf")
    text = raw.decode("utf-8-sig")
    if MARKER in text:
        return False
    newline = "\r\n" if b"\r\n" in raw else "\n"
    normalized = text.replace("\r\n", "\n")
    offset = insertion_offset(path, normalized)
    updated = normalized[:offset] + guide(path, normalized) + normalized[offset:]
    write_preserving_format(path, updated, had_bom, newline)
    return True


def main() -> int:
    changed = [path for path in tracked_files() if process(path)]
    print(f"Guías añadidas: {len(changed)}")
    for path in changed:
        print(path.relative_to(ROOT).as_posix())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
