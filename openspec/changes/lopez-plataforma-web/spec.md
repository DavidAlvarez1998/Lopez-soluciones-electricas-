# Spec — López Soluciones Eléctricas: Plataforma Web

**Change name:** `lopez-plataforma-web`
**Date:** 2026-05-23
**Status:** Draft
**Artifact store:** openspec

---

## Scope note

This is a **greenfield platform** — no existing specs exist. All requirements below are NEW.
RFC 2119 keywords apply throughout: **MUST/SHALL** = absolute, **SHOULD** = recommended, **MAY** = optional.

---

## Users

| User | Description | Auth |
|------|-------------|------|
| `visitante` | Any member of the public accessing the site | None (anon) |
| `admin` | Carlos López or authorized team member | Supabase Auth (email + password) |

---

## Module 1 — Landing Pública

### Requirement: Migración visual fiel

The system SHALL render a public landing page that replicates the visual design of `index_legacy.html` using the brand palette (`#030f23` navy, `#1354a8` blue, `#f04e2b` accent) and typography (Barlow Condensed / Barlow).

The page MUST include sections: Hero, Servicios (6 services), Sectores (4 sectors), Cotización CTA, Contacto, and Footer with company data.

All click-to-WhatsApp and mailto CTAs MUST be preserved.

The landing MUST achieve Lighthouse score > 90 in Performance and Accessibility.

#### Scenario: Visitor loads the landing

- GIVEN a visitor navigates to `/`
- WHEN the page renders
- THEN all sections (Hero, Servicios, Sectores, Cotización, Contacto, Footer) are visible
- AND brand colors and typography match the legacy HTML exactly

#### Scenario: Visitor clicks WhatsApp CTA

- GIVEN a visitor is on the landing
- WHEN they click a WhatsApp CTA button
- THEN the browser opens a `wa.me/573004513435` link with a pre-filled message
- AND no authentication is required

---

## Module 2 — Formulario de Cotización Pública

### Requirement: Solicitud pública persistida

The system SHALL present a public form at `/cotizar` (or as an anchor section on `/`) that allows any `visitante` to submit a quote request without authentication.

The form MUST collect: nombre completo, teléfono, dirección del trabajo, descripción del trabajo. Fecha se registra automáticamente.

On submit, the system MUST persist the request as a `cotizaciones_solicitudes` record with `estado = 'nueva'`.

The `anon` Supabase role MUST have INSERT-only access to `cotizaciones_solicitudes`. No SELECT, UPDATE, or DELETE.

#### Scenario: Visitante envía formulario válido

- GIVEN a visitor is on the public quote form
- WHEN they fill all required fields and submit
- THEN a `cotizaciones_solicitudes` row is created with `estado = 'nueva'`
- AND a success confirmation message is displayed on screen
- AND no redirect to an authenticated area occurs

#### Scenario: Formulario con campos vacíos

- GIVEN a visitor is on the public quote form
- WHEN they attempt to submit with one or more required fields empty
- THEN the system MUST prevent submission and highlight the missing fields
- AND no database record is created

#### Scenario: Inyección de datos por visitante anónimo

- GIVEN the anon Supabase role
- WHEN a request attempts SELECT on `cotizaciones_solicitudes`
- THEN the RLS policy MUST reject the query and return zero rows

---

## Module 3 — Autenticación Admin

### Requirement: Login con Supabase Auth

The system SHALL protect all `/admin/*` routes behind Supabase Auth (email + password).

Unauthenticated requests to any `/admin/*` route MUST redirect to `/admin/login`.

Only one admin account exists in MVP. Multi-user and role management are out of scope.

Session MUST be maintained via Supabase's built-in session cookies, not custom JWT logic.

#### Scenario: Admin hace login exitoso

- GIVEN Carlos navigates to `/admin/login`
- WHEN he submits valid email and password
- THEN he is redirected to `/admin` (dashboard)
- AND the session cookie is set

#### Scenario: Credenciales incorrectas

