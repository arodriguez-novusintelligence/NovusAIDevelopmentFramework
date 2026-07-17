# Orquestación paralela

El prototipo usa grafo fan-out/fan-in con `maxConcurrency: 3`:

`intake → plan → [implementation domains] → [qa, security, review] → report`

Solo se paralelizan nodos sin dependencias de escritura compartida. Si un nodo
falla:

- se detienen dependientes;
- se dejan terminar nodos independientes ya iniciados;
- se preservan artifacts;
- no se hace merge;
- el reporter indica `correct-and-rerun`.

El modo dry-run valida orden, concurrencia y selección sin invocar Cloud Agent.
La implementación productiva completa queda sujeta a medición de Ola 2.
