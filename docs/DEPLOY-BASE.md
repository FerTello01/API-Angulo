# Guía de Despliegue — Base + EVVM + EAS

Despliegue completo de API Angulo en **Base** con **EVVM** (blockchain virtual) y **EAS** (attestations de impacto).

## Arquitectura objetivo

```
Cliente B2B (REST)
       │
       ▼
┌──────────────────┐     IPFS           ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
└────────┬─────────┘                    └─────────────┘
         │
         ▼
┌──────────────────┐   eas.attest()     ┌──────────────────────────────┐
│  Web3 Relayer    │ ─────────────────► │  EAS (predeploy Base)        │
└──────────────────┘                    └──────────────┬───────────────┘
                                                        │
                                          ┌─────────────▼───────────────┐
                                          │  EVVM (Virtual Blockchain)    │
                                          │  Host: Base Sepolia / Mainnet │
                                          └─────────────────────────────┘
```

## Prerrequisitos

| Herramienta | Instalación |
|---|---|
| Node.js ≥ 20 | `nvm install 20` |
| Foundry | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| Bun ≥ 1.0 | `curl -fsSL https://bun.sh/install \| bash` |
| Git | — |

### Wallets y fondos necesarios

| Wallet | Red | Fondo | Uso |
|---|---|---|---|
| Relayer | Base Sepolia | ETH testnet | Gas EAS + deploy EVVM |
| Relayer | Ethereum Sepolia | ETH testnet | Registro EVVM Registry |
| Deployer | Base Sepolia | ETH testnet | Deploy EVVM |

