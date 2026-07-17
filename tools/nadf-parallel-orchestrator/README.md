<!-- NADF-GUIDE
Propósito: Documenta Parallel orchestrator prototype.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Parallel orchestrator prototype

Valida el grafo fan-out/fan-in sin llamar modelos ni mutar repositorios:

```bash
python tools/nadf-parallel-orchestrator/invoke-parallel-pipeline.py \
  --max-concurrency 3
```

Es un prototipo de Ola 2. La integración productiva con runtimes queda detrás
del mismo contrato de nodos y budget.
