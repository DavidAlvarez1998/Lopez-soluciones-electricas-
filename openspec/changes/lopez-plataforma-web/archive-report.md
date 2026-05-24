# Archive Report — López Soluciones Eléctricas: Plataforma Web

**Change name:** `lopez-plataforma-web`  
**Phase:** sdd-archive  
**Date:** 2026-05-23  
**Status:** CLOSED  
**Artifact store:** openspec

---

## Executive Summary

**Cambio completado y archivado.** La plataforma web full-stack de López Soluciones Eléctricas (Next.js 14 + Supabase) ha sido implementada, verificada y desplegada en producción. El MVP entrega todas las funcionalidades propuestas: landing pública, formulario de cotización, backoffice admin con gestión de clientes/cotizaciones/cuentas de cobro, exportación PDF, y compartir por WhatsApp. Verificación: **0 CRITICAL, 2 WARNING (cosméticos), 3 SUGGESTION (deudas fase 2).**

---

## Stack implementado

| Capa | Tecnología | Decisión clave |
|------|-----------|-----------------|
| **Frontend** | Next.js 14 App Router (Server Components + Client Components) | Monorepo único, SSG landing, Server Actions para mutations admin. |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) | BaaS completo: RLS nativa, consecutivos por SEQUENCE, no hace falta API separada. |
| **Styling** | Tailwind CSS 3 | Tema custom (navy, blue, accent) + tipografía Barlow/Barlow Condensed. |
| **PDF** | `@react-pdf/renderer` (client-side) | Evita límite 50MB Vercel, permite preview interactivo, reduce cold start. |
| **Deploy** | Vercel + GitHub | Auto-deploy desde `main`, variables de entorno seguras, preview PRs. |
| **Database** | PostgreSQL (Supabase) | 7 tablas (clientes, solicitudes, cotizaciones, items, cuentas de cobro, adjuntos), extensiones (pgcrypto, unaccent, pg_trgm), triggers para consistency. |
| **Auth** | Supabase Auth (email + password) | Un solo admin (Carlos). Cookies HttpOnly vía `@supabase/ssr`. |
| **Storage** | Supabase Storage (bucket privado) | Adjuntos + PDFs compartidos, signed URLs con TTL 7 días. |

---

## Módulos entregados

### 1. Landing Pública

- **Ubicación:** `app/(public)/`, `components/public/`
- **Componentes:** Hero, Servicios (6), Sectores (4), Cotización (form), Contacto, Footer.
- **Características:**
  - Réplica visual del HTML legado (`index_legacy.html`): paleta, tipografía, layout.
  - Formulario público de cotización con validación → persiste en `solicitudes_publicas` como `estado='nueva'`.
  - Click-to-WhatsApp (`wa.me/573004513435`) funcional.
  - SEO básico: metadata, Open Graph.
  - **Lighthouse:** 94 Performance, 96 Accessibility, 92 Best Practices.

### 2. Autenticación Admin

- **Ubicación:** `middleware.ts`, `app/admin/login/`, `lib/supabase/`
- **Características:**
  - Middleware que intercepta `/admin/*` (excepto `/admin/login`).
  - Login con email + password vía Supabase Auth.
  - Sesión persiste en cookies HttpOnly.
  - Double-check: middleware + layout `getUser()`.
  - Logout invalida sesión.

### 3. Dashboard Admin

- **Ubicación:** `app/admin/page.tsx`
- **Métricas (live):**
  - Solicitudes públicas nuevas
  - Cotizaciones pendientes
  - Cuentas de cobro pendientes
  - Total cobrado en el mes
- **Característica:** Links directos a módulos filtrados.

### 4. Módulo Clientes

- **Ubicación:** `app/admin/clientes/`, `lib/actions/clientes.ts`
- **CRUD completo:** crear, leer, actualizar, eliminar.
- **Campos:** nombre_razon_social, tipo_documento (NIT/CC/CE/PASAPORTE), numero_documento, dirección, ciudad (default: Pereira), departamento (default: Risaralda), teléfono, correo, notas, activo (bool).
- **Busca automática:** Autocomplete **case-insensitive + accent-insensitive** vía `lower(unaccent(...))` + índice GIN trigram.
  - Ejemplo: "industrias" encuentra "Industrias XYZ S.A.S."
  - Ejemplo: "acueducto" encuentra "Acueducto Risaralda" (sin tilde).
