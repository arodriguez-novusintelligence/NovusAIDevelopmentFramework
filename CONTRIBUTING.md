# CONTRIBUTING — NADF

1. Read `CLAUDE.md`, Meta Model overview, and ADRs.
2. Do not introduce secrets.
3. Prefer additive, opt-in changes (MINOR/PATCH).
4. Update schemas/catalogs/validators with features.
5. Run:

```bash
python tools/nadf-validator/__main__.py repository
```

6. Follow `docs/naming-conventions.md` and `docs/stability-policy.md`.
7. No production auto-deploy.