- GIVEN Carlos is on `/admin/login`
- WHEN he submits an invalid email or password
- THEN an error message is shown ("Credenciales incorrectas")
- AND no session is created

#### Scenario: Visitante intenta acceder a ruta admin

- GIVEN an unauthenticated user
- WHEN they navigate to any `/admin/*` path
- THEN the middleware MUST redirect them to `/admin/login`

#### Scenario: Admin cierra sesión

- GIVEN Carlos is authenticated in `/admin`
- WHEN he clicks "Cerrar sesión"
- THEN the Supabase session is invalidated and he is redirected to `/admin/login`

---

## Module 4 — Dashboard Admin

### Requirement: Métricas básicas de operación

The system SHALL display at `/admin` a dashboard with the following live metrics:

| Métrica | Fuente |
|---------|--------|
| Solicitudes públicas nuevas | `cotizaciones_solicitudes` WHERE `estado = 'nueva'` |
| Cotizaciones pendientes | `cotizaciones` WHERE `estado = 'pendiente'` |
| Cuentas de cobro pendientes | `cuentas_cobro` WHERE `estado = 'pendiente'` |
| Total cobrado en el mes | `cuentas_cobro` WHERE `estado = 'pagada'` AND `fecha_pago` in current calendar month |

The dashboard MUST provide quick-access navigation links to each admin module.

#### Scenario: Dashboard carga con datos reales

- GIVEN Carlos is authenticated
- WHEN he navigates to `/admin`
- THEN the four metrics are displayed with their current counts/totals
- AND each metric card links to the corresponding module filtered by that state

#### Scenario: Dashboard sin actividad

- GIVEN no records exist yet
- WHEN Carlos views the dashboard
- THEN all metrics show zero without errors

---

## Module 5 — Módulo Clientes

### Requirement: CRUD de clientes con autocomplete

The system SHALL allow the admin to create, read, update, and delete client records.

Each client record MUST store: `nombre_razon_social` (text, required), `nit_cc` (text, required), `direccion` (text), `telefono` (text), `correo` (text), `created_at` (timestamp).

The system MUST provide autocomplete search by `nombre_razon_social` that is **case-insensitive** and **accent-insensitive** (e.g., "industrias" matches "Industrias" and "INDUSTRIAS").

The Postgres index MUST use `lower(unaccent(nombre_razon_social))` to support this.

When an existing client is selected in any document form, all their fields MUST auto-populate (NIT/CC, dirección, teléfono, correo).

#### Scenario: Crear cliente nuevo

- GIVEN Carlos is on `/admin/clientes/nuevo`
- WHEN he fills nombre_razon_social and nit_cc and saves
- THEN a new `clientes` row is created
- AND the system redirects to the client detail page

#### Scenario: Autocomplete encuentra cliente

- GIVEN a client "Industrias XYZ S.A.S." exists in the database
- WHEN Carlos types "indust" in a client search field
- THEN "Industrias XYZ S.A.S." appears in the dropdown
- AND selecting it populates NIT, dirección, teléfono, correo automatically

#### Scenario: Autocomplete con tildes

- GIVEN a client named "Acueducto Risaralda" exists
- WHEN Carlos types "acueducto" (no accent)
- THEN the client appears in results

#### Scenario: Editar cliente

- GIVEN an existing client record
- WHEN Carlos updates the telefono field and saves
- THEN the `clientes` row is updated
- AND previously linked documents still reference the same client_id

#### Scenario: Eliminar cliente con documentos vinculados

- GIVEN a client has linked cotizaciones or cuentas_cobro
- WHEN Carlos attempts to delete the client
- THEN the system MUST prevent deletion and show an explanatory message
- AND the client record is preserved

---

## Module 6 — Módulo Cotizaciones (Admin)

### Requirement: CRUD de cotizaciones con consecutivo automático

The system SHALL allow the admin to create, read, update, and delete quotes.

