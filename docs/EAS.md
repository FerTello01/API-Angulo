# Integración con EAS — Ethereum Attestation Service

API Angulo utiliza **[EAS (Ethereum Attestation Service)](https://docs.attest.org/docs/welcome)** como capa estándar de attestations on-chain para certificar el impacto corporativo en **Base**.

EAS es infraestructura open-source, permissionless y gratuita para firmar digitalmente datos estructurados y registrarlos en blockchain de forma verificable e interoperable.

## ¿Por qué EAS en Base?

| Ventaja | Beneficio para API Angulo |
|---|---|
| **Predeploy en Base** | OP Stack incluye EAS — sin deploy manual |
| **Estándar de industria** | Compatible con indexadores, explorers y SDKs |
| **Arquitectura simple** | `SchemaRegistry` + `EAS` |
| **Bajo costo de gas** | Base L2 — ideal para relayer B2B |
| **Revocación nativa** | `revocable: true` en schema |
| **Composabilidad** | Otras dApps verifican attestations de impacto |

> Referencia: [Welcome to EAS](https://docs.attest.org/docs/welcome)

## Arquitectura

```
Cliente B2B (REST)
       │
       ▼
┌──────────────────┐     IPFS           ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
│  POST /issue     │                    └─────────────┘
└────────┬─────────┘
         │ async
         ▼
┌──────────────────┐   Viem             ┌──────────────────────────────┐
│  Web3 Relayer    │ ─────────────────► │  EAS.sol (Base predeploy)    │
│  eas.attest()    │                    │  Schema: ImpactCertification │
└──────────────────┘                    └──────────────────────────────┘
                                                    │
                                                    ▼
                                         attestationUID (bytes32)
                                         → base-sepolia.easscan.org
```

## Contratos en Base (predeploy OP Stack)

| Contrato | Dirección | Red |
|---|---|---|
| **EAS** | `0x4200000000000000000000000000000000000021` | Base Sepolia + Mainnet |
| **SchemaRegistry** | `0x4200000000000000000000000000000000000020` | Base Sepolia + Mainnet |

No necesitas desplegar estos contratos — ya existen en Base.

## Schema de impacto

```
string companyTaxId, string impactCategory, uint256 amount, string ipfsEvidence
```

| Campo | Tipo | Descripción |
|---|---|---|
| `companyTaxId` | `string` | RFC / identificador fiscal |
| `impactCategory` | `string` | Ej: `carbon_offset` |
| `amount` | `uint256` | Cantidad en unidades base |
| `ipfsEvidence` | `string` | CID de IPFS |

### Registrar schema

```bash
# Desde el proyecto API Angulo
npm run register-schema
```

O manualmente con Viem/cast:

```bash
cast send 0x4200000000000000000000000000000000000020 \
  "register(string,address,bool)" \
  "string companyTaxId,string impactCategory,uint256 amount,string ipfsEvidence" \
  "0x0000000000000000000000000000000000000000" \
  true \
  --rpc-url https://sepolia.base.org \
  --private-key $RELAYER_KEY
```

Copiar el UID resultante a `.env`:

```bash
EAS_IMPACT_SCHEMA_UID=0x...
```

## Implementación en API Angulo

El worker `src/web3/easAttestation.worker.ts` usa **Viem** (sin ethers):

```typescript
// 1. Codificar datos del schema
const encodedData = encodeAbiParameters(
  parseAbiParameters('string, string, uint256, string'),
  [taxId, category, amount, ipfsHash],
);

// 2. Simular + enviar attestation
const { result: attestationUID, request } = await publicClient.simulateContract({
  address: EAS_CONTRACT_ADDRESS,
  abi: easAbi,
  functionName: 'attest',
  args: [{
    schema: EAS_IMPACT_SCHEMA_UID,
    data: {
      recipient: '0x0000000000000000000000000000000000000000',
      expirationTime: 0n,
      revocable: true,
      refUID: ZERO_BYTES32,
      data: encodedData,
      value: 0n,
    },
  }],
});

const txHash = await walletClient.writeContract(request);
```

## Variables de entorno

| Variable | Default (Base) | Descripción |
|---|---|---|
| `EAS_CONTRACT_ADDRESS` | `0x4200...0021` | Contrato EAS |
| `EAS_SCHEMA_REGISTRY_ADDRESS` | `0x4200...0020` | SchemaRegistry |
| `EAS_IMPACT_SCHEMA_UID` | — | UID del schema (requerido) |

## Compatibilidad con EVVM

EAS y EVVM son **100% compatibles** (ambos EVM):

```
Base (host) → EVVM (virtual) → EAS attestations → API Angulo (relayer)
```

| Modo | Gas | Uso |
|---|---|---|
| **EAS directo en Base** | Relayer paga ETH | Implementado actualmente |
| **EAS vía EVVM + fishers** | Gasless para clientes | Roadmap |

Guía EVVM: **[EVVM.md](./EVVM.md)**

## Verificación de attestations

### EAS Scan (Base)

- Sepolia: https://base-sepolia.easscan.org
- Mainnet: https://base.easscan.org

### Vía código (Viem)

```typescript
const attestation = await publicClient.readContract({
  address: EAS_CONTRACT_ADDRESS,
  abi: easAbi,
  functionName: 'getAttestation',
  args: [attestationUID],
});
```

### GraphQL API

[EAS GraphQL](https://docs.attest.org/docs/developer-tools/api) para indexación y consultas.

## Exploradores

| Recurso | URL |
|---|---|
| Base Sepolia Scan | https://sepolia.basescan.org |
| Base Mainnet Scan | https://basescan.org |
| EAS Scan Sepolia | https://base-sepolia.easscan.org |
| EAS Scan Mainnet | https://base.easscan.org |

## Recursos

- [EAS Docs](https://docs.attest.org/docs/welcome)
- [EAS SDK](https://docs.attest.org/docs/developer-tools/eas-sdk)
- [EAS Contracts](https://github.com/ethereum-attestation-service/eas-contracts)
- [Base Docs](https://docs.base.org)
- [API Reference](./API.md)
- [Deploy Guide](./DEPLOY-BASE.md)