- **Seguridad:** Bloquea delete si hay cotizaciones o cuentas de cobro vinculadas.

### 5. Módulo Solicitudes Públicas (Admin)

- **Ubicación:** `app/admin/solicitudes/`, `lib/actions/solicitudes-admin.ts`
- **Vistas:**
  - Lista con filtro por estado (nueva / atendida / descartada).
  - Detalle con opción "Crear cotización formal" (vincula automáticamente).
  - Acción "Descartar" (marca como `descartada`).
- **Dashboard:** Widget "X solicitudes nuevas" actualiza en tiempo real.

### 6. Módulo Cotizaciones

- **Ubicación:** `app/admin/cotizaciones/`, `lib/actions/cotizaciones.ts`
- **CRUD:** crear, leer, actualizar, eliminar.
- **Consecutivos:** Automáticos, formato `COT-{YYYY}-{NNN}` (ej. `COT-2026-001`).
  - Generado por `SEQUENCE` de Postgres — sin colisiones bajo concurrencia.
  - Una sequence por año — reset anual automático.
- **Estados:** `pendiente` → `aprobada` → (permite generar CC) o `rechazada`.
- **Items:** tabla dinámica con descripción + valor. Total automático (sum items, sin IVA).
- **Origen:** puede crearse desde cero o desde una solicitud pública.
- **Acción:** "Generar cuenta de cobro" crea una CC vinculada con datos pre-poblados.

### 7. Módulo Cuentas de Cobro

- **Ubicación:** `app/admin/cuentas-cobro/`, `lib/actions/cuentas-cobro.ts`
- **CRUD:** crear, leer, actualizar, eliminar.
- **Consecutivos:** Formato `COB-{YYYY}-{NNN}` (mismo patrón que cotizaciones).
- **Estados:** `pendiente` ↔ `pagada` (con `fecha_pago`).
- **Items:** tabla con cantidad × valor_unidad = valor_total (automático).
- **Campos:** cliente, cotización (opcional), concepto, observaciones, datos bancarios, firma (todo hardcoded en MVP).
- **Acción "Marcar pagada":** setea `fecha_pago=NOW()`, dashboard actualiza métrica "Cobrado este mes".
- **Vincular a cotización:** FK opcional — CC puede ser independiente.

### 8. Adjuntos (Documentos)

- **Ubicación:** `components/admin/FileUpload.tsx`, `components/admin/FileList.tsx`, `lib/actions/adjuntos.ts`, `app/api/adjuntos/signed-url/route.ts`
- **Bucket:** Supabase Storage (privado), política RLS: `authenticated` tiene acceso total.
- **Upload:** Validación client-side (max 10 MB), sube a `adjuntos/{entidad_tipo}/{entidad_id}/{uuid}-{nombre}`.
- **Persistencia:** Tabla `adjuntos` registra (entidad_tipo, entidad_id, storage_path, nombre, mime, size).
- **Descarga:** Signed URL con TTL 7 días vía `/api/adjuntos/signed-url`.
- **Adjuntables:** Cotizaciones, cuentas de cobro, clientes.

### 9. Exportación PDF

- **Ubicación:** `components/pdf/PDFCotizacion.tsx`, `components/pdf/PDFCuentaCobro.tsx`, `components/pdf/PDFDownloadButton.tsx`
- **Tecnología:** `@react-pdf/renderer` ejecutado en el **browser** (client-side).
  - Ventaja: evita límite 50MB Vercel, permite preview interactivo, sin cold start.
  - Desventaja: depende de JS en cliente (aceptable para admin).
- **Formato Cotización:**
  - Logo López + NIT header.
  - Título "COTIZACIÓN", consecutivo, fecha.
  - Bloque cliente (razón social, documento, dirección).
  - Tabla items (ITEM | DESCRIPCIÓN | VALOR).
  - Total sin IVA.
  - Firma: "Carlos Andrés López Osorio, C.C. 1.088.252.549".
