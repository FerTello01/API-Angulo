# Guía de implementación — Proofact API

Documento definitivo para integrar la API de certificación de impacto en tu producto. Si sigues este flujo, tu integración funcionará contra el contrato real de la API v1.

**Referencias complementarias:**

| Recurso | URL |
|---|---|
| Guía interactiva (web) | `http://localhost:3001/developers` |
| OpenAPI Scalar | `http://localhost:3000/docs` |
| Spec JSON | `http://localhost:3000/openapi.json` |
| Referencia técnica | [API.md](./API.md) |

---

## 1. Arquitectura en una página

```
Tu backend ──POST /issue──► Proofact API ──► IPFS (evidencia)
                                │
                                └──► Relayer ──► EAS.attest() ──► Base
                                
Tu backend ◄──GET /:id (polling)──  Proofact API
Tu usuario ──► EAS Scan ──► Verifica attestationUID on-chain
```

**Tu empresa no usa Web3.** Solo consumes REST JSON. Proofact firma transacciones y paga gas.

---

## 2. Prerrequisitos

### Para integrar (tu equipo de desarrollo)

- Cliente HTTP (fetch, axios, requests, etc.)
- Capacidad de hacer **polling** (cada 3–5 s, timeout 120 s)
- Almacenar el `certificateId` (UUID) tras cada emisión

### Para operar Proofact (equipo de plataforma)

```bash
cp apps/api/.env.example apps/api/.env
# Configurar RELAYER_PRIVATE_KEY (wallet con ETH en Base Sepolia)

pnpm --filter @proofact/api register-schema   # → EAS_IMPACT_SCHEMA_UID
pnpm --filter @proofact/api check-deployment  # validar readiness
pnpm dev                                      # API :3000 + Web :3001
```

| Variable | Requerida | Descripción |
|---|---|---|
| `RELAYER_PRIVATE_KEY` | **Sí** | Wallet que firma y paga gas |
| `EAS_IMPACT_SCHEMA_UID` | **Sí** (prod) | UID del schema EAS registrado |
| `BASE_NETWORK` | No | `sepolia` (default) o `mainnet` |
| `BASE_RPC_URL` | No | RPC de Base |

Guía de despliegue completa: [DEPLOY-BASE.md](./DEPLOY-BASE.md)

---

## 3. Contrato de la API (v1)

### Base URL

| Entorno | URL |
|---|---|
| Desarrollo | `http://localhost:3000` |
| Producción | Configurar según despliegue (ej. `https://api.tudominio.com`) |

### Headers obligatorios

```http
Content-Type: application/json
```

### Autenticación

**v1 no requiere auth.** En producción pública, implementa API keys antes de exponer (roadmap).

### Endpoints

| Método | Ruta | Respuesta | Uso |
|---|---|---|---|
| `GET` | `/health` | `200` | Health check |
| `POST` | `/api/v1/certificates/issue` | `202` | Emitir certificado |
| `GET` | `/api/v1/certificates/:id` | `200` / `404` | Polling de estado |

---

## 4. Paso a paso — integración completa

### Paso 1: Emitir certificado

```http
POST /api/v1/certificates/issue
Content-Type: application/json
```

**Body mínimo:**

```json
{
  "companyTaxId": "ABC123456XYZ",
  "impactCategory": "carbon_offset",
  "amount": 15000
}
```

**Body recomendado (con evidencia):**

```json
{
  "companyTaxId": "ABC123456XYZ",
  "impactCategory": "carbon_offset",
  "amount": 15000,
  "evidence": {
    "description": "Compensación de 15 toneladas CO2e mediante reforestación Q1 2026",
    "metrics": {
      "co2e_tons": 15,
      "region": "MX-CHI",
      "methodology": "VCS"
    },
    "attachments": [
      "https://storage.tuempresa.com/reportes/q1-2026.pdf"
    ]
  },
  "metadata": {
    "internalRef": "CERT-2026-0042",
    "department": "sustainability"
  }
}
```

