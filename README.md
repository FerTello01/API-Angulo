# Proofact — Plataforma de Certificación de Impacto

Monorepo con **frontend Proofact** (Next.js) y **API REST B2B** (Fastify) para certificar impacto ambiental y social con attestations EAS verificables en **Base**.

El cliente corporativo **no interactúa con Web3**: no maneja llaves privadas, no firma transacciones y no paga gas. Proofact actúa como **relayer operacional**.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 + React 19 + shadcn/ui + Tailwind 4 |
| API | Fastify 5 + TypeScript + OpenAPI 3.1 + Scalar |
| Host chain | **Base** (Sepolia / Mainnet) |
| Virtual chain | **EVVM** sobre Base |
| Attestations | **EAS** (predeploy OP Stack) |
| Web3 | Viem + relayer wallet |

## Arquitectura

```
Cliente B2B → Proofact API → IPFS → Relayer → EAS.attest() → Base (+ EVVM)
                    ↑
              Proofact Web (/developers, /verify, /admin)
```

## Inicio rápido

```bash
git clone https://github.com/FerTello01/API-Angulo.git
cd API-Angulo
pnpm install

# API
cp apps/api/.env.example apps/api/.env
# Editar RELAYER_PRIVATE_KEY en apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local

pnpm dev:api    # API en http://localhost:3000
pnpm dev:web    # Web en http://localhost:3001
pnpm dev        # Ambos en paralelo
```

## URLs de desarrollo

| URL | Descripción |
|---|---|
| http://localhost:3001 | Frontend Proofact |
| http://localhost:3001/developers | Guía de integración API |
| http://localhost:3001/admin | Panel de gestión |
| http://localhost:3001/verify | Verificar certificados |
| http://localhost:3000/docs | Referencia interactiva OpenAPI (Scalar) |
| http://localhost:3000/openapi.json | Spec OpenAPI 3.1 |

## Documentación

| Documento | Descripción |
|---|---|
| **[INTEGRATION.md](./docs/INTEGRATION.md)** | **Guía definitiva de implementación** |
| [API.md](./docs/API.md) | Referencia técnica REST |
| [DEPLOY-BASE.md](./docs/DEPLOY-BASE.md) | Despliegue Base + EVVM + EAS |
| [EAS.md](./docs/EAS.md) | Integración EAS |
| [EVVM.md](./docs/EVVM.md) | EVVM sobre Base |

## Endpoints API (v1)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/certificates/issue` | Emitir certificado |
| `GET` | `/api/v1/certificates/:id` | Consultar estado |

## Estructura del monorepo

```
/
├── apps/
│   ├── api/          # Fastify API + OpenAPI + Scalar
│   └── web/          # Next.js Proofact (docs, verify, admin)
├── docs/             # Guías técnicas (Markdown)
├── package.json      # Workspace root
└── pnpm-workspace.yaml
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | API + Web en paralelo |
| `pnpm dev:api` | Solo API (puerto 3000) |
| `pnpm dev:web` | Solo Web (puerto 3001) |
| `pnpm --filter @proofact/api register-schema` | Registrar schema EAS |
| `pnpm --filter @proofact/api check-deployment` | Validar readiness |

## Despliegue en Vercel (frontend)

El build falla si Vercel busca `app/` en la raíz del repo. El frontend está en `apps/web/`.

**Opción A — Root Directory (recomendada)**

En **Vercel → Project Settings → General → Root Directory** → **Edit** → escribe `apps/web` → **Save**.

| Campo | Valor |
|---|---|
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && pnpm install` |
| Build Command | `next build` |

**Opción B — Root Directory en la raíz del repo**

Si no cambias Root Directory, el repo incluye [`vercel.json`](./vercel.json) en la raíz con `next` en el `package.json` raíz para que Vercel detecte el framework. Haz push de los cambios y redeploy.

> En ambos casos, añade `NEXT_PUBLIC_API_URL` en Environment Variables.

```
NEXT_PUBLIC_API_URL=https://tu-api-en-produccion.com
```

Guía completa: [docs/INTEGRATION.md](./docs/INTEGRATION.md#9-despliegue-del-frontend-vercel)

## Licencia

MIT