Each quote MUST have: `consecutivo` (auto-generated, format `COT-{YYYY}-{NNN}` zero-padded 3 digits), `cliente_id` (FK to `clientes`), `concepto` (text), `estado` (`pendiente | aprobada | rechazada`), `fecha_creacion`, `fecha_modificacion`, and one-or-more `cotizaciones_items`.

Each item MUST store: `descripcion`, `valor` (numeric, no quantity column — cotizaciones use simpler format per the document design).

The `total` MUST be computed as `SUM(items.valor)` and stored/displayed without IVA.

Consecutivos MUST be generated using a Postgres `SEQUENCE` (not `MAX+1` in application code) to prevent duplicates under concurrent inserts.

The admin MAY create a quote from scratch or from a `cotizaciones_solicitudes` record.

#### Scenario: Crear cotización desde cero

- GIVEN Carlos is on `/admin/cotizaciones/nueva`
- WHEN he selects an existing client, adds items, and saves
- THEN a new `cotizaciones` row is created with `estado = 'pendiente'`
- AND the consecutivo is assigned by the Postgres sequence (e.g., `COT-2026-001`)
- AND the total equals the sum of all item values

#### Scenario: Crear cotización desde solicitud pública

- GIVEN a `cotizaciones_solicitudes` record with `estado = 'nueva'`
- WHEN Carlos opens it and clicks "Crear cotización"
- THEN a pre-filled cotización form opens with the requester's data
- AND on save the solicitud's `estado` changes to `'atendida'`

#### Scenario: Cambiar estado a aprobada

- GIVEN a cotización with `estado = 'pendiente'`
- WHEN Carlos sets `estado = 'aprobada'`
- THEN the record is updated and the "Generar cuenta de cobro" action becomes available

#### Scenario: Cambiar estado a rechazada

- GIVEN a cotización with `estado = 'pendiente'` or `'aprobada'`
- WHEN Carlos sets `estado = 'rechazada'`
- THEN the record is updated and no account-generation action is shown

#### Scenario: Consecutivo sin colisión concurrente

- GIVEN two cotizaciones are created simultaneously
- WHEN both trigger the sequence
- THEN each receives a unique consecutivo value and no duplicate is created

---

## Module 7 — Módulo Cuentas de Cobro (Admin)

### Requirement: CRUD de cuentas de cobro con items y seguimiento de pago

The system SHALL allow the admin to create, read, update, and delete payment accounts (cuentas de cobro).

Each cuenta de cobro MUST store: `consecutivo` (auto-generated, format `COB-{YYYY}-{NNN}`), `cliente_id` (FK), `cotizacion_id` (FK, nullable), `observaciones` (free text), `estado` (`pendiente | pagada`), `fecha_creacion`, `fecha_pago` (nullable, set when `estado = 'pagada'`), `subtotal`, `total`.

Each item MUST store: `descripcion`, `cantidad` (numeric), `valor_unidad` (numeric), `valor_total` (computed: `cantidad × valor_unidad`).

`subtotal` and `total` MUST equal `SUM(items.valor_total)`. No IVA applied.

The PDF MUST include fixed bank details (Davivienda N° 127070034526 Ahorros / Bancolombia N° 27054262871 Ahorros) and fixed signatory (Carlos Andrés López Osorio, C.C. 1.088.252.549). These are hardcoded constants in MVP.

#### Scenario: Generar cuenta de cobro desde cotización aprobada

- GIVEN a cotización with `estado = 'aprobada'`
- WHEN Carlos clicks "Generar cuenta de cobro"
- THEN a new `cuentas_cobro` record is created with `cotizacion_id` set to the source quote
- AND `cliente_id`, `concepto`, and items are pre-populated from the cotización
- AND the new document gets its own `COB-{YYYY}-{NNN}` consecutivo

#### Scenario: Cálculo automático de totales

- GIVEN a cuenta de cobro form with items
- WHEN Carlos enters cantidad = 2 and valor_unidad = 150000 for an item
- THEN valor_total for that item shows 300000
- AND subtotal and total update immediately to reflect all items

#### Scenario: Marcar como pagada