**Respuesta `202 Accepted` — guarda `certificateId`:**

```json
{
  "certificateId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "certificateHash": "0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8",
  "status": "PROCESSING",
  "ipfsCid": "bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4",
  "message": "Certificate issuance accepted. On-chain attestation is being processed by the relayer."
}
```

### Paso 2: Polling hasta confirmación

```http
GET /api/v1/certificates/{certificateId}
```

**Reglas de polling:**

| Parámetro | Valor |
|---|---|
| Intervalo | 3–5 segundos |
| Timeout máximo | 120 segundos |
| Detener cuando | `status` = `CONFIRMED` o `FAILED` |

**Estados posibles:**

| Estado | Significado | Qué hacer |
|---|---|---|
| `PROCESSING` | Attestation EAS en curso | Seguir polling |
| `CONFIRMED` | On-chain verificado | Usar `attestationUID` |
| `FAILED` | Error on-chain | Leer `errorMessage`, reintentar o escalar |

**Respuesta `CONFIRMED`:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "CONFIRMED",
  "attestationUID": "0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e",
  "txHash": "0xabc123...",
  "blockNumber": "1234567",
  "companyTaxId": "ABC123456XYZ",
  "impactCategory": "carbon_offset",
  "amount": "15000",
  "ipfsCid": "bafybeig...",
  "createdAt": "2026-07-12T08:00:00.000Z",
  "updatedAt": "2026-07-12T08:00:05.000Z"
}
```

### Paso 3: Verificar on-chain

Con el `attestationUID` de un certificado `CONFIRMED`:

- **Base Sepolia:** https://base-sepolia.easscan.org/attestation/view/{attestationUID}
- **Base Mainnet:** https://base.easscan.org/attestation/view/{attestationUID}

También puedes usar la UI pública de Proofact: `/verify?cert={certificateId}`

---

## 5. Validación de campos

| Campo | Tipo | Requerido | Reglas |
|---|---|---|---|
| `companyTaxId` | string | **Sí** | 3–32 chars, alfanumérico y guiones (`A-Z`, `0-9`, `-`) |
| `impactCategory` | string | **Sí** | 2–64 chars |
| `amount` | number \| string | **Sí** | Entero o decimal positivo |
| `evidence` | object | No | — |
| `evidence.description` | string | Si `evidence` | 10–2000 chars |
| `evidence.metrics` | object | No | Clave-valor libre |
| `evidence.attachments` | string[] | No | URLs válidas |
| `metadata` | object | No | No va on-chain |

### Categorías de impacto recomendadas

| `impactCategory` | Uso típico |
|---|---|
| `carbon_offset` | Compensación de carbono |
| `water_restoration` | Restauración de agua |
| `reforestation` | Reforestación |
| `renewable_energy` | Energía renovable |
| `waste_reduction` | Reducción de residuos |
| `biodiversity` | Protección de biodiversidad |
| `social_impact` | Impacto social comunitario |

> La API acepta cualquier string de 2–64 caracteres; estas son convenciones.

### Error de validación `400`

```json
{
  "error": "VALIDATION_ERROR",
  "details": {
    "companyTaxId": ["companyTaxId must be at least 3 characters"],
    "amount": ["amount must be a positive number"]
  }
}
```

---

## 6. Clientes de referencia

### cURL (smoke test)

```bash
API=http://localhost:3000

# Emitir
curl -s -X POST "$API/api/v1/certificates/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "companyTaxId": "ABC123456XYZ",
    "impactCategory": "carbon_offset",
    "amount": 15000,
    "evidence": {
      "description": "15 toneladas CO2e compensadas Q1 2026"
    }
  }' | jq .

# Consultar (reemplaza UUID)
curl -s "$API/api/v1/certificates/TU-CERTIFICATE-ID" | jq .
```

### JavaScript / TypeScript

```typescript
const API_BASE = process.env.PROOFACT_API_URL ?? 'http://localhost:3000';

