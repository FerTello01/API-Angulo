# EVVM sobre Base — API Angulo

**[EVVM (Ethereum Virtual Virtual Machine)](https://www.evvm.info/docs/intro)** es una blockchain virtual desplegada sobre una red host EVM — en nuestro caso, **Base** — sin gestionar validadores ni infraestructura propia.

API Angulo usa EVVM como capa de ejecución virtual opcional, combinada con **EAS** para attestations de impacto corporativo.

## ¿EVVM es compatible con EAS?

**Sí.** Ambos son EVM nativos:

| Protocolo | Compatibilidad |
|---|---|
| **EVVM** | Contratos Solidity sobre cualquier host EVM |
| **EAS** | Predeployado en Base (OP Stack) |

```
┌─────────────────────────────────────────────────────────────┐
│                      Base (Host Chain)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              EVVM (Virtual Blockchain)               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │  EAS (host)  │  │ EVVM Core    │  │ Fishers  │ │    │
│  │  │  attestations│  │ + Staking    │  │ gasless  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ API Angulo (Fastify + Viem)
```

### Ventajas EVVM + EAS + Base

| Beneficio | Descripción |
|---|---|
| **Gasless B2B** | Fishers ejecutan tx; cliente corporativo no paga gas |
| **Sin infra propia** | Blockchain virtual sobre Base |
| **EAS estándar** | Attestations interoperables |
| **Bajo costo** | Base L2 + finalidad rápida |
| **Corporate-friendly** | Coinbase ecosystem |

## Arquitectura

```
Cliente B2B (REST, sin Web3)
       │
       ▼
┌──────────────────┐     IPFS           ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
└────────┬─────────┘                    └─────────────┘
         │
         ▼
┌──────────────────┐   eas.attest()     ┌──────────────────────────────┐
│  Relayer/Fisher  │ ─────────────────► │  EAS (predeploy en Base)     │
└──────────────────┘                    └──────────────────────────────┘
                                                    │
                                          EVVM sobre Base (host)
```

> **Nota:** La implementación actual usa EAS directamente en Base. La integración EVVM gasless es el siguiente paso del roadmap.

## Prerrequisitos

| Herramienta | Instalación |
|---|---|
| [Foundry](https://book.getfoundry.sh/getting-started/installation) | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| [Bun](https://bun.sh) ≥ 1.0 | `curl -fsSL https://bun.sh/install \| bash` |
| Git | — |

> Windows: WSL2 o [EVVM Docker](https://github.com/EVVM-org/evvm-docker)

## Paso 1 — Clonar EVVM CLI

```bash
git clone --recursive https://github.com/EVVM-org/evvm-cli evvm-cli
cd evvm-cli
bun install
```

Referencia: [EVVM QuickStart](https://www.evvm.info/docs/QuickStart)

## Paso 2 — Configurar Base como host

```bash
cp .env.example .env
```

```bash
# Base Sepolia (testing)
RPC_URL="https://sepolia.base.org"

# Base Mainnet (producción)
# RPC_URL="https://mainnet.base.org"

# EVVM Registry (siempre Ethereum Sepolia)
EVVM_REGISTRATION_RPC_URL="https://gateway.tenderly.co/public/sepolia"

# Verificación — Etherscan v2 (BaseScan)
ETHERSCAN_API="tu_basescan_api_key"
```

Plantilla del proyecto: `deploy/evvm.env.example`

### Verificar conectividad

```bash
curl -s https://sepolia.base.org \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Resultado: 0x14a34 → chain ID 84532
```

## Paso 3 — Importar wallet

```bash
cast wallet import deployer --interactive
cast wallet address deployer
```

Fondos necesarios:
- **ETH en Base Sepolia** — deploy EVVM + gas EAS
- **ETH en Ethereum Sepolia** — registro EVVM Registry

Faucets:
- [Base Sepolia](https://www.alchemy.com/faucets/base-sepolia)
- [Sepolia](https://sepoliafaucet.com)

## Paso 4 — Desplegar EVVM

```bash
chmod +x evvm
./evvm deploy --walletName deployer
```

### Configuración recomendada API Angulo

| Campo | Valor |
|---|---|
| EVVM Name | `API Angulo EVVM` |
| Token Name | `Impact Token` |
| Symbol | `IMPACT` |
| admin | Wallet del equipo |
| goldenFisher | Dirección del relayer |
| activator | Dirección del relayer |
| Verificación | **Etherscan v2** |

### Contratos desplegados

| Contrato | Propósito |
|---|---|
| `Evvm` | Core VM virtual |
| `Staking` | Staking y recompensas |
| `Estimator` | Cálculo de recompensas |
| `NameService` | Identidad del servicio |
| `Treasury` | Fondo operacional |
| `P2PSwap` | Intercambio P2P |

## Paso 5 — Registrar en EVVM Registry

```bash
./evvm register --evvmAddress 0x<TU_EVVM> --walletName deployer
```

> Registro en **Ethereum Sepolia** — siempre, independiente del host chain.

Registry: `0x389dC8fb09211bbDA841D59f4a51160dA2377832`

### Verificar

```bash
cast call 0x389dC8fb09211bbDA841D59f4a51160dA2377832 \
  "getEvvmIdMetadata(uint256)" <EVVM_ID> \
  --rpc-url https://gateway.tenderly.co/public/sepolia

cast call <EVVM_ADDRESS> "getEvvmID()" \
  --rpc-url https://sepolia.base.org
```

## Paso 6 — Configurar API Angulo

```bash
EVVM_CORE_ADDRESS=0x...
EVVM_STAKING_ADDRESS=0x...
EVVM_ID=1001
```

## EAS en Base (no requiere deploy)

EAS ya está predeployado. Solo registrar schema:

```bash
cd API-Angulo
npm run register-schema
```

| Contrato | Dirección |
|---|---|
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

## Servicio EVVM gasless (roadmap)

Para attestations sin gas del cliente, crear un servicio EVVM que envuelva EAS:

```solidity
import {EvvmService} from "@evvm/testnet-contracts/library/EvvmService.sol";

contract ImpactAttestationService is EvvmService {
    // Fisher ejecuta eas.attest() tras validar firma EIP-191 del usuario
}
```

Guía: [How to Create an EVVM Service](https://www.evvm.info/docs/HowToMakeAEVVMService)

## Redes Base

| Entorno | Chain ID | RPC |
|---|---|---|
| Base Sepolia | `84532` | `https://sepolia.base.org` |
| Base Mainnet | `8453` | `https://mainnet.base.org` |

## Docker (alternativa)

```bash
git clone https://github.com/EVVM-org/evvm-docker
cd evvm-docker
echo 'RPC_URL="https://sepolia.base.org"' > .env
docker compose run --rm evvm-cli deploy
```

## Checklist

- [ ] Instalar Foundry + Bun
- [ ] Clonar `evvm-cli`, configurar `RPC_URL` = Base Sepolia
- [ ] Fondear wallet: ETH Base Sepolia + ETH Sepolia
- [ ] `./evvm deploy`
- [ ] `./evvm register`
- [ ] Copiar direcciones a `.env` de API Angulo
- [ ] `npm run register-schema` (EAS)
- [ ] `npm run check-deployment`
- [ ] Probar `POST /api/v1/certificates/issue`

## Recursos

| Recurso | URL |
|---|---|
| EVVM Docs | https://www.evvm.info/docs/intro |
| EVVM QuickStart | https://www.evvm.info/docs/QuickStart |
| EVVM Services | https://www.evvm.info/docs/HowToMakeAEVVMService |
| EVVM CLI | https://github.com/EVVM-org/evvm-cli |
| Base Docs | https://docs.base.org |
| EAS en Base | [EAS.md](./EAS.md) |
| Deploy completo | [DEPLOY-BASE.md](./DEPLOY-BASE.md) |
| API Reference | [API.md](./API.md) |