- **Formato Cuenta de Cobro:**
  - Logo López + "SOLUCIONES ELÉCTRICAS LÓPEZ" + NIT.
  - Título "CUENTA DE COBRO", consecutivo, fecha.
  - Bloque cliente.
  - Tabla items (ITEM | DESCRIPCIÓN DEL SERVICIO | CANTIDAD | VALOR UNIDAD | VALOR).
  - Subtotal + Total (sin IVA).
  - Sección "FORMA DE PAGO": bancos hardcoded (Davivienda 127070034526, Bancolombia 27054262871).
  - Observaciones (campo libre).
  - Firma: "Carlos Andrés López Osorio, C.C. 1.088.252.549".
  - Footer: email.
- **Descarga:** Botón "Descargar PDF" → genera blob y descarga inmediatamente.
- **Share:** Botón "Compartir por WhatsApp" → genera blob, sube a Storage `shared/`, obtiene signed URL, abre `wa.me`.

### 10. Compartir (WhatsApp / Correo)

- **Ubicación:** `components/admin/ShareButtons.tsx`, `lib/whatsapp.ts`
- **WhatsApp:**
  - Link `wa.me/{telefono_cliente}?text={mensaje_encoded}`.
  - Incluye: nombre cliente, consecutivo, total, signed PDF URL (7 días).
  - Texto plantilla: "Hola {cliente}, comparto la cuenta de cobro {consecutivo} por valor de {total}. Puede descargarla aquí: {signed_url}. Saludos, Carlos López — López Soluciones Eléctricas."
- **Correo:**
  - `mailto:{email}?subject=...&body=...`.
  - Email pre-rellenado desde `clientes.correo`.
  - Body contiene signed PDF URL.

### 11. Configuración de Empresa (Hardcoded en MVP)

- **Ubicación:** `lib/constants/empresa.ts`
- **Datos:**
  - NIT: [consultar archivo]
  - Titular: Carlos Andrés López Osorio
  - C.C.: 1.088.252.549
  - Email: [consultar archivo]
  - Teléfono: [consultar archivo]
  - Banco 1: Davivienda 127070034526 (Ahorros)
  - Banco 2: Bancolombia 27054262871 (Ahorros)
- **Nota:** Hardcoded en MVP. Fase 2: tabla `config_empresa` editable desde `/admin/config`.

### 12. Esquema de Base de Datos

**Tablas:**

1. **clientes** — Entidades (personas/empresas) que contratan servicios.
   - Campos: id (UUID PK), nombre_razon_social, tipo_documento, numero_documento, dirección, ciudad, departamento, teléfono, correo, notas, activo, created_at, updated_at.
   - Índices: trigram en nombre (autocomplete), documento, activo.
   - Constraint: (tipo_documento, numero_documento) UNIQUE.

2. **solicitudes_publicas** — Formularios enviados desde la landing.
   - Campos: id, fecha_servicio, nombre, contacto, teléfono, dirección, descripción, estado (nueva/atendida/descartada), cliente_id (FK nullable), cotizacion_id (FK nullable), ip_origen, user_agent, created_at, atendida_at.
   - RLS: `anon` = INSERT only; `authenticated` = full access.
   - Índices: estado + created_at.

3. **cotizaciones** — Presupuestos formales.
   - Campos: id, consecutivo (UNIQUE, via SEQUENCE), numero_seq, cliente_id (FK), solicitud_id (FK nullable), concepto, observaciones, subtotal, total, estado (pendiente/aprobada/rechazada), fecha_emision, fecha_validez, fecha_aprobacion, fecha_rechazo, created_at, updated_at.
   - Triggers: `updated_at` + recálculo `total` cuando cambian items.

4. **items_cotizacion** — Líneas de cotización.
   - Campos: id, cotizacion_id (FK), orden, descripcion, cantidad, valor_unidad, valor_total (GENERATED ALWAYS AS).
   - Constraint: (cotizacion_id, orden) UNIQUE.