Faucets:
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [Sepolia Faucet](https://sepoliafaucet.com)

---

## Fase 1 — Configurar API Angulo

### 1.1 Instalar dependencias

```bash
git clone https://github.com/FerTello01/API-Angulo.git
cd API-Angulo
npm install
```

### 1.2 Configurar `.env`

```bash
cp .env.example .env
```

Edita `.env`:

```bash
BASE_NETWORK=sepolia
BASE_RPC_URL=https://sepolia.base.org
RELAYER_PRIVATE_KEY=0x<TU_LLAVE_PRIVADA>

# EAS predeployado en Base — no cambiar
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
EAS_SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020
```

### 1.3 Importar wallet relayer (Foundry)

```bash
cast wallet import relayer --interactive
# Guarda la dirección pública — la necesitarás para EVVM
cast wallet address relayer
```

---

## Fase 2 — Registrar Schema EAS en Base

EAS ya está **predeployado** en Base (OP Stack). Solo necesitas registrar tu schema.

```bash
npm run register-schema
```

Salida esperada:

```
✓ Schema registered successfully!

Add this to your .env:

EAS_IMPACT_SCHEMA_UID=0xabc123...
```

Copia el UID a tu `.env`.

Verifica en [Base Sepolia EAS Scan](https://base-sepolia.easscan.org).

---

## Fase 3 — Desplegar EVVM sobre Base

### 3.1 Clonar EVVM CLI

```bash
cd ..
git clone --recursive https://github.com/EVVM-org/evvm-cli evvm-cli
cd evvm-cli
bun install
```

### 3.2 Configurar para Base

```bash
cp .env.example .env
```

```bash
# Base Sepolia como host chain
RPC_URL="https://sepolia.base.org"
EVVM_REGISTRATION_RPC_URL="https://gateway.tenderly.co/public/sepolia"
ETHERSCAN_API="tu_basescan_api_key"
```

O copia la plantilla del proyecto:

```bash
cp /path/to/API-Angulo/deploy/evvm.env.example .env
```

### 3.3 Importar wallet de deploy

```bash
cast wallet import deployer --interactive
```

### 3.4 Desplegar EVVM

```bash
chmod +x evvm
./evvm deploy --walletName deployer
```

**Configuración recomendada para API Angulo:**

| Campo | Valor sugerido |
|---|---|
| EVVM Name | `API Angulo EVVM` |
| Token Name | `Impact Token` |
| Token Symbol | `IMPACT` |
| admin | Wallet del equipo |
| goldenFisher | Dirección del relayer |
| activator | Dirección del relayer |
| Verificación | **Etherscan v2** (BaseScan) |

### 3.5 Registrar en EVVM Registry

Durante el deploy, responde `y` al registro, o después:

```bash
./evvm register --evvmAddress 0x<TU_EVVM_ADDRESS> --walletName deployer
```

> El registro ocurre en **Ethereum Sepolia** (necesitas ETH Sepolia).

Guarda las direcciones del output:

```json
{
  "Evvm": "0x...",
  "Staking": "0x...",
  "Treasury": "0x...",
  "evvmID": 1001
}
```

### 3.6 Actualizar `.env` de API Angulo

```bash
EVVM_CORE_ADDRESS=0x<Evvm_address>
EVVM_STAKING_ADDRESS=0x<Staking_address>
EVVM_ID=1001
```

---

## Fase 4 — Verificar despliegue

```bash
cd API-Angulo
npm run check-deployment
```

Salida esperada:

```
✅ BASE_NETWORK
✅ RELAYER_PRIVATE_KEY
✅ EAS_CONTRACT_ADDRESS
✅ EAS_IMPACT_SCHEMA_UID
✅ EVVM_CORE_ADDRESS
✅ Relayer balance
✅ EAS contract deployed
✅ Schema registered

✅ All checks passed
```

---

## Fase 5 — Ejecutar y probar

### 5.1 Iniciar API

```bash
npm run dev
```

### 5.2 Emitir certificado de prueba

```bash
curl -X POST http://localhost:3000/api/v1/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{
    "companyTaxId": "ABC123456XYZ",
    "impactCategory": "carbon_offset",
    "amount": 15000,
    "evidence": {
      "description": "Compensación de 15 toneladas CO2e Q1 2026"
    }
  }'
```

### 5.3 Consultar estado

```bash
curl http://localhost:3000/api/v1/certificates/<certificateId>
```

Cuando `status: CONFIRMED`, verifica la attestation en:
- [Base Sepolia EAS Scan](https://base-sepolia.easscan.org)
- [BaseScan](https://sepolia.basescan.org) (tx hash)

---

## Producción (Base Mainnet)

| Paso | Cambio |
|---|---|
| Red | `BASE_NETWORK=mainnet` |
| RPC | `BASE_RPC_URL=https://mainnet.base.org` |
| EVVM | `./evvm deploy` con `RPC_URL=https://mainnet.base.org` |
| Schema | `npm run register-schema` en mainnet |
| Fondos | ETH real en Base para gas del relayer |

---

## Referencia rápida de direcciones

### Base (OP Stack predeploys)

| Contrato | Dirección |
|---|---|
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

### Redes

| Red | Chain ID | RPC |
|---|---|---|
| Base Sepolia | `84532` | `https://sepolia.base.org` |
| Base Mainnet | `8453` | `https://mainnet.base.org` |
| ETH Sepolia (EVVM Registry) | `11155111` | `https://gateway.tenderly.co/public/sepolia` |

### EVVM Registry

| Campo | Valor |
|---|---|
| Address | `0x389dC8fb09211bbDA841D59f4a51160dA2377832` |
| Network | Ethereum Sepolia |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run register-schema` | Registra schema EAS en Base |
| `npm run check-deployment` | Valida configuración y fondos |
| `npm run dev` | Inicia API en desarrollo |
| `npm run build && npm start` | Producción |

---

## Troubleshooting

| Error | Solución |
|---|---|
| `EAS_IMPACT_SCHEMA_UID is not configured` | Ejecutar `npm run register-schema` |
| `INSUFFICIENT_FUNDS` | Recargar relayer con ETH en Base Sepolia |
| EVVM deploy falla | Verificar `RPC_URL` y saldo ETH |
| Registry falla | Necesitas ETH en Ethereum Sepolia |
| Schema ya registrado | Reutiliza el mismo UID — no registrar de nuevo |

---

## Recursos

- [Base Docs](https://docs.base.org)
- [EAS Docs](https://docs.attest.org/docs/welcome)
- [EVVM QuickStart](https://www.evvm.info/docs/QuickStart)
- [Base Sepolia EAS Scan](https://base-sepolia.easscan.org)
- [EVVM Services Guide](https://www.evvm.info/docs/HowToMakeAEVVMService)