- GIVEN a cuenta de cobro with `estado = 'pendiente'`
- WHEN Carlos sets `estado = 'pagada'` and confirms
- THEN `fecha_pago` is set to today's date
- AND the dashboard metric "Total cobrado en el mes" updates accordingly

#### Scenario: Crear cuenta de cobro independiente (sin cotización)

- GIVEN Carlos needs to bill for work done without a prior quote
- WHEN he creates a cuenta de cobro without linking a cotización
- THEN `cotizacion_id` is NULL
- AND the document is valid and can be exported

---

## Module 8 — Módulo Solicitudes Públicas (Admin)

### Requirement: Visualización de solicitudes del sitio web

The system SHALL display all `cotizaciones_solicitudes` records in the admin at `/admin/solicitudes`.

The admin MUST be able to filter by `estado` (`nueva | atendida | descartada`).

The admin MUST be able to change a solicitud's `estado` to `descartada` manually.

The admin MUST be able to navigate from a solicitud to create a formal cotización (linking the records).

#### Scenario: Ver solicitudes nuevas

- GIVEN one or more `cotizaciones_solicitudes` records with `estado = 'nueva'`
- WHEN Carlos opens `/admin/solicitudes`
- THEN all new requests are listed with nombre, teléfono, descripción, and fecha

#### Scenario: Descartar una solicitud

- GIVEN a solicitud with `estado = 'nueva'`
- WHEN Carlos marks it as `descartada`
- THEN `estado` updates to `'descartada'`
- AND it no longer appears in the "nuevas" dashboard count

---

## Module 9 — Adjuntos

### Requirement: Upload y vinculación de documentos a Supabase Storage

The system SHALL allow the admin to attach files (cédula, tarjeta profesional, work-support documents) to a cotización or cuenta de cobro.

Files MUST be uploaded to Supabase Storage in a protected bucket (not publicly accessible without a signed URL).

The `adjuntos` table MUST store: `entidad_tipo` (`'cotizacion' | 'cuenta_cobro'`), `entidad_id` (UUID), `storage_path`, `nombre_archivo`, `mime_type`, `created_at`.

The system MUST generate a **signed URL** with 7-day expiration when the admin needs to share an attachment.

File size MUST be limited to 10 MB per file at upload time. Images SHOULD be compressed server-side before storage.

#### Scenario: Subir un adjunto

- GIVEN Carlos is viewing a cotización or cuenta de cobro detail
- WHEN he uploads a PDF or image file under 10 MB
- THEN the file is stored in Supabase Storage
- AND an `adjuntos` row is created linking the file to the document
- AND the file appears in the document's attachment list

#### Scenario: Archivo demasiado grande

- GIVEN Carlos attempts to upload a file larger than 10 MB
- WHEN he selects the file
- THEN the system MUST reject the upload before sending it to Storage
- AND display an error message indicating the size limit

#### Scenario: Ver adjunto vinculado

- GIVEN an `adjuntos` record linked to a cuenta de cobro
- WHEN Carlos opens that cuenta de cobro
- THEN the attachment list shows `nombre_archivo` with a download/preview link

---

## Module 10 — Exportación PDF

### Requirement: Generación de PDF fiel al formato documental

The system SHALL generate downloadable PDFs for cotizaciones and cuentas de cobro that are visually faithful to the documented formats.

**Cotización PDF** MUST include: logo + NIT header, date, "COTIZACION" title, EMPRESA + NIT fields, CONCEPTO, items table (ITEMS | DESCRIPCION | VALOR), TOTAL, and closing signature block.

**Cuenta de Cobro PDF** MUST include: logo + NIT header, "CUENTA DE COBRO" + "SOLUCIONES ELÉCTRICAS LÓPEZ", date, consecutivo, DATOS DEL CONTRATANTE block, items table (ITEMS | DESCRIPCION DEL SERVICIO | CANTIDAD | VALOR UNIDAD | VALOR), VALOR TOTAL (subtotal + total sin IVA), FORMA DE PAGO (hardcoded bank details), OBSERVACIONES, signature block, footer email.

