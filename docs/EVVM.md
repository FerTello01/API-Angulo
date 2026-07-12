# Despliegue de EVVM — API Angulo

**[EVVM (Ethereum Virtual Virtual Machine)](https://www.evvm.info/docs/intro)** es una blockchain virtual que se despliega sobre una red host EVM existente (como Gravity), sin necesidad de gestionar validadores ni infraestructura propia.

API Angulo utiliza EVVM como capa de ejecución virtual sobre Gravity, combinada con **EAS** para attestations de impacto corporativo.

## ¿EVVM es compatible con EAS?

**Sí.** Ambos son 100% compatibles con EVM:

| Protocolo | Compatibilidad | Razón |
|---|---|---|
| **EVVM** | EVM nativo | Despliega contratos Solidity sobre cualquier host chain EVM |
| **EAS** | EVM nativo | [`eas-contracts`](https://github.com/ethereum-attestation-service/eas-contracts) desplegable en cualquier red EVM |

EVVM no reemplaza a EAS — lo complementa:

```
┌─────────────────────────────────────────────────────────────┐
│                    Gravity (Host Chain)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              EVVM (Virtual Blockchain)               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │  EAS.sol     │  │ SchemaRegistry│  │ Relayer  │ │    │
│  │  │  attestations│  │  schemas     │  │ Service  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │         ▲ Fishers ejecutan transacciones gasless     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ API Angulo (Fastify + Viem + EAS SDK)
         │ Relayer firma attestations / Fishers ejecutan
```

### Ventajas de EVVM + EAS para API Angulo

| Beneficio | Descripción |
|---|---|
| **Gasless para clientes B2B** | Los fishers ejecutan transacciones; el cliente corporativo no paga gas |
| **Blockchain propia sin infra** | Instancia EVVM dedicada a certificaciones de impacto |
| **Attestations estándar EAS** | Interoperables con ecosistema Ethereum |
| **Seguridad heredada** | Gravity como host chain aporta finalidad y seguridad |
| **Escalabilidad vertical** | Múltiples EVVMs sobre la misma red Gravity |

## Arquitectura API Angulo con EVVM

```
Cliente B2B (REST, sin Web3)
       │
       ▼
┌──────────────────┐     IPFS           ┌─────────────┐
│  Fastify API     │ ─────────────────► │  IPFS CID   │
│  POST /issue     │                    └─────────────┘
└────────┬─────────┘
         │ async
         ▼
┌──────────────────┐   EAS SDK          ┌──────────────────────────────┐
│  Web3 Relayer    │ ─────────────────► │  EAS.sol (dentro de EVVM)    │
│  + Fisher        │   eas.attest()     │  Schema: ImpactCertification │
└──────────────────┘                    └──────────────────────────────┘
                                                    │
                                          EVVM sobre Gravity (host)
```

## Prerrequisitos

| Herramienta | Versión | Instalación |
|---|---|---|
| [Foundry](https://book.getfoundry.sh/getting-started/installation) | latest | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| [Bun](https://bun.sh) | ≥ 1.0 | `curl -fsSL https://bun.sh/install \| bash` |
| Git | latest | — |

> **Windows:** Usar WSL2 o [EVVM Docker](https://github.com/EVVM-org/evvm-docker).

## Paso 1 — Clonar EVVM CLI

```bash
git clone --recursive https://github.com/EVVM-org/evvm-cli evvm-cli
cd evvm-cli
bun install
```

Referencia: [EVVM QuickStart](https://www.evvm.info/docs/QuickStart)

## Paso 2 — Configurar entorno para Gravity

```bash
cp .env.example .env
```

Edita `.env` apuntando a Gravity como host chain:

```bash
# Gravity como host chain
# Mainnet L1 (producción)
RPC_URL="https://mainnet-rpc.gravity.xyz"

# Testnet (desarrollo)
# RPC_URL="https://rpc-sepolia.gravity.xyz"

# Registro EVVM (siempre en Ethereum Sepolia)
EVVM_REGISTRATION_RPC_URL="https://gateway.tenderly.co/public/sepolia"

# Verificación de contratos (Sourcify recomendado para Gravity)
# ETHERSCAN_API="your_api_key"
```

### Verificar conectividad con Gravity

```bash
curl -s https://mainnet-rpc.gravity.xyz \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Esperado: {"result":"0x1f0b9"} → chain ID 127001
```

## Paso 3 — Importar wallet

```bash
cast wallet import defaultKey --interactive
```

> **Nunca** guardes llaves privadas en `.env`. Usa el keystore encriptado de Foundry.

La wallet necesita saldo en **G** (Gravity) para el despliegue y en **ETH Sepolia** para el registro en EVVM Registry.

## Paso 4 — Desplegar EVVM

```bash
chmod +x evvm
./evvm deploy --walletName defaultKey
```

El wizard interactivo solicitará:

### Direcciones de administrador (requeridas)

| Rol | Descripción | Recomendación API Angulo |
|---|---|---|
| `admin` | Administrador del contrato EVVM | Wallet del equipo |
| `goldenFisher` | Cuenta sudo para staking privilegiado | Wallet del relayer |
| `activator` | Gestiona activación de epochs | Wallet del relayer |

### Configuración de token

```text
EVVM Name:        API Angulo EVVM
Principal Token:  Impact Token
Symbol:           IMPACT
```

### Verificación en block explorer

Selecciona **Sourcify** (Gravity no tiene Etherscan nativo):

```text
Select block explorer verification:
  Sourcify    ← Recomendado para Gravity
```

### Contratos desplegados

Al finalizar verás 6 contratos core:

| Contrato | Propósito | Uso en API Angulo |
|---|---|---|
| `Evvm` | Lógica core de la VM virtual | Pagos y nonces |
| `Staking` | Staking y recompensas | Staking del relayer/fishers |
| `Estimator` | Cálculo de recompensas | — |
| `NameService` | Sistema de nombres | Identidad del servicio |
| `Treasury` | Gestión de activos | Fondo operacional |
| `P2PSwap` | Intercambio P2P de tokens | — |

Guarda las direcciones en `output/evvmDeployment.json`.

## Paso 5 — Registrar en EVVM Registry

El registro se hace **siempre en Ethereum Sepolia**, independientemente del host chain.

```bash
./evvm register --evvmAddress 0x<TU_EVVM_ADDRESS> --walletName defaultKey
```

O durante el deploy, responde `y` cuando pregunte:

```text
Do you want to register the EVVM instance now? (y/n): y
```

Recibirás un **EVVM ID ≥ 1000** permanente.

### Verificar registro

```bash
# Metadata del EVVM ID (Ethereum Sepolia)
cast call 0x389dC8fb09211bbDA841D59f4a51160dA2377832 \
  "getEvvmIdMetadata(uint256)" <EVVM_ID> \
  --rpc-url https://gateway.tenderly.co/public/sepolia

# ID en tu contrato EVVM (Gravity)
cast call <EVVM_ADDRESS> "getEvvmID()" \
  --rpc-url https://mainnet-rpc.gravity.xyz
```

Registry: [Etherscan Sepolia](https://sepolia.etherscan.io/address/0x389dC8fb09211bbDA841D59f4a51160dA2377832)

## Paso 6 — Desplegar EAS sobre tu EVVM

Una vez desplegada la instancia EVVM, despliega los contratos EAS en la misma red (Gravity):

```bash
git clone https://github.com/ethereum-attestation-service/eas-contracts
cd eas-contracts

# Desplegar EAS + SchemaRegistry en Gravity
forge script script/Deploy.ts \
  --rpc-url https://mainnet-rpc.gravity.xyz \
  --broadcast \
  --private-key $DEPLOYER_KEY
```

### Registrar Schema de Impacto

```bash
# Schema para certificaciones corporativas
SCHEMA="string companyTaxId,string impactCategory,uint256 amount,string ipfsEvidence"

cast send $SCHEMA_REGISTRY_ADDRESS \
  "register(string,address,bool)" \
  "$SCHEMA" \
  "0x0000000000000000000000000000000000000000" \
  true \
  --rpc-url https://mainnet-rpc.gravity.xyz \
  --private-key $DEPLOYER_KEY
```

### Configurar API Angulo

Actualiza tu `.env` del proyecto API Angulo:

```bash
# EVVM
EVVM_CORE_ADDRESS=0x...
EVVM_STAKING_ADDRESS=0x...
EVVM_ID=1001

# EAS (desplegado sobre EVVM/Gravity)
EAS_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_REGISTRY_ADDRESS=0x...
EAS_IMPACT_SCHEMA_UID=0x...

# Gravity host chain
GRAVITY_NETWORK=mainnet
GRAVITY_RPC_URL=https://mainnet-rpc.gravity.xyz
RELAYER_PRIVATE_KEY=0x...
```

## Paso 7 — Crear servicio EVVM para attestations (opcional)

Para habilitar attestations **gasless** vía fishers, crea un servicio EVVM que envuelva EAS:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EvvmService} from "@evvm/testnet-contracts/library/EvvmService.sol";
import {IEAS} from "@ethereum-attestation-service/eas-contracts/IEAS.sol";

contract ImpactAttestationService is EvvmService {
    IEAS public eas;
    bytes32 public impactSchemaUID;

    constructor(
        address _coreAddress,
        address _stakingAddress,
        address _easAddress,
        bytes32 _schemaUID
    ) EvvmService(_coreAddress, _stakingAddress) {
        eas = IEAS(_easAddress);
        impactSchemaUID = _schemaUID;
    }

    function attestImpact(
        address user,
        bytes calldata encodedData,
        address senderExecutor,
        address originExecutor,
        uint256 nonce,
        bool isAsyncExec,
        bytes calldata signature,
        uint256 priorityFeeEvvm,
        uint256 nonceEvvm,
        bool isAsyncExecEvvm,
        bytes calldata signatureEvvm
    ) external {
        core.validateAndConsumeNonce(
            user,
            senderExecutor,
            keccak256(abi.encode("attestImpact", encodedData)),
            originExecutor,
            nonce,
            isAsyncExec,
            signature
        );

        // Fisher ejecuta la attestation EAS on-chain
        eas.attest(
            IEAS.AttestationRequest({
                schema: impactSchemaUID,
                data: IEAS.AttestationRequestData({
                    recipient: address(0),
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: encodedData,
                    value: 0
                })
            })
        );
    }
}
```

Guía completa de servicios: [How to Create an EVVM Service](https://www.evvm.info/docs/HowToMakeAEVVMService)

## Alternativa: Docker

Si prefieres no instalar Foundry/Bun localmente:

```bash
git clone https://github.com/EVVM-org/evvm-docker
cd evvm-docker

echo 'RPC_URL="https://mainnet-rpc.gravity.xyz"' > .env

docker compose run --rm evvm-cli deploy
```

## Redes Gravity para EVVM

| Entorno | Chain ID | RPC | Uso |
|---|---|---|---|
| Gravity Mainnet (L1) | `127001` | `https://mainnet-rpc.gravity.xyz` | Producción |
| Gravity Alpha Sepolia | `13505` | `https://rpc-sepolia.gravity.xyz` | Testing |
| Gravity Alpha L2 (legacy) | `1625` | `https://rpc.gravity.xyz` | Legacy |

## Checklist de despliegue

- [ ] Instalar Foundry + Bun
- [ ] Clonar `evvm-cli` y configurar `RPC_URL` con Gravity
- [ ] Importar wallet con `cast wallet import`
- [ ] Fondear wallet con G (Gravity) + ETH (Sepolia para registro)
- [ ] Ejecutar `./evvm deploy`
- [ ] Registrar EVVM en Registry (`./evvm register`)
- [ ] Guardar direcciones de contratos en `.env`
- [ ] Desplegar EAS (`eas-contracts`) en Gravity
- [ ] Registrar schema `ImpactCertification`
- [ ] Configurar variables EAS en API Angulo
- [ ] (Opcional) Crear `ImpactAttestationService` para flujo gasless
- [ ] Probar `POST /api/v1/certificates/issue`

## Recursos

| Recurso | URL |
|---|---|
| EVVM Docs | https://www.evvm.info/docs/intro |
| EVVM QuickStart | https://www.evvm.info/docs/QuickStart |
| EVVM Services | https://www.evvm.info/docs/HowToMakeAEVVMService |
| EVVM CLI (GitHub) | https://github.com/EVVM-org/evvm-cli |
| EVVM Docker | https://github.com/EVVM-org/evvm-docker |
| EAS Docs | https://docs.attest.org/docs/welcome |
| EAS + EVVM (este proyecto) | [EAS.md](./EAS.md) |
| Gravity Docs | https://docs.gravity.xyz |
