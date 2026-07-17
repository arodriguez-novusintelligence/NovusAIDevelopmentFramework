<!-- NADF-GUIDE
Propósito: Documenta Cloud Agent y runtime.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Cloud Agent y runtime

NADF define roles, contratos, gates y artifacts. Cursor Cloud Agent es un motor
de ejecución intercambiable; no es el Framework.

El runtime:

1. recibe contexto del proyecto y referencias de credenciales;
2. aplica scope, budget y pattern guards;
3. invoca agentes seleccionados;
4. propone código/PR;
5. deja que CI valide y despliegue DEV.

Cloud Agent no recibe AWS keys. Un fallo genera evidencia y relanzamiento, no
merge parcial. Las implementaciones específicas de cada cliente viven en su
rama o distribución; los samples no dependen de Lovable.
