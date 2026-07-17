# Tiempos y rendimiento

Una corrida completa secuencial observada puede durar **45–60 minutos**. No es
un SLA: depende del modelo, repositorios, Human Gates y herramientas.

Objetivo con clasificación, poda y fan-out/fan-in: **15–30 minutos** de IA,
separando siempre `humanWaitMs`.

Palancas:

- clasificar dominio antes de invocar;
- usar `agent-selection.yml`;
- paralelizar validadores independientes (máximo 3 por defecto);
- smoke antes de full;
- reutilizar artifacts frescos;
- no ejecutar visual parity en APIs sin UI.

El reloj de negocio es `tiempo IA + espera humana`; ambos deben reportarse por
separado.