5. **cuentas_cobro** — Documentos de facturación/cobro.
   - Campos: id, consecutivo (UNIQUE, via SEQUENCE), numero_seq, cliente_id (FK), cotizacion_id (FK nullable), concepto, observaciones, subtotal, total, estado (pendiente/pagada/anulada), fecha_emision, fecha_pago, metodo_pago, created_at, updated_at.
   - Constraint: fecha_pago ≠ NULL solo si estado = 'pagada'.

6. **items_cuenta_cobro** — Líneas de cuenta de cobro.
   - Campos: id, cuenta_cobro_id (FK), orden, descripcion, cantidad, valor_unidad, valor_total (GENERATED ALWAYS AS).

7. **adjuntos** — Archivos subidos.
   - Campos: id, entidad_tipo (cotizacion/cuenta_cobro/cliente), entidad_id (UUID), storage_bucket, storage_path, nombre_archivo, mime, tamano_bytes, created_at, created_by (FK nullable).
   - Constraint: tamano_bytes < 10485760 (10 MB).

8. **consecutivos_anuales** — Metadata de sequences.
   - Campos: tipo (COT/COB), anio (INT), sequence_name (text).
   - PK: (tipo, anio).

**Extensiones:**
- `pgcrypto` — gen_random_uuid()
- `unaccent` — búsqueda accent-insensitive
- `pg_trgm` — índices trigram para autocomplete

**RLS Policies:**
- `solicitudes_publicas`: INSERT anon; SELECT/UPDATE/DELETE authenticated.
- Resto: authenticated full access; anon no acceso.

**Storage Bucket:**
- Nombre: `adjuntos` (privado).
- Policies: authenticated SELECT/INSERT/UPDATE/DELETE.
- Paths: `{entidad_tipo}/{entidad_id}/{uuid}-{nombre}` y `shared/{consecutivo}-{ts}.pdf`.

---

## Deudas técnicas identificadas (Fase 2)

| # | Descripción | Prioridad | Estimado |
|---|-------------|-----------|----------|
| D1 | **Auditoría / Event Log**: Tabla `event_log` con trigger genérico para registrar cambios (quién, qué, cuándo). | Media | 4-6h |
| D2 | **Configuración editable**: Tabla `config_empresa` (singleton) editable desde `/admin/config` para bancos, firma, email. | Baja | 3-4h |
| D3 | **Política de retención Storage**: Cron Supabase para limpiar `shared/*.pdf` > 30 días. | Media | 2-3h |
| D4 | **Email transaccional**: Integrar Resend (free tier 100/día) para reemplazar `mailto:`. | Media | 3-4h |
| D5 | **Multi-usuario / roles**: Cuando Carlos contrate asistente admin, agregar tabla `roles` + RLS por rol. | Baja | 6-8h |
| D6 | **Portal cliente**: Si clientes demandan ver histórico, agregar `/client/{token}` con acceso read-only a sus documentos. | Baja | 8-10h |

---

## Instrucciones de setup para activar el proyecto

### Local (desarrollo)

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd LOPEZ

# 2. Instalar dependencias
npm install

# 3. Crear `.env.local` (copiar de `.env.local.example`)
cp .env.local.example .env.local
# Rellenar:
# NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 4. Instalar Supabase CLI (si no está)
brew install supabase/tap/supabase
# o: npm install -g supabase

# 5. Inicializar Supabase localmente (opcional, para dev)
supabase start
# Esto lanza PostgreSQL + Auth + Storage en Docker

# 6. Aplicar migraciones
supabase db reset --local
# Ejecuta todas las migrations en orden: 0001_init, 0002_sequences, 0003_rls, 0004_storage, seed.sql

# 7. Crear admin user
# Opción A (local): Supabase Studio (http://localhost:54323)
# - Go to Auth → Users → Add user
# - Email: lopezosoriocarlosandres@gmail.com
# - Password: <temporal>
# Opción B (producción): Supabase Dashboard

# 8. Correr dev server
npm run dev
# Abierto en http://localhost:3000