PDF generation MUST occur server-side (not in the browser) to avoid exposing sensitive layout logic.

Generated PDFs MUST also be uploadable to Supabase Storage so a signed URL can be shared via WhatsApp.

#### Scenario: Descargar PDF de cotización

- GIVEN a cotización with at least one item
- WHEN Carlos clicks "Descargar PDF"
- THEN a PDF file is generated server-side and downloaded to the browser
- AND the document matches the cotización format (logo, datos, tabla de items, total, firma)

#### Scenario: Descargar PDF de cuenta de cobro

- GIVEN a cuenta de cobro with items and client data
- WHEN Carlos clicks "Descargar PDF"
- THEN a PDF is generated matching the Cuenta de Cobro format including bank details and signature
- AND the file downloads immediately

#### Scenario: PDF con datos bancarios fijos

- GIVEN any cuenta de cobro PDF
- WHEN the PDF is rendered
- THEN it MUST include "Davivienda N° 127070034526 Ahorros" and "Bancolombia N° 27054262871 Ahorros"
- AND "Carlos Andrés López Osorio, C.C. 1.088.252.549" as signatory

---

## Module 11 — Compartir (WhatsApp / Correo)

### Requirement: Envío de documentos por WhatsApp y correo

The system SHALL provide sharing actions on every cotización and cuenta de cobro detail view.

**WhatsApp**: the system MUST generate a `wa.me/573004513435?text=...` link that includes a brief text summary and a signed Supabase Storage URL to the PDF (7-day expiry). Opening the link MUST NOT require the recipient to be authenticated.

**Correo (MVP)**: the system MUST provide a `mailto:` link pre-filled with the recipient's email (from `clientes.correo`), a subject, and a body containing the Storage URL to the PDF. A future phase MAY replace this with a transactional email service (Resend).

#### Scenario: Compartir por WhatsApp

- GIVEN a cuenta de cobro with a generated PDF stored in Storage
- WHEN Carlos clicks "Compartir por WhatsApp"
- THEN the browser opens `wa.me/573004513435` with a pre-filled text including the signed PDF URL
- AND the URL is valid for at least 7 days

#### Scenario: Compartir por correo (MVP mailto)

- GIVEN a cotización with a client email on file
- WHEN Carlos clicks "Compartir por correo"
- THEN the system opens a `mailto:` link pre-filled with the client's email, a subject line, and the PDF Storage URL in the body
- AND Carlos's email client opens ready to send

---

## Data Requirements

### Schema de tablas

| Tabla | Columnas clave | Notas |
|-------|---------------|-------|
| `clientes` | `id` UUID PK, `nombre_razon_social` text NOT NULL, `nit_cc` text NOT NULL, `direccion` text, `telefono` text, `correo` text, `created_at` timestamptz | Índice en `lower(unaccent(nombre_razon_social))` |
| `cotizaciones_solicitudes` | `id` UUID PK, `nombre` text NOT NULL, `telefono` text NOT NULL, `direccion` text, `descripcion` text NOT NULL, `estado` `nueva\|atendida\|descartada` DEFAULT `nueva`, `created_at` timestamptz | INSERT-only para rol `anon` via RLS |
| `cotizaciones` | `id` UUID PK, `consecutivo` text UNIQUE NOT NULL, `cliente_id` UUID FK, `concepto` text, `total` numeric, `estado` `pendiente\|aprobada\|rechazada` DEFAULT `pendiente`, `solicitud_id` UUID FK nullable, `created_at` timestamptz, `updated_at` timestamptz | Consecutivo via Postgres SEQUENCE |
| `cotizaciones_items` | `id` UUID PK, `cotizacion_id` UUID FK NOT NULL, `descripcion` text NOT NULL, `valor` numeric NOT NULL | No cantidad en cotizaciones |
| `cuentas_cobro` | `id` UUID PK, `consecutivo` text UNIQUE NOT NULL, `cliente_id` UUID FK, `cotizacion_id` UUID FK nullable, `observaciones` text, `subtotal` numeric, `total` numeric, `estado` `pendiente\|pagada` DEFAULT `pendiente`, `fecha_creacion` timestamptz, `fecha_pago` timestamptz nullable | Consecutivo via Postgres SEQUENCE |
| `cuentas_cobro_items` | `id` UUID PK, `cuenta_cobro_id` UUID FK NOT NULL, `descripcion` text NOT NULL, `cantidad` numeric NOT NULL, `valor_unidad` numeric NOT NULL, `valor_total` numeric GENERATED ALWAYS AS (cantidad * valor_unidad) STORED | Computed column |
| `adjuntos` | `id` UUID PK, `entidad_tipo` `cotizacion\|cuenta_cobro`, `entidad_id` UUID NOT NULL, `storage_path` text NOT NULL, `nombre_archivo` text, `mime_type` text, `created_at` timestamptz | Storage bucket: `adjuntos` (private) |

