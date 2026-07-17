<!-- NADF-GUIDE
Propósito: Documenta Autenticación GitHub — workspace NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Autenticación GitHub — workspace NADF

Guía para autenticar **este repositorio** (`NovusAIDevelopmentFramework`) contra GitHub sin afectar otros proyectos Cursor.

## Contexto de cuentas

| Workspace / proyecto | Cuenta u org GitHub |
|----------------------|---------------------|
| **NovusAIDevelopmentFramework** (NADF) | `arodriguez-novusintelligence` |
| Otros proyectos Cursor (p. ej. DoEvents) | `doeventsrepo` |

Cada workspace debe usar la cuenta con permisos sobre sus repos. **No modifiques la configuración global de Git** (`git config --global`) para resolver conflictos entre cuentas.

## Problema habitual: `GH_TOKEN` y error 403

Si tienes definida la variable de entorno `GH_TOKEN` (p. ej. con un token de `doeventsrepo`), GitHub CLI y Git la usarán con prioridad. Al intentar push a repos de **Novus** (`arodriguez-novusintelligence/NovusAIDevelopmentFramework`), obtendrás **403 Forbidden** aunque hayas hecho `gh auth login` con otra cuenta.

**Causa:** `GH_TOKEN` fuerza la identidad de `doeventsrepo` en la sesión actual.

**Solución:** quitar `GH_TOKEN` **solo en la sesión de terminal de este workspace**, no de forma persistente en el sistema si otros proyectos la necesitan.

## Pasos recomendados (solo esta sesión / este repo)

En PowerShell, desde la raíz de `NovusAIDevelopmentFramework`:

```powershell
# 1. Eliminar GH_TOKEN de la sesión actual (no persiste al cerrar la terminal)
Remove-Item Env:GH_TOKEN -ErrorAction SilentlyContinue

# 2. Iniciar sesión con cuenta que tenga acceso a arodriguez-novusintelligence
gh auth login

# 3. Configurar Git para usar las credenciales de gh (preferiblemente solo en este repo)
gh auth setup-git
```

Verifica:

```powershell
gh auth status
git remote -v
git push -u origin feature/nadf-foundation
```

## Alternativa: SSH (solo este repositorio)

Puedes cambiar la URL del remote **local** de este repo a SSH, sin tocar `git config --global`:

```powershell
git remote set-url origin git@github.com:arodriguez-novusintelligence/NovusAIDevelopmentFramework.git
```

Requisitos:

- Clave SSH asociada a la cuenta con acceso a `arodriguez-novusintelligence`
- Agente SSH cargado con esa clave (`ssh-add -l` para comprobar)

Prueba de conexión:

```powershell
ssh -T git@github.com
```

## Qué no hacer

- **No** guardes tokens ni PAT en el repositorio, commits, `.env` versionados ni documentación.
- **No** ejecutes `git config --global user.*` ni `credential.*` solo para alternar entre Novus y DoEvents; usa sesión sin `GH_TOKEN`, `gh auth login` o remote SSH local.
- **No** fuerces push (`git push --force`) ante un 403; corrige la autenticación primero.

## Resumen

1. Workspace NADF → cuenta **arodriguez-novusintelligence**.
2. Otros Cursor → **doeventsrepo** (mantener su propio `GH_TOKEN` en sus terminales).
3. En Novus: `Remove-Item Env:GH_TOKEN` en la sesión → `gh auth login` → `gh auth setup-git`.
4. Opcional: remote SSH solo en este repo.
5. Nunca commitear secretos.
