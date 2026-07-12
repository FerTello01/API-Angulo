# API Angulo — Servicio de Certificación de Impacto

API REST corporativa (B2B SaaS) para certificar el impacto ambiental y social de empresas tradicionales, con registro inmutable en la blockchain **Gravity**.

El cliente final **no interactúa con Web3**: no maneja llaves privadas, no firma transacciones y no paga gas. La plataforma actúa como **Relayer operacional**, firmando todas las transacciones on-chain y cubriendo el costo del gas.

## Características

- **API REST** con Fastify + TypeScript
- **Relayer Web3** con Viem conectado a Gravity (L1 Mainnet, Alpha L2 o Sepolia)
- **Smart Contract** en Solidity optimizado para Gravity EVM
- **Flujo asíncrono**: respuesta HTTP inmediata (`PROCESSING`) + attestation on-chain en background
- **Evidencia en IPFS** (mock incluido; listo para integrar Pinata, NFT.Storage, etc.)
- **Identificación corporativa** por RFC / Tax ID, no por dirección de wallet

## Arquitectura

```
Cliente B2B (REST)
       │
       ▼
┌──────────────────┐     mock/IPFS      ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
│  POST /issue     │                    └─────────────┘
└────────┬─────────┘
         │ async (fire-and-forget)
         ▼
┌──────────────────┐   viem + relayer   ┌─────────────────────────┐
│  Web3 Worker     │ ─────────────────► │ ImpactCertificateRegistry│
│  (wallet ops.)   │                    │   (Gravity blockchain)   │
└──────────────────┘                    └─────────────────────────┘
```

### Flujo de emisión

1. El cliente envía datos de impacto vía `POST /api/v1/certificates/issue`
2. La API valida el payload, sube evidencia a IPFS y calcula el `certificateHash`
3. Responde de inmediato con `202 Accepted` y estado `PROCESSING`
4. En background, el relayer firma y envía `emitCertificate()` al contrato en Gravity
5. El cliente consulta el estado con `GET /api/v1/certificates/:id`

## Requisitos

- Node.js >= 20
- Wallet operacional con saldo en **G** (token nativo de Gravity) para gas
- Contrato `ImpactCertificateRegistry` desplegado en Gravity

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/FerTello01/API-Angulo.git
cd API-Angulo
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

| Variable | Descripción |
|---|---|
| `GRAVITY_NETWORK` | `mainnet` (L1, chain 127001), `alpha` (L2, chain 1625) o `sepolia` |
| `GRAVITY_RPC_URL` | Endpoint RPC de Gravity |
| `RELAYER_PRIVATE_KEY` | Llave privada de la wallet operacional (32 bytes hex) |
| `IMPACT_REGISTRY_CONTRACT_ADDRESS` | Dirección del contrato desplegado |
| `TX_TIMEOUT_MS` | Timeout de transacción en ms (default: 120000) |
| `TX_MAX_RETRIES` | Reintentos ante fallos de red (default: 3) |

### 3. Desplegar el Smart Contract

```bash
# Ejemplo con Foundry — pasar la dirección del relayer como argumento
forge create contracts/ImpactCertificateRegistry.sol:ImpactCertificateRegistry \
  --rpc-url https://mainnet-rpc.gravity.xyz \
  --private-key $DEPLOYER_KEY \
  --constructor-args $RELAYER_ADDRESS
```

> El parámetro `_relayer` del constructor debe ser la dirección pública derivada de `RELAYER_PRIVATE_KEY`.

### 4. Ejecutar la API

```bash
# Desarrollo (hot-reload)
npm run dev

# Producción
npm run build
npm start
```

La API estará disponible en `http://localhost:3000`.

### 5. Probar el endpoint

```bash
curl -X POST http://localhost:3000/api/v1/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{
    "companyTaxId": "ABC123456XYZ",
    "impactCategory": "carbon_offset",
    "amount": 15000,
    "evidence": {
      "description": "Compensación de 15 toneladas CO2e mediante reforestación Q1 2026",
      "metrics": { "co2e_tons": 15, "region": "MX-CHI" }
    }
  }'
```

## Documentación de la API

Consulta la referencia completa en **[docs/API.md](./docs/API.md)**.

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Health check del servicio |
| `POST` | `/api/v1/certificates/issue` | Emitir certificado de impacto |
| `GET` | `/api/v1/certificates/:id` | Consultar estado del certificado |

## Estructura del proyecto

```
API-Angulo/
├── contracts/
│   └── ImpactCertificateRegistry.sol   # Smart Contract Solidity
├── docs/
│   └── API.md                          # Documentación de la API
├── src/
│   ├── abi/                            # ABI del contrato
│   ├── chains/                         # Configuración Gravity (L1, L2, Sepolia)
│   ├── config/                         # Variables de entorno (Zod)
│   ├── routes/                         # Endpoints Fastify
│   ├── schemas/                        # Validación de payloads (Zod)
│   ├── services/                       # Lógica de negocio + IPFS
│   ├── types/                          # Tipos TypeScript
│   ├── web3/                           # Cliente Viem + Worker relayer
│   └── index.ts                        # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Redes Gravity soportadas

| Red | Chain ID | RPC | Uso recomendado |
|---|---|---|---|
| Gravity Mainnet (L1) | `127001` | `https://mainnet-rpc.gravity.xyz` | Producción |
| Gravity Alpha (L2) | `1625` | `https://rpc.gravity.xyz` | Legacy (deprecación dic. 2026) |
| Gravity Sepolia | `13505` | `https://rpc-sepolia.gravity.xyz` | Testing |

## Smart Contract

El contrato `ImpactCertificateRegistry` almacena certificados indexados por `bytes32` hash, identificando empresas por `companyTaxId` (RFC) en lugar de direcciones Ethereum.

**Control de acceso:**
- `owner` — administrador del contrato (puede rotar el relayer)
- `relayer` — única wallet autorizada para llamar `emitCertificate()`

**Estructura del certificado on-chain:**

| Campo | Tipo | Descripción |
|---|---|---|
| `companyTaxId` | `string` | RFC / identificador fiscal corporativo |
| `impactCategory` | `string` | Categoría de impacto (ej. `carbon_offset`) |
| `amount` | `uint256` | Cantidad de impacto en unidades base |
| `ipfsEvidence` | `string` | CID de IPFS con evidencia |
| `timestamp` | `uint256` | Timestamp de emisión (block.timestamp) |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm start` | Ejecutar build de producción |
| `npm run typecheck` | Verificar tipos sin compilar |

## Seguridad

- **Nunca** commitees el archivo `.env` ni expongas `RELAYER_PRIVATE_KEY`
- La wallet relayer debe tener fondos suficientes en G para gas
- En producción, deshabilita CORS abierto (`NODE_ENV=production`)
- Considera agregar autenticación B2B (API keys, JWT) antes de exponer públicamente

## Licencia

MIT
