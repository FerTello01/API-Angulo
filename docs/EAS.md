# Integración con EAS — Ethereum Attestation Service

API Angulo utiliza **[EAS (Ethereum Attestation Service)](https://docs.attest.org/docs/welcome)** como capa estándar de attestations on-chain para certificar el impacto corporativo en Gravity.

EAS es una infraestructura open-source, permissionless y gratuita que permite firmar digitalmente datos estructurados y registrarlos en blockchain de forma verificable e interoperable.

## ¿Por qué EAS?

| Ventaja | Beneficio para API Angulo |
|---|---|
| **Estándar de la industria** | Attestations compatibles con ecosistemas Ethereum, indexadores y exploradores |
| **Arquitectura simple** | Dos contratos: `SchemaRegistry` + `EAS` |
| **Flexibilidad** | Schemas personalizables sin lock-in de estructura |
| **On-chain / Off-chain** | Soporte para attestations con o sin gas según el caso de uso |
| **Composabilidad** | Otras dApps pueden leer y verificar certificados de impacto |
| **EVM-compatible** | Desplegable en Gravity al ser red EVM |

> Referencia oficial: [Welcome to EAS](https://docs.attest.org/docs/welcome)

## Arquitectura con EAS

```
Cliente B2B (REST)
       │
       ▼
┌──────────────────┐     IPFS           ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
│  POST /issue     │                    └─────────────┘
└────────┬─────────┘
         │ async (fire-and-forget)
         ▼
┌──────────────────┐   EAS SDK + viem   ┌──────────────────────────────┐
│  Web3 Relayer    │ ─────────────────► │  EAS.sol (Gravity)           │
│  (wallet ops.)   │   eas.attest()     │  Schema: ImpactCertification │
└──────────────────┘                    └──────────────────────────────┘
                                                    │
                                                    ▼
                                         attestationUID (bytes32)
                                         verificable en EAS Explorer / GraphQL
```

### Flujo de attestation con EAS

1. **Registro de Schema** — Se registra un schema `ImpactCertification` en `SchemaRegistry.sol`
2. **Emisión vía API** — El cliente envía datos de impacto; la API sube evidencia a IPFS
3. **Attestation on-chain** — El relayer llama `eas.attest()` firmando la transacción y pagando gas
4. **UID verificable** — EAS retorna un `attestationUID` único consultable públicamente
5. **Verificación** — Cualquier tercero puede verificar la attestation vía EAS Explorer, SDK o GraphQL API

## Schema de Impacto

Schema propuesto para certificaciones corporativas:

```
string companyTaxId, string impactCategory, uint256 amount, string ipfsEvidence
```

| Campo | Tipo | Descripción |
|---|---|---|
| `companyTaxId` | `string` | RFC / identificador fiscal corporativo |
| `impactCategory` | `string` | Categoría de impacto (ej. `carbon_offset`) |
| `amount` | `uint256` | Cantidad de impacto en unidades base |
| `ipfsEvidence` | `string` | CID de IPFS con evidencia y metadatos |

### Registro del Schema (ejemplo)

```typescript
import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';

const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
schemaRegistry.connect(signer);

const schemaUID = await schemaRegistry.register({
  schema: 'string companyTaxId, string impactCategory, uint256 amount, string ipfsEvidence',
  resolverAddress: '0x0000000000000000000000000000000000000000',
  revocable: true,
});
```

## Creación de Attestation (ejemplo)

```typescript
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

const eas = new EAS(EAS_CONTRACT_ADDRESS);
eas.connect(signer);

const schemaEncoder = new SchemaEncoder(
  'string companyTaxId, string impactCategory, uint256 amount, string ipfsEvidence'
);

const encodedData = schemaEncoder.encodeData([
  { name: 'companyTaxId', value: 'ABC123456XYZ', type: 'string' },
  { name: 'impactCategory', value: 'carbon_offset', type: 'string' },
  { name: 'amount', value: 15000n, type: 'uint256' },
  { name: 'ipfsEvidence', value: 'bafybeig...', type: 'string' },
]);

const attestationUID = await eas.attest({
  schema: IMPACT_SCHEMA_UID,
  data: {
    recipient: '0x0000000000000000000000000000000000000000',
    expirationTime: 0n,
    revocable: true,
    data: encodedData,
  },
});
```

## Variables de entorno EAS

| Variable | Descripción |
|---|---|
| `EAS_CONTRACT_ADDRESS` | Dirección del contrato `EAS.sol` en Gravity |
| `EAS_SCHEMA_REGISTRY_ADDRESS` | Dirección del contrato `SchemaRegistry.sol` |
| `EAS_IMPACT_SCHEMA_UID` | UID del schema `ImpactCertification` registrado |

```bash
# .env
EAS_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_REGISTRY_ADDRESS=0x...
EAS_IMPACT_SCHEMA_UID=0x...
```

## Compatibilidad con EVVM

EAS y EVVM son **100% compatibles** — ambos ejecutan contratos Solidity estándar sobre EVM.

| Aspecto | Detalle |
|---|---|
| **EVVM** | Blockchain virtual sobre Gravity — sin infraestructura propia |
| **EAS dentro de EVVM** | `EAS.sol` y `SchemaRegistry.sol` se despliegan en la instancia EVVM |
| **Gasless attestations** | Fishers de EVVM ejecutan `eas.attest()` — el cliente B2B no paga gas |
| **Verificación** | Attestations EAS verificables vía SDK, GraphQL o EAS Explorer |

```
Gravity (host) → EVVM (virtual chain) → EAS (attestations) → API Angulo (relayer)
```

Guía de despliegue EVVM: **[EVVM.md](./EVVM.md)**

## Despliegue en Gravity

Gravity es **fully EVM-compatible**, por lo que los contratos EAS (`EAS.sol` y `SchemaRegistry.sol`) pueden desplegarse directamente en la red.

Pasos:

1. Desplegar contratos EAS en Gravity usando [eas-contracts](https://github.com/ethereum-attestation-service/eas-contracts)
2. Registrar el schema `ImpactCertification` vía `SchemaRegistry`
3. Configurar las direcciones en `.env`
4. El relayer emite attestations con `@ethereum-attestation-service/eas-sdk`

```bash
npm install @ethereum-attestation-service/eas-sdk
```

## Verificación de Attestations

Una vez emitida, cualquier parte puede verificar la attestation:

### Vía SDK

```typescript
const attestation = await eas.getAttestation(attestationUID);

console.log(attestation.attester);  // Wallet del relayer
console.log(attestation.time);      // Timestamp on-chain
console.log(attestation.data);      // Datos codificados del schema
```

### Vía GraphQL API

EAS provee una [GraphQL API](https://docs.attest.org/docs/developer-tools/api) para indexar y consultar attestations.

### Vía EAS Explorer

Las attestations son visibles en exploradores compatibles con EAS para verificación pública.

## Relación con el contrato actual

El proyecto incluye `ImpactCertificateRegistry.sol` como implementación inicial. La migración a EAS aporta:

| Aspecto | Contrato custom | EAS |
|---|---|---|
| Interoperabilidad | Solo Gravity | Estándar multi-chain |
| Indexación | Manual | GraphQL API + indexers |
| Verificación | Custom | EAS Explorer + SDK |
| Revocación | No implementada | Nativa (`revocable: true`) |
| Composabilidad | Limitada | Attestations referenciables (`refUID`) |

> **Roadmap:** El worker Web3 migrará de `emitCertificate()` al contrato custom hacia `eas.attest()` con el schema EAS registrado.

## Recursos

- [Documentación EAS](https://docs.attest.org/docs/welcome)
- [EAS SDK](https://docs.attest.org/docs/developer-tools/eas-sdk)
- [EAS Contracts (GitHub)](https://github.com/ethereum-attestation-service/eas-contracts)
- [EAS SDK (npm)](https://www.npmjs.com/package/@ethereum-attestation-service/eas-sdk)
- [GraphQL API](https://docs.attest.org/docs/developer-tools/api)
- [EAS Explorer](https://easscan.org/)