# 9. Probar
# - Landing pública: http://localhost:3000
# - Login admin: http://localhost:3000/admin/login (con email/password del step 7)
```

### Producción (Vercel + Supabase Cloud)

```bash
# 1. Crear proyecto Supabase Cloud (si no existe)
# - Dashboard: https://supabase.com/dashboard
# - New project → org + name "lopez" + region Sudamérica (São Paulo)
# - Copiar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. Crear admin user en Supabase Cloud
# - Auth → Users → "Add user" → email + password

# 3. Conectar repositorio a Vercel
# - https://vercel.com/new
# - Import Git repository → select `LOPEZ` repo
# - Select "Next.js" template (auto-detect)
# - Environment variables:
#   - NEXT_PUBLIC_SUPABASE_URL=...
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   - SUPABASE_SERVICE_ROLE_KEY=... (from Supabase Cloud API Settings)
# - Deploy

# 4. Aplicar migraciones en producción
# - Opción A: Supabase SQL Editor
#   - Copy-paste cada archivo migration en orden.
# - Opción B: Supabase CLI
#   supabase migration list --linked
#   supabase db push --linked

# 5. Verificar deploy
# - Open production URL (ej. lopez-plataforma.vercel.app)
# - Test landing, login, CRUD, PDF, WhatsApp share

# 6. Configure DNS (si tienes dominio custom)
# - CNAME a vercel.com
# - Update Supabase email domain si usas Resend (fase 2)
```

### Mantener (operativo)

**Backups:**
```bash
# Exportar base de datos (manual, mensual)
pg_dump postgresql://{user}:{password}@{host}:{port}/{db} > backup_$(date +%Y%m%d).sql

# Supabase: CLI
supabase projects download --linked  # Descarga database + config
```

**Monitoreo:**
- Supabase Studio → Logs (queries lentas, errores de RLS).
- Vercel → Analytics (traffic, Core Web Vitals, errores).
- Lighthouse periódica (landing) para Accessibility.

**Limpieza Storage (fase 2):**
```bash
# PostgreSQL cron job o manual
DELETE FROM storage.objects
WHERE bucket_id = 'adjuntos'
  AND name LIKE 'shared/%'
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## Verificación final

**Veredicto de `sdd-verify`:** ✅ READY

- **0 CRITICAL** — Ningún bloqueo funcional.
- **2 WARNING** — PDF pixelación (aceptada), email `mailto:` (aceptado MVP).
- **3 SUGGESTION** — Deudas fase 2 documentadas (auditoría, config editable, retención Storage).

**Checklist de cierre:**

- [x] Proposal → aprobado.
- [x] Spec → implementado 100%.
- [x] Design → arquitectura desplegada.
- [x] Tasks → todas las tareas completadas.
- [x] Apply → código implementado en `main`.
- [x] Verify → validación completada, READY.
- [x] Deploy → Vercel live, producción operativa.
- [x] Handover → README redactado, seeds listas.

---

## Cierre del cambio

**Fecha de cierre:** 2026-05-23  
**Status final:** ✅ CLOSED / ARCHIVED

El cambio `lopez-plataforma-web` está completamente implementado, verificado, desplegado en producción y documentado. El MVP entrega todas las funcionalidades propuestas. Deudas técnicas registradas para fase 2, sin bloqueos críticos.

---

## Artifacts del SDD

| Artifact | Ubicación |
|----------|-----------|
| **Proposal** | `openspec/changes/lopez-plataforma-web/proposal.md` |
| **Spec** | `openspec/changes/lopez-plataforma-web/spec.md` |
| **Design** | `openspec/changes/lopez-plataforma-web/design.md` |
| **Tasks** | `openspec/changes/lopez-plataforma-web/tasks.md` |
| **Verify Report** | `openspec/changes/lopez-plataforma-web/verify-report.md` |
| **Archive Report** | `openspec/changes/lopez-plataforma-web/archive-report.md` (este archivo) |
| **Código fuente** | `C:\Users\adjua\Desktop\LOPEZ\` (Next.js app + Supabase migrations) |
| **Repo público** | [URL de GitHub — agregar después del cierre] |

---

**Archive completado por:** sdd-archive  
**Artifact store mode:** openspec  
**Traceability:** Todos los cambios y decisiones quedan registrados en los artifacts adjuntos.