interface IssueInput {
  companyTaxId: string;
  impactCategory: string;
  amount: number | string;
  evidence?: { description: string; metrics?: Record<string, unknown> };
  metadata?: Record<string, unknown>;
}

interface Certificate {
  id: string;
  status: 'PROCESSING' | 'CONFIRMED' | 'FAILED';
  attestationUID?: string;
  txHash?: string;
  blockNumber?: string;
  errorMessage?: string;
}

export async function issueAndWait(
  input: IssueInput,
  opts = { intervalMs: 4000, timeoutMs: 120_000 },
): Promise<Certificate> {
  const issueRes = await fetch(`${API_BASE}/api/v1/certificates/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!issueRes.ok) {
    const err = await issueRes.json();
    throw new Error(err.error ?? `Issue failed: HTTP ${issueRes.status}`);
  }

  const { certificateId } = await issueRes.json();
  const deadline = Date.now() + opts.timeoutMs;

  while (Date.now() < deadline) {
    const pollRes = await fetch(`${API_BASE}/api/v1/certificates/${certificateId}`);
    const cert: Certificate = await pollRes.json();

    if (cert.status === 'CONFIRMED') return cert;
    if (cert.status === 'FAILED') throw new Error(cert.errorMessage ?? 'Attestation failed');

    await new Promise((r) => setTimeout(r, opts.intervalMs));
  }

  throw new Error(`Timeout after ${opts.timeoutMs}ms waiting for certificate ${certificateId}`);
}

// Uso
const cert = await issueAndWait({
  companyTaxId: 'ABC123456XYZ',
  impactCategory: 'carbon_offset',
  amount: 15000,
  evidence: { description: '15 toneladas CO2e compensadas Q1 2026' },
});

console.log('EAS Scan:', `https://base-sepolia.easscan.org/attestation/view/${cert.attestationUID}`);
```

### Python

```python
import os
import time
import requests

API_BASE = os.environ.get("PROOFACT_API_URL", "http://localhost:3000")

def issue_and_wait(datos: dict, interval_s: float = 4, timeout_s: int = 120) -> dict:
    res = requests.post(f"{API_BASE}/api/v1/certificates/issue", json=datos, timeout=30)
    res.raise_for_status()
    certificate_id = res.json()["certificateId"]
    deadline = time.time() + timeout_s

    while time.time() < deadline:
        cert = requests.get(f"{API_BASE}/api/v1/certificates/{certificate_id}", timeout=30).json()
        if cert["status"] == "CONFIRMED":
            return cert
        if cert["status"] == "FAILED":
            raise RuntimeError(cert.get("errorMessage", "Attestation failed"))
        time.sleep(interval_s)

    raise TimeoutError(f"Timeout waiting for {certificate_id}")

cert = issue_and_wait({
    "companyTaxId": "ABC123456XYZ",
    "impactCategory": "carbon_offset",
    "amount": 15000,
    "evidence": {"description": "15 toneladas CO2e compensadas Q1 2026"},
})
print(cert["attestationUID"])
```

---

## 7. Manejo de errores

### Errores HTTP

| HTTP | Código | Acción |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Corregir payload según `details` |
| `404` | `NOT_FOUND` | `certificateId` inválido o servidor reiniciado* |

\* La API v1 usa almacenamiento **in-memory** — los certificados se pierden al reiniciar el proceso.

### Errores on-chain (`status: FAILED`)

| Mensaje típico | Causa | Solución |
|---|---|---|
| `CONFIG_ERROR` | Schema EAS no configurado | `pnpm --filter @proofact/api register-schema` |
| `INSUFFICIENT_FUNDS` | Relayer sin ETH | Recargar wallet ([faucet Base Sepolia](https://www.alchemy.com/faucets/base-sepolia)) |
| `TX_TIMEOUT` | RPC lento o caído | Verificar `BASE_RPC_URL` |
| `TX_REVERTED` | EAS rechazó la tx | Verificar `EAS_IMPACT_SCHEMA_UID` |
| `GAS_ESTIMATION_FAILED` | Simulación falló | Revisar parámetros del schema |
| `NETWORK_ERROR` | Sin conectividad RPC | Verificar red y RPC |

### Estrategia de reintentos recomendada

| Situación | Reintentar emisión? |
|---|---|
| `VALIDATION_ERROR` | No — corregir datos |
| `FAILED` por fondos/config | No — arreglar servidor primero |
| `FAILED` por timeout de red | Sí — con nuevo `POST /issue` |
| Timeout de polling (120s) | Sí — consultar una vez más; si sigue `PROCESSING`, escalar |

---

## 8. Checklist de integración

Antes de ir a producción, verifica:

- [ ] `GET /health` responde `200`
- [ ] Emisión con body mínimo devuelve `202` + `certificateId`
- [ ] Polling llega a `CONFIRMED` en Base Sepolia
- [ ] `attestationUID` visible en [EAS Scan](https://base-sepolia.easscan.org)
- [ ] Manejas `VALIDATION_ERROR` (400) en tu UI/logs
- [ ] Manejas `FAILED` con mensaje al usuario
- [ ] Timeout de polling configurado (120s)
- [ ] `certificateId` persistido en tu base de datos
- [ ] Llamadas a la API desde **tu backend** (no desde el browser en prod)

---

## 9. Despliegue del frontend (Vercel)

El frontend Proofact vive en `apps/web/`. Vercel **debe** usar ese directorio como raíz del proyecto.

### Configuración en Vercel

En **Vercel → Project Settings → General → Root Directory**:

```
apps/web
```

| Campo | Valor |
|---|---|
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && pnpm install` |
| Build Command | `next build` |

El archivo [`apps/web/vercel.json`](../apps/web/vercel.json) define estos comandos. Si Root Directory queda en la raíz del repo, el build falla con *"No Next.js version detected"* porque `next` solo está en `apps/web/package.json`.

> **No** dejes un `pnpm-lock.yaml` dentro de `apps/web/` — usa solo el lockfile del monorepo en la raíz.

### Variables de entorno en Vercel (web)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.tudominio.com` | URL pública de la API |

Sin esta variable, el frontend apunta a `http://localhost:3000` y fallará en producción.

---

## 10. Limitaciones v1 (importante)

| Limitación | Impacto | Mitigación |
|---|---|---|
| Store in-memory | Certificados se pierden al reiniciar API | Persistir `certificateId` + datos en tu DB |
| IPFS mock (dev) | CID simulado | OK para integración; prod requiere IPFS real |
| Sin autenticación | API abierta | No exponer públicamente sin API keys |
| Sin webhooks | Debes hacer polling | Implementar polling en tu backend |
| Sin idempotencia | Doble POST = dos certificados | Usar `metadata.internalRef` para deduplicar en tu lado |

---

## 11. Roadmap

| Feature | Estado |
|---|---|
| `GET /docs` + OpenAPI | Implementado |
| Guía web `/developers` | Implementado |
| API Keys / JWT | Planificado |
| Webhooks `certificate.confirmed` | Planificado |
| `GET /certificates?taxId=` | Planificado |
| Revocación EAS | Planificado |

---

## 12. Soporte y herramientas

| Herramienta | Para qué |
|---|---|
| [Scalar](http://localhost:3000/docs) | Probar endpoints interactivamente |
| [Postman](https://www.postman.com) | Importar `http://localhost:3000/openapi.json` |
| [Panel admin](http://localhost:3001/admin/issue) | Probar sin código |
| [Verificar](http://localhost:3001/verify) | Consultar certificado por UUID |

**Repositorio:** https://github.com/FerTello01/API-Angulo
