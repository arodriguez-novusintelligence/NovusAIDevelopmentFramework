#!/usr/bin/env python3
"""Build dependency-free HTML views for docs/md."""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "md"
TARGET = ROOT / "docs" / "html"

STYLE = """
:root{--bg:#07111f;--panel:#0e1d31;--text:#eaf2ff;--muted:#9fb2cb;--brand:#42d6c7;--line:#223a55}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#07111f,#0b1728);color:var(--text);font:16px/1.65 Inter,Segoe UI,sans-serif}
header{position:sticky;top:0;padding:18px 5vw;background:#07111fee;border-bottom:1px solid var(--line)}
header a{color:var(--brand);text-decoration:none;font-weight:700}main{max-width:980px;margin:auto;padding:48px 28px 80px}
h1{font-size:2.5rem}h1,h2,h3{line-height:1.2}h2{margin-top:2em;color:var(--brand)}
p,li{color:var(--muted)}code{color:#b6fff7;background:#10243a;padding:.15em .35em;border-radius:5px}
pre{padding:18px;background:var(--panel);border:1px solid var(--line);overflow:auto}a{color:var(--brand)}
table{border-collapse:collapse;width:100%}td,th{border:1px solid var(--line);padding:10px;text-align:left}
"""


def inline(value: str) -> str:
    escaped = html.escape(value)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return escaped


def markdown(text: str) -> str:
    output: list[str] = []
    in_list = False
    in_code = False
    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("```"):
            output.append("</code></pre>" if in_code else "<pre><code>")
            in_code = not in_code
            continue
        if in_code:
            output.append(html.escape(line) + "\n")
            continue
        if line.startswith("- "):
            if not in_list:
                output.append("<ul>")
                in_list = True
            output.append(f"<li>{inline(line[2:])}</li>")
            continue
        if in_list:
            output.append("</ul>")
            in_list = False
        match = re.match(r"^(#{1,3})\s+(.+)", line)
        if match:
            level = len(match.group(1))
            output.append(f"<h{level}>{inline(match.group(2))}</h{level}>")
        elif re.match(r"^\d+\.\s+", line):
            output.append(f"<p>{inline(line)}</p>")
        elif line:
            output.append(f"<p>{inline(line)}</p>")
    if in_list:
        output.append("</ul>")
    return "\n".join(output)


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    pages = sorted(SOURCE.glob("*.md"))
    links = []
    for path in pages:
        filename = "index.html" if path.name == "README.md" else path.with_suffix(".html").name
        content = markdown(path.read_text(encoding="utf-8"))
        title = next((line[2:] for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("# ")), path.stem)
        page = (
            "<!doctype html><html lang='es'><head><meta charset='utf-8'>"
            f"<meta name='viewport' content='width=device-width'><title>{html.escape(title)}</title>"
            f"<style>{STYLE}</style></head><body><header><a href='index.html'>NADF Enterprise</a></header>"
            f"<main>{content}</main></body></html>\n"
        )
        (TARGET / filename).write_text(page, encoding="utf-8")
        if filename != "index.html":
            links.append(f"<li><a href='{filename}'>{html.escape(title)}</a></li>")
    index = TARGET / "index.html"
    current = index.read_text(encoding="utf-8")
    current = current.replace("</main>", "<h2>Capítulos</h2><ul>" + "".join(links) + "</ul></main>")
    index.write_text(current, encoding="utf-8")
    print(f"Generated {len(pages)} HTML pages in {TARGET}")


if __name__ == "__main__":
    main()
