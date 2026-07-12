# API Angulo — Servicio de Certificación de Impacto

API REST corporativa (B2B SaaS) para certificar el impacto ambiental y social de empresas tradicionales, desplegada en **Base** con **EVVM** + **EAS**.

El cliente final **no interactúa con Web3**: no maneja llaves privadas, no firma transacciones y no paga gas. La plataforma actúa como **Relayer operacional**.

## Stack

| Capa | Tecnología |
|---|---|
| API | Fastify + TypeScript |
| Host chain | **Base** (Sepolia / Mainnet) |
| Virtual chain | **EVVM** sobre Base |
| Attestations | **EAS** (predeploy OP Stack) |
| Web3 | Viem + relayer wallet |
| Evidencia | IPFS (mock → producción) |

## Arquitectura

```
Cliente B2B → Fastify API → IPFS → Relayer → EAS.attest() → Base (+ EVVM)
```

## Inicio rápido

```bash
git clone https://github.com/FerTello01/API-Angulo.git
cd API-Angulo
npm install
cp .env.example .env
# Editar RELAYER_PRIVATE_KEY

npm run register-schema    # Registrar schema EAS en Base
npm run check-deployment   # Validar configuración
npm run dev                # Iniciar API
```

## Guía de despliegue completa

**[docs/DEPLOY-BASE.md](./docs/DEPLOY-BASE.md)** — paso a paso: Base + EVVM + EAS

## Documentación

| Documento | Descripción |
|---|---|
| [DEPLOY-BASE.md](./docs/DEPLOY-BASE.md) | Guía de despliegue completa |
| [API.md](./docs/API.md) | Referencia REST API |
| [EAS.md](./docs/EAS.md) | Integración EAS |
| [EVVM.md](./docs/EVVM.md) | EVVM sobre Base |

## Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/certificates/issue` | Emitir certificado |
| `GET` | `/api/v1/certificates/:id` | Consultar estado |

## Variables de entorno clave

```bash
BASE_NETWORK=sepolia
RELAYER_PRIVATE_KEY=0x...
EAS_IMPACT_SCHEMA_UID=0x...        # npm run register-schema
EVVM_CORE_ADDRESS=0x...            # tras deploy EVVM
EVVM_STAKING_ADDRESS=0x...
```

EAS predeployado en Base (no requiere deploy manual):
- EAS: `0x4200000000000000000000000000000000000021`
- SchemaRegistry: `0x4200000000000000000000000000000000000020`

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run register-schema` | Registrar schema EAS en Base |
| `npm run check-deployment` | Validar readiness |
| `npm run build` | Compilar TypeScript |
| `npm start` | Producción |

## Estructura

```
API-Angulo/
├── contracts/          # Solidity (legacy + EVVM service)
├── deploy/             # Plantillas EVVM
├── docs/               # Documentación
├── scripts/            # register-schema, check-deployment
├── src/
│   ├── chains/base.ts  # Base + EAS addresses
│   ├── web3/           # EAS attestation worker
│   └── ...
└── package.json
```

## Licencia

MIT