### Consecutivos

Consecutivos MUST use separate Postgres SEQUENCEs:
- `seq_cotizaciones` → format `COT-{YYYY}-{LPAD(nextval, 3, '0')}`
- `seq_cuentas_cobro` → format `COB-{YYYY}-{LPAD(nextval, 3, '0')}`

The year prefix resets conceptually per calendar year (sequences do not reset automatically in MVP — the format remains unique by sequence value across years).

### Estados y transiciones

**Cotizaciones:**
```
pendiente → aprobada → [permite generar cuenta de cobro]
pendiente → rechazada
aprobada  → rechazada  (si el cliente cambia de opinión)
```

**Cuentas de cobro:**
```
pendiente → pagada (registra fecha_pago = NOW())
pagada → pendiente (reversión manual, borra fecha_pago)
```

**Solicitudes públicas:**
```
nueva → atendida (al crear cotización desde ella)
nueva → descartada (acción manual del admin)
```

### RLS Policies (requerimientos mínimos)

| Tabla | Rol `anon` | Rol `authenticated` |
|-------|-----------|---------------------|
| `cotizaciones_solicitudes` | INSERT only | Full access |
| `clientes` | None | Full access |
| `cotizaciones` | None | Full access |
| `cotizaciones_items` | None | Full access |
| `cuentas_cobro` | None | Full access |
| `cuentas_cobro_items` | None | Full access |
| `adjuntos` | None | Full access |

---

## Out of Scope (MVP)

The following MUST NOT be implemented in this phase:

- IVA, retenciones, or any tax calculations
- Facturación electrónica DIAN (CUFE, firma electrónica)
- Multiple admin users or role-based access control
- Client portal (clients do not log in)
- Online payment gateway integration
- Service calendar or work order scheduling
- Material inventory
- Advanced financial reports (P&L, cash flow)
- Native mobile application
- Internationalization (Spanish Colombia only)
- `config_empresa` editable table (bank details and signature are hardcoded constants in MVP)

---

## Acceptance Criteria Summary

| Module | Must pass |
|--------|-----------|
| Landing | Visually identical to legacy HTML; Lighthouse > 90 |
| Cotización pública | Form persists to DB; anon cannot read records |
| Auth | All `/admin/*` routes redirect unauthenticated users |
| Dashboard | 4 metrics display correctly; zero state handled |
| Clientes | CRUD works; autocomplete is case+accent-insensitive; blocks delete when linked |
| Cotizaciones | Consecutive auto-generated by sequence; 3 states; conversion to cuenta de cobro |
| Cuentas de cobro | Items compute correctly (qty × unit); 2 states with fecha_pago; linked to cotización |
| Solicitudes | Admin can view, discard, and convert to formal quote |
| Adjuntos | Upload to Storage; 10 MB limit enforced; signed URLs generated |
| Export PDF | Both formats match documented layout; generation is server-side |
| Compartir | WhatsApp link opens with text + signed URL; mailto prefilled with client email |
| RLS | Verified in sdd-verify: anon INSERT-only on solicitudes; all else requires authenticated |
