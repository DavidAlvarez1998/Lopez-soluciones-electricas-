# López Soluciones Eléctricas — Plataforma Web

Sistema full-stack para gestión de cotizaciones y cuentas de cobro de López Soluciones Eléctricas (Pereira, Risaralda).

## Stack

- **Next.js 14** (App Router)
- **React** + **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth + Storage)
- **@react-pdf/renderer** — generación de PDFs client-side

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Landing pública | Migración del sitio HTML: Hero, Servicios, Sectores, Cotización, Contacto |
| Formulario público | Visitantes solicitan cotización → queda en BD para revisión admin |
| Admin — Auth | Login con Supabase Auth (email/password) |
| Admin — Dashboard | Métricas: solicitudes pendientes, cotizaciones, facturas |
| Admin — Clientes | CRUD + autocomplete por nombre/razón social con autocompletado de NIT, dirección, email, teléfono |
| Admin — Cotizaciones | Crear/editar, ítems, consecutivos automáticos (COT-YYYY-NNN), estados, PDF, compartir |
| Admin — Cuentas de Cobro | Crear/editar, ítems (cantidad × valor unidad), consecutivos (COB-YYYY-NNN), estado pagado/pendiente, fecha de pago, PDF |
| PDFs | Fiel a los formatos reales: Cotización y Cuenta de Cobro con logo, datos bancarios, firma |
| Adjuntos | Upload de cédula, tarjeta profesional u otros documentos via Supabase Storage |
| Compartir | Link WhatsApp, mailto, copy link |

## Estructura del proyecto

```
/app
  /(public)/page.tsx           → landing
  /admin/login/page.tsx
  /admin/layout.tsx            → sidebar protegido
  /admin/page.tsx              → dashboard
  /admin/solicitudes/page.tsx
  /admin/clientes/page.tsx
  /admin/cotizaciones/page.tsx
  /admin/cotizaciones/[id]/page.tsx
  /admin/cuentas-cobro/page.tsx
  /admin/cuentas-cobro/[id]/page.tsx

/components
  /landing/                   → Hero, Nav, Servicios, Sectores, CotizacionPublica, Contacto, Footer
  /admin/                     → Sidebar, InvoiceTable, ClienteAutocomplete, FileUpload, StatusBadge, ShareButtons

/lib
  /supabase/                  → client.ts, server.ts, middleware.ts
  /constants/empresa.ts       → NIT, titular, bancos, firma (hardcoded MVP)
  /pdf/                       → CotizacionPDF.tsx, CuentaCobroPDF.tsx

/supabase
  /migrations/                → DDL completo, RLS policies, funciones PG
```

## Base de datos

```
clientes              → empresas y personas registradas
solicitudes_publicas  → cotizaciones enviadas desde el sitio web
cotizaciones          → COT-YYYY-NNN, estados: borrador/enviada/aprobada/rechazada
cotizacion_items      → ítems de cotización (descripción + valor)
cuentas_cobro         → COB-YYYY-NNN, estados: pendiente/pagada + fecha_pago
cuenta_cobro_items    → ítems de cuenta de cobro (descripción + cantidad + valor_unidad + valor)
adjuntos              → archivos subidos a Supabase Storage
```

## Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Setup local

```bash
npm install
# Configurar .env.local con las credenciales de Supabase
# Correr las migrations en el dashboard de Supabase o con la CLI
npx supabase db push
npm run dev
```

## Artefactos SDD

El proceso de diseño está documentado en `openspec/changes/lopez-plataforma-web/`:

| Archivo | Contenido |
|---------|-----------|
| `proposal.md` | Alcance, módulos, riesgos |
| `spec.md` | Requisitos SHALL, schema, estados, RLS |
| `design.md` | ADRs, DDL completo, estructura de componentes |
| `tasks.md` | 86 tareas en 15 fases de implementación |

---

**NIT:** 1088252549-3 · **Contacto:** Carlos López · **Tel:** 300 451 3435 · Pereira, Risaralda
