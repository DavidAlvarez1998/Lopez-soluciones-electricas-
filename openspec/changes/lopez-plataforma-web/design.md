# Design — López Soluciones Eléctricas: Plataforma Web

**Change name:** `lopez-plataforma-web`
**Phase:** sdd-design
**Date:** 2026-05-23
**Status:** Approved-for-implementation
**Artifact store:** openspec
**Reads:** `proposal.md` (required)

---

## 0. Resumen ejecutivo

Aplicación Next.js 14 (App Router) monolítica desplegada en Vercel, con Supabase como backend (Postgres + Auth + Storage). El proyecto vive en un único repositorio. Server Components para la landing pública (SEO + SSG), Server Actions para mutations admin, Client Components para interactividad rica (autocomplete, tablas editables, PDF preview). PDFs generados **client-side** con `@react-pdf/renderer` para evitar el límite de 50MB de funciones serverless en Vercel. Consecutivos vía `SEQUENCE` de Postgres. RLS bloquea todo lo no-público en `anon` y abre todo en `authenticated` (Carlos es el único admin).

---

## 1. Arquitectura de la aplicación

### 1.1 Estructura de carpetas (Next.js 14 App Router)

```
LOPEZ/
├─ app/
│  ├─ (public)/                          # Group route — landing pública
│  │  ├─ layout.tsx                       # Layout público (sin auth check)
│  │  ├─ page.tsx                         # Landing (Server Component, SSG)
│  │  ├─ cotizar/
│  │  │  └─ page.tsx                      # Form público
│  │  └─ actions/
│  │     └─ crear-solicitud.ts            # Server Action — INSERT en solicitudes_publicas
│  │
│  ├─ admin/
│  │  ├─ layout.tsx                       # Layout admin (sidebar + topbar + auth check)
│  │  ├─ page.tsx                         # Dashboard
│  │  ├─ login/
│  │  │  └─ page.tsx                      # Login form (Client Component)
│  │  ├─ solicitudes/
│  │  │  ├─ page.tsx                      # Lista
│  │  │  └─ [id]/page.tsx                 # Detalle + convertir a cotización
│  │  ├─ clientes/
│  │  │  ├─ page.tsx                      # Lista + búsqueda
│  │  │  ├─ nuevo/page.tsx
│  │  │  └─ [id]/page.tsx                 # Editar
│  │  ├─ cotizaciones/
│  │  │  ├─ page.tsx                      # Lista
│  │  │  ├─ nueva/page.tsx                # Crear (Client Component con form)
│  │  │  └─ [id]/page.tsx                 # Detalle + PDF preview + acciones
│  │  ├─ cuentas-cobro/
│  │  │  ├─ page.tsx
│  │  │  ├─ nueva/page.tsx
│  │  │  └─ [id]/page.tsx
│  │  └─ actions/                         # Server Actions admin
│  │     ├─ clientes.ts                   # create/update/delete/search
│  │     ├─ cotizaciones.ts
│  │     ├─ cuentas-cobro.ts
│  │     └─ adjuntos.ts                   # signed upload URL + commit
│  │
│  ├─ api/
│  │  └─ adjuntos/
│  │     └─ signed-url/route.ts           # GET signed URL (para WhatsApp share)
│  │
│  ├─ layout.tsx                          # Root layout (fonts, metadata global)
│  └─ globals.css                         # Tailwind directives + tokens raíz
│
├─ components/
│  ├─ public/                             # Landing
│  │  ├─ Hero.tsx
│  │  ├─ Servicios.tsx
│  │  ├─ Sectores.tsx
│  │  ├─ FormCotizacion.tsx               # Client Component
│  │  ├─ Contacto.tsx
│  │  └─ Footer.tsx
│  ├─ admin/
│  │  ├─ Sidebar.tsx
│  │  ├─ Topbar.tsx
│  │  ├─ DataTable.tsx                    # tabla genérica (sort, paginación)
│  │  ├─ ClienteAutocomplete.tsx          # Client Component
│  │  ├─ InvoiceTable.tsx                 # ítems editables con cálculo
│  │  ├─ EstadoBadge.tsx
│  │  ├─ FileUpload.tsx                   # Supabase Storage signed upload
│  │  ├─ FileList.tsx
│  │  ├─ ShareButtons.tsx                 # WhatsApp + correo
│  │  └─ ConfirmDialog.tsx
│  ├─ pdf/
│  │  ├─ PDFCotizacion.tsx                # @react-pdf/renderer template
│  │  ├─ PDFCuentaCobro.tsx
│  │  ├─ PDFShared.tsx                    # header logo + footer + estilos
│  │  └─ PDFDownloadButton.tsx            # wrapper PDFDownloadLink
│  └─ ui/
│     ├─ Button.tsx
│     ├─ Input.tsx
│     ├─ Select.tsx
│     ├─ Textarea.tsx
│     └─ Label.tsx
│
├─ lib/
│  ├─ supabase/
│  │  ├─ server.ts                        # createServerClient (Server Components/Actions)
│  │  ├─ client.ts                        # createBrowserClient (Client Components)
│  │  ├─ middleware.ts                    # createMiddlewareClient (sessions)
│  │  └─ admin.ts                         # createAdminClient (service role, server-only)
│  ├─ constants/
│  │  └─ empresa.ts                       # NIT, banco, firma, teléfonos (R8)
│  ├─ formatters/
│  │  ├─ currency.ts                      # COP "$ 1.234.567"
│  │  ├─ date.ts                          # "23 de mayo de 2026"
│  │  └─ consecutivo.ts                   # padding "COT-001"
│  ├─ validators/
│  │  ├─ cliente.ts                       # zod schemas
│  │  ├─ cotizacion.ts
│  │  └─ cuenta-cobro.ts
│  └─ whatsapp.ts                         # build wa.me URL
│
├─ middleware.ts                          # Auth gate /admin/*
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_init.sql                    # extensiones, tablas, índices
│  │  ├─ 0002_sequences.sql               # COT/COB consecutivos
│  │  ├─ 0003_rls.sql                     # policies
│  │  ├─ 0004_storage.sql                 # buckets + policies
│  │  └─ 0005_seed_admin.sql              # nota: usuario se crea via dashboard, no SQL
│  └─ seed.sql                            # datos de prueba opcionales
│
├─ public/
│  ├─ logo.svg                            # logo López para PDF y landing
│  └─ fonts/                              # fallback opcional para react-pdf
│
├─ tailwind.config.ts
├─ next.config.js
├─ tsconfig.json
├─ package.json
└─ .env.local.example
```

### 1.2 Public vs Admin — separación por route groups y middleware

- **Route groups**: `(public)` agrupa la landing sin afectar la URL; `admin` es una segmentación real (`/admin/*`).
- **Middleware (`middleware.ts`)** intercepta `/admin/*` (excepto `/admin/login`). Si no hay sesión Supabase válida → `redirect('/admin/login?next=...')`.
- **Layouts diferentes**: `(public)/layout.tsx` no toca Supabase Auth; `admin/layout.tsx` hace `supabase.auth.getUser()` server-side y bloquea render si no hay user (defensa en profundidad sobre el middleware).
- **`anon` key** se expone al cliente (necesaria para Client Components). **`service_role` key** queda solo en server (`lib/supabase/admin.ts`), nunca importada desde Client Components — el linter ESLint custom rule fuerza esto (ver §1.4).

### 1.3 Server Components vs Client Components — decisiones por sección

| Sección | Tipo | Justificación |
|---------|------|---------------|
| Landing (`/`) | **Server Component** (SSG) | SEO crítico, contenido estático, Lighthouse > 90. |
| `FormCotizacion` (en landing) | **Client Component** | Estado de form, validación inline, feedback de envío. Llama Server Action. |
| `/admin/login` | **Client Component** | Form interactivo + redirect post-login. |
| `/admin` (dashboard) | **Server Component** | Lee métricas de Supabase server-side. Sin estado interactivo. |
| `/admin/clientes` (lista) | **Server Component** + filtro como Client | Lista SSR, el input de búsqueda hidrata como Client. |
| `ClienteAutocomplete` | **Client Component** | Debounce, fetch on-type, dropdown. |
| `/admin/cotizaciones/nueva` | **Client Component** (la página) | Form complejo con tabla de ítems dinámica, cálculo en vivo. |
| `/admin/cotizaciones/[id]` | **Server Component** (shell) + Client (acciones) | Datos SSR; botones PDF/share/edit hidratan. |
| `InvoiceTable` | **Client Component** | Edición inline, agregar/quitar filas, cálculo. |
| `PDFDownloadButton` | **Client Component** | `@react-pdf/renderer` debe correr en browser. |
| `FileUpload` | **Client Component** | XHR a Supabase Storage con signed URL. |

**Regla general**: por defecto Server Component (cero JS al cliente). Solo Client cuando hay `useState`, `useEffect`, `onClick`, browser APIs, o librerías browser-only.

### 1.4 Server Actions vs API Routes

- **Server Actions** (default) para todas las mutations admin: crear/editar/borrar cliente, cotización, cuenta de cobro, cambio de estado, commit de adjunto. Ventajas: type-safe end-to-end, revalidación automática (`revalidatePath`), menos boilerplate, no hace falta endpoint REST.
- **API Routes** solo para:
  - `GET /api/adjuntos/signed-url?path=...` — devolver URL firmada para incluir en `wa.me` (un endpoint reusable es más limpio que Server Action devolviendo URL).
  - Webhooks futuros (no MVP).
- **Sin API Route para PDF**: el PDF se genera en el browser con `@react-pdf/renderer` (ver §4). Esto elimina presión sobre los serverless functions.

### 1.5 Linting custom (defensa en profundidad)

Regla ESLint local: `no-restricted-imports` que prohíbe importar `lib/supabase/admin` desde cualquier archivo bajo `app/(public)/`, `components/public/`, o cualquier `'use client'`. Garantiza que `service_role` nunca llegue al bundle del cliente.

---

## 2. Schema de base de datos (PostgreSQL/Supabase)

### 2.1 Extensiones requeridas

```sql
create extension if not exists "pgcrypto";        -- gen_random_uuid()
create extension if not exists "unaccent";        -- búsqueda accent-insensitive
create extension if not exists "pg_trgm";         -- trigram para autocomplete fuzzy
```

### 2.2 DDL completo

```sql
-- =========================================================================
-- 0001_init.sql — tablas, tipos, índices
-- =========================================================================

-- Enums --------------------------------------------------------------------

create type tipo_documento_cliente as enum ('NIT', 'CC', 'CE', 'PASAPORTE');
create type estado_solicitud_publica as enum ('nueva', 'atendida', 'descartada');
create type estado_cotizacion as enum ('pendiente', 'aprobada', 'rechazada');
create type estado_cuenta_cobro as enum ('pendiente', 'pagada', 'anulada');
create type entidad_adjunto as enum ('cotizacion', 'cuenta_cobro', 'cliente');

-- clientes -----------------------------------------------------------------

create table clientes (
  id              uuid primary key default gen_random_uuid(),
  nombre_razon_social text not null,
  tipo_documento  tipo_documento_cliente not null default 'NIT',
  numero_documento text not null,
  direccion       text,
  ciudad          text default 'Pereira',
  departamento    text default 'Risaralda',
  telefono        text,
  correo          text,
  notas           text,
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint clientes_documento_unq unique (tipo_documento, numero_documento),
  constraint clientes_nombre_chk check (length(trim(nombre_razon_social)) > 0)
);

-- Índice para autocomplete case+accent-insensitive (R7 del proposal).
create index clientes_nombre_trgm_idx
  on clientes using gin (lower(unaccent(nombre_razon_social)) gin_trgm_ops);

create index clientes_documento_idx on clientes (numero_documento);
create index clientes_activo_idx on clientes (activo) where activo = true;

-- solicitudes_publicas -----------------------------------------------------
-- El form público inserta acá. Carlos las atiende desde /admin/solicitudes.

create table solicitudes_publicas (
  id              uuid primary key default gen_random_uuid(),
  fecha_servicio  date,                              -- fecha pedida en el form
  nombre          text not null,
  contacto        text,                              -- email opcional
  telefono        text not null,
  direccion       text,
  descripcion     text not null,                     -- "trabajo a cotizar"
  estado          estado_solicitud_publica not null default 'nueva',
  cliente_id      uuid references clientes(id) on delete set null,
  cotizacion_id   uuid,                              -- FK definida más abajo
  ip_origen       inet,
  user_agent      text,
  created_at      timestamptz not null default now(),
  atendida_at     timestamptz,
  constraint solicitudes_nombre_chk check (length(trim(nombre)) > 0),
  constraint solicitudes_descripcion_chk check (length(trim(descripcion)) > 0)
);

create index solicitudes_estado_idx on solicitudes_publicas (estado, created_at desc);

-- cotizaciones -------------------------------------------------------------

create table cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  consecutivo     text not null unique,              -- 'COT-2026-001'
  numero_seq      bigint not null,                   -- valor crudo del sequence (para sort)
  cliente_id      uuid not null references clientes(id) on delete restrict,
  solicitud_id    uuid references solicitudes_publicas(id) on delete set null,
  concepto        text not null,
  observaciones   text,
  subtotal        numeric(14,2) not null default 0,  -- recalculado por trigger
  total           numeric(14,2) not null default 0,  -- = subtotal (sin IVA en MVP)
  estado          estado_cotizacion not null default 'pendiente',
  fecha_emision   date not null default current_date,
  fecha_validez   date,                              -- "válida hasta"
  fecha_aprobacion date,
  fecha_rechazo   date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint cotizaciones_total_nonneg check (total >= 0)
);

create index cotizaciones_cliente_idx on cotizaciones (cliente_id, created_at desc);
create index cotizaciones_estado_idx on cotizaciones (estado, created_at desc);
create index cotizaciones_consecutivo_idx on cotizaciones (numero_seq desc);

-- FK diferida de solicitudes → cotizaciones
alter table solicitudes_publicas
  add constraint solicitudes_cotizacion_fk
  foreign key (cotizacion_id) references cotizaciones(id) on delete set null;

-- items_cotizacion ---------------------------------------------------------

create table items_cotizacion (
  id              uuid primary key default gen_random_uuid(),
  cotizacion_id   uuid not null references cotizaciones(id) on delete cascade,
  orden           smallint not null,                 -- 1,2,3... para preservar UI
  descripcion     text not null,
  cantidad        numeric(12,2) not null default 1,
  valor_unidad    numeric(14,2) not null default 0,
  valor_total     numeric(14,2) not null
                  generated always as (round(cantidad * valor_unidad, 2)) stored,
  constraint items_cot_cantidad_chk check (cantidad > 0),
  constraint items_cot_valor_chk check (valor_unidad >= 0),
  constraint items_cot_descripcion_chk check (length(trim(descripcion)) > 0),
  unique (cotizacion_id, orden)
);

create index items_cot_cotizacion_idx on items_cotizacion (cotizacion_id, orden);

-- cuentas_cobro ------------------------------------------------------------

create table cuentas_cobro (
  id              uuid primary key default gen_random_uuid(),
  consecutivo     text not null unique,              -- 'COB-2026-001'
  numero_seq      bigint not null,
  cliente_id      uuid not null references clientes(id) on delete restrict,
  cotizacion_id   uuid references cotizaciones(id) on delete set null,
  concepto        text not null,
  observaciones   text,
  subtotal        numeric(14,2) not null default 0,
  total           numeric(14,2) not null default 0,
  estado          estado_cuenta_cobro not null default 'pendiente',
  fecha_emision   date not null default current_date,
  fecha_pago      date,
  metodo_pago     text,                              -- "Davivienda", "Bancolombia", "Efectivo"
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint cc_total_nonneg check (total >= 0),
  constraint cc_pago_consistente check (
    (estado = 'pagada' and fecha_pago is not null) or
    (estado <> 'pagada' and fecha_pago is null)
  )
);

create index cc_cliente_idx on cuentas_cobro (cliente_id, created_at desc);
create index cc_estado_idx on cuentas_cobro (estado, created_at desc);
create index cc_consecutivo_idx on cuentas_cobro (numero_seq desc);

-- items_cuenta_cobro -------------------------------------------------------

create table items_cuenta_cobro (
  id              uuid primary key default gen_random_uuid(),
  cuenta_cobro_id uuid not null references cuentas_cobro(id) on delete cascade,
  orden           smallint not null,
  descripcion     text not null,
  cantidad        numeric(12,2) not null default 1,
  valor_unidad    numeric(14,2) not null default 0,
  valor_total     numeric(14,2) not null
                  generated always as (round(cantidad * valor_unidad, 2)) stored,
  constraint items_cc_cantidad_chk check (cantidad > 0),
  constraint items_cc_valor_chk check (valor_unidad >= 0),
  constraint items_cc_descripcion_chk check (length(trim(descripcion)) > 0),
  unique (cuenta_cobro_id, orden)
);

create index items_cc_cuenta_idx on items_cuenta_cobro (cuenta_cobro_id, orden);

-- adjuntos -----------------------------------------------------------------

create table adjuntos (
  id              uuid primary key default gen_random_uuid(),
  entidad_tipo    entidad_adjunto not null,
  entidad_id      uuid not null,
  storage_bucket  text not null default 'adjuntos',
  storage_path    text not null,                     -- 'cotizacion/{uuid}/cedula.pdf'
  nombre_archivo  text not null,
  mime            text not null,
  tamano_bytes    bigint not null,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  constraint adjuntos_tamano_chk check (tamano_bytes > 0 and tamano_bytes < 10485760)  -- 10MB
);

create index adjuntos_entidad_idx on adjuntos (entidad_tipo, entidad_id);

-- =========================================================================
-- Triggers — updated_at + recálculo de totales
-- =========================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_clientes_updated before update on clientes
  for each row execute function set_updated_at();
create trigger trg_cotizaciones_updated before update on cotizaciones
  for each row execute function set_updated_at();
create trigger trg_cc_updated before update on cuentas_cobro
  for each row execute function set_updated_at();

-- Recalcular totales en cotización cuando cambian items
create or replace function recalc_cotizacion_total()
returns trigger language plpgsql as $$
declare
  v_id uuid;
  v_sub numeric(14,2);
begin
  v_id := coalesce(new.cotizacion_id, old.cotizacion_id);
  select coalesce(sum(valor_total), 0) into v_sub
    from items_cotizacion where cotizacion_id = v_id;
  update cotizaciones
    set subtotal = v_sub, total = v_sub, updated_at = now()
    where id = v_id;
  return null;
end $$;

create trigger trg_items_cot_recalc
  after insert or update or delete on items_cotizacion
  for each row execute function recalc_cotizacion_total();

-- Recalcular totales en cuenta de cobro
create or replace function recalc_cuenta_cobro_total()
returns trigger language plpgsql as $$
declare
  v_id uuid;
  v_sub numeric(14,2);
begin
  v_id := coalesce(new.cuenta_cobro_id, old.cuenta_cobro_id);
  select coalesce(sum(valor_total), 0) into v_sub
    from items_cuenta_cobro where cuenta_cobro_id = v_id;
  update cuentas_cobro
    set subtotal = v_sub, total = v_sub, updated_at = now()
    where id = v_id;
  return null;
end $$;

create trigger trg_items_cc_recalc
  after insert or update or delete on items_cuenta_cobro
  for each row execute function recalc_cuenta_cobro_total();
```

### 2.3 Consecutivos — `SEQUENCE` por año (R5)

```sql
-- =========================================================================
-- 0002_sequences.sql — consecutivos atómicos sin colisiones
-- =========================================================================
-- Estrategia: una sequence por (tipo, año). Se crean on-demand.
-- Formato: COT-{YYYY}-{NNN}  |  COB-{YYYY}-{NNN}

create table consecutivos_anuales (
  tipo            text not null,                     -- 'COT' | 'COB'
  anio            int not null,
  sequence_name   text not null,
  primary key (tipo, anio)
);

create or replace function next_consecutivo(p_tipo text)
returns table(consecutivo text, numero_seq bigint)
language plpgsql as $$
declare
  v_anio  int := extract(year from current_date)::int;
  v_seq_name text;
  v_next bigint;
begin
  if p_tipo not in ('COT', 'COB') then
    raise exception 'Tipo de consecutivo inválido: %', p_tipo;
  end if;

  select sequence_name into v_seq_name
    from consecutivos_anuales where tipo = p_tipo and anio = v_anio;

  if v_seq_name is null then
    v_seq_name := format('seq_%s_%s', lower(p_tipo), v_anio);
    execute format('create sequence if not exists %I start 1 increment 1', v_seq_name);
    insert into consecutivos_anuales(tipo, anio, sequence_name)
      values (p_tipo, v_anio, v_seq_name)
      on conflict (tipo, anio) do nothing;
  end if;

  execute format('select nextval(%L)', v_seq_name) into v_next;

  consecutivo := format('%s-%s-%s', p_tipo, v_anio, lpad(v_next::text, 3, '0'));
  numero_seq := v_next;
  return next;
end $$;
```

**Uso desde Server Action**: en la misma transacción donde se `INSERT` en `cotizaciones`:

```sql
with c as (select * from next_consecutivo('COT'))
insert into cotizaciones (consecutivo, numero_seq, cliente_id, concepto, ...)
select c.consecutivo, c.numero_seq, $1, $2, ... from c
returning *;
```

`nextval()` es atómico bajo concurrencia — dos `INSERT` simultáneos obtienen valores distintos sin lock contention.

### 2.4 Row Level Security

```sql
-- =========================================================================
-- 0003_rls.sql — políticas
-- =========================================================================
-- Modelo: anon SOLO puede INSERT en solicitudes_publicas.
--         authenticated tiene acceso total (Carlos es único admin en MVP).

alter table clientes               enable row level security;
alter table solicitudes_publicas   enable row level security;
alter table cotizaciones           enable row level security;
alter table items_cotizacion       enable row level security;
alter table cuentas_cobro          enable row level security;
alter table items_cuenta_cobro     enable row level security;
alter table adjuntos               enable row level security;
alter table consecutivos_anuales   enable row level security;

-- Solicitudes públicas: INSERT abierto al anon, todo lo demás solo authenticated
create policy "anon puede crear solicitudes"
  on solicitudes_publicas for insert to anon
  with check (true);

create policy "auth lee todas las solicitudes"
  on solicitudes_publicas for select to authenticated
  using (true);

create policy "auth actualiza solicitudes"
  on solicitudes_publicas for update to authenticated
  using (true) with check (true);

create policy "auth borra solicitudes"
  on solicitudes_publicas for delete to authenticated
  using (true);

-- Resto de tablas: solo authenticated, acceso total
create policy "auth todo clientes" on clientes
  for all to authenticated using (true) with check (true);

create policy "auth todo cotizaciones" on cotizaciones
  for all to authenticated using (true) with check (true);

create policy "auth todo items_cot" on items_cotizacion
  for all to authenticated using (true) with check (true);

create policy "auth todo cc" on cuentas_cobro
  for all to authenticated using (true) with check (true);

create policy "auth todo items_cc" on items_cuenta_cobro
  for all to authenticated using (true) with check (true);

create policy "auth todo adjuntos" on adjuntos
  for all to authenticated using (true) with check (true);

create policy "auth todo consecutivos" on consecutivos_anuales
  for all to authenticated using (true) with check (true);

-- Función next_consecutivo: ejecutable por authenticated
revoke all on function next_consecutivo(text) from public;
grant execute on function next_consecutivo(text) to authenticated;

-- IMPORTANTE: anon NO tiene grant para next_consecutivo — la solicitud pública
-- NO crea cotización formal, solo solicitudes_publicas (que no tiene consecutivo).
```

### 2.5 Storage — buckets y policies

```sql
-- =========================================================================
-- 0004_storage.sql — bucket único 'adjuntos', acceso privado
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', false)
on conflict (id) do nothing;

-- Solo authenticated puede subir y leer
create policy "auth lee adjuntos"
  on storage.objects for select to authenticated
  using (bucket_id = 'adjuntos');

create policy "auth sube adjuntos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'adjuntos');

create policy "auth actualiza adjuntos"
  on storage.objects for update to authenticated
  using (bucket_id = 'adjuntos');

create policy "auth borra adjuntos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'adjuntos');
```

**Sharing por WhatsApp**: para compartir un adjunto se genera **signed URL** (TTL 7 días) vía `supabase.storage.from('adjuntos').createSignedUrl(path, 604800)`. Esa URL pública con token se incluye en el texto de `wa.me`.

### 2.6 Seed de admin

El usuario admin **no se crea por SQL** (el hashing y la sincronización con `auth.users` lo hace Supabase). Pasos manuales documentados en README:

1. Dashboard Supabase → Authentication → Users → "Add user" → email `lopezosoriocarlosandres@gmail.com` + password temporal.
2. Carlos cambia password en primer login (UI `/admin/cambiar-password` — fase 2 si hace falta, MVP usa password set manual).

---

## 3. Diseño de componentes principales

### 3.1 Layout admin (Sidebar + Topbar)

```
┌─────────────────────────────────────────────────────────┐
│ Topbar  [Logo López]              [Carlos ▾] [Salir]    │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  {children}                                  │
│  • Home  │                                              │
│  • Soli- │                                              │
│    citu- │                                              │
│    des   │                                              │
│  • Clie- │                                              │
│    ntes  │                                              │
│  • Coti- │                                              │
│    zacio-│                                              │
│    nes   │                                              │
│  • Cuen- │                                              │
│    tas   │                                              │
│    de co-│                                              │
│    bro   │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- **Sidebar fija** en desktop (`>=lg`), drawer en móvil (Carlos en campo).
- **Topbar** muestra avatar/email y logout. Logout = `supabase.auth.signOut()` + redirect a `/admin/login`.
- Layout es Server Component que hace `getUser()`. Sidebar es Client (estado open/closed en móvil).

### 3.2 `ClienteAutocomplete` — debounce + búsqueda accent-insensitive

```tsx
// components/admin/ClienteAutocomplete.tsx
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

type Cliente = { id: string; nombre_razon_social: string; numero_documento: string };

export function ClienteAutocomplete({
  onSelect,
  initial,
}: {
  onSelect: (c: Cliente) => void;
  initial?: Cliente;
}) {
  const [query, setQuery] = useState(initial?.nombre_razon_social ?? '');
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      // RPC para usar lower(unaccent(...)) — evita duplicar lógica en cliente
      const { data } = await supabase.rpc('buscar_clientes', { q: query, lim: 10 });
      setResults(data ?? []);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <input
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cliente por nombre o NIT..."
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 bg-white shadow-lg w-full mt-1">
          {results.map((c) => (
            <li
              key={c.id}
              className="p-2 hover:bg-blue/10 cursor-pointer"
              onClick={() => { onSelect(c); setQuery(c.nombre_razon_social); setOpen(false); }}
            >
              <div className="font-medium">{c.nombre_razon_social}</div>
              <div className="text-sm text-gray">{c.numero_documento}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

RPC asociada:

```sql
create or replace function buscar_clientes(q text, lim int default 10)
returns setof clientes
language sql stable as $$
  select * from clientes
  where activo
    and lower(unaccent(nombre_razon_social)) like '%' || lower(unaccent(q)) || '%'
     or numero_documento like q || '%'
  order by similarity(lower(unaccent(nombre_razon_social)), lower(unaccent(q))) desc
  limit lim;
$$;
grant execute on function buscar_clientes(text, int) to authenticated;
```

### 3.3 `InvoiceTable` — tabla editable con cálculo en vivo

Estado controlado (no usa form-state nativo de Next). Cada fila tiene `{ orden, descripcion, cantidad, valor_unidad }`; el `valor_total` se calcula en el cliente y se confirma en la DB con la columna `generated always as`.

```tsx
type Item = { orden: number; descripcion: string; cantidad: number; valor_unidad: number };

export function InvoiceTable({
  items,
  onChange,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const total = items.reduce((acc, i) => acc + i.cantidad * i.valor_unidad, 0);

  const update = (idx: number, patch: Partial<Item>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => onChange([...items, { orden: items.length + 1, descripcion: '', cantidad: 1, valor_unidad: 0 }]);
  const remove = (idx: number) =>
    onChange(items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, orden: i + 1 })));

  return (
    <table className="w-full">
      <thead className="bg-navy text-white">
        <tr>
          <th>ITEM</th><th>DESCRIPCIÓN</th><th>CANTIDAD</th>
          <th>VALOR UNIDAD</th><th>VALOR</th><th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, idx) => (
          <tr key={idx}>
            <td>{it.orden}</td>
            <td><input value={it.descripcion} onChange={(e) => update(idx, { descripcion: e.target.value })} /></td>
            <td><input type="number" min="0" step="0.01" value={it.cantidad} onChange={(e) => update(idx, { cantidad: +e.target.value })} /></td>
            <td><input type="number" min="0" step="1" value={it.valor_unidad} onChange={(e) => update(idx, { valor_unidad: +e.target.value })} /></td>
            <td>{formatCOP(it.cantidad * it.valor_unidad)}</td>
            <td><button type="button" onClick={() => remove(idx)}>×</button></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><td colSpan={4} className="text-right">TOTAL</td><td>{formatCOP(total)}</td></tr>
      </tfoot>
    </table>
  );
}
```

### 3.4 `PDFTemplate` — estructura del PDF (cotización y cuenta de cobro)

Usando `@react-pdf/renderer`. Un componente compartido para header/footer y dos templates específicos.

```tsx
// components/pdf/PDFCuentaCobro.tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { EMPRESA } from '@/lib/constants/empresa';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#030f23' },
  header: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#1354a8', paddingBottom: 8 },
  logo: { width: 80, height: 80 },
  empresaInfo: { marginLeft: 12, flex: 1 },
  titulo: { fontSize: 18, color: '#1354a8', fontWeight: 'bold' },
  consecutivo: { fontSize: 14, color: '#f04e2b' },
  bloqueCliente: { marginTop: 12, padding: 8, backgroundColor: '#f5f8ff' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#030f23', color: '#fff', padding: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#8fa3c0', padding: 4 },
  colItem: { width: '8%' },
  colDesc: { width: '47%' },
  colCant: { width: '12%', textAlign: 'right' },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  total: { marginTop: 8, alignSelf: 'flex-end', fontSize: 12, fontWeight: 'bold' },
  bancos: { marginTop: 16, fontSize: 9 },
  firma: { marginTop: 40, alignItems: 'center' },
});

export function PDFCuentaCobro({ cc, cliente, items }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.empresaInfo}>
            <Text style={styles.titulo}>LÓPEZ SOLUCIONES ELÉCTRICAS</Text>
            <Text>NIT: {EMPRESA.nit}</Text>
            <Text>Tel: {EMPRESA.telefono} — {EMPRESA.email}</Text>
          </View>
          <View>
            <Text style={styles.consecutivo}>CUENTA DE COBRO</Text>
            <Text>{cc.consecutivo}</Text>
            <Text>Fecha: {formatDate(cc.fecha_emision)}</Text>
          </View>
        </View>

        <View style={styles.bloqueCliente}>
          <Text>CLIENTE: {cliente.nombre_razon_social}</Text>
          <Text>{cliente.tipo_documento}: {cliente.numero_documento}</Text>
          <Text>Dirección: {cliente.direccion ?? '-'}</Text>
          <Text>Teléfono: {cliente.telefono ?? '-'}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>ITEM</Text>
            <Text style={styles.colDesc}>DESCRIPCIÓN</Text>
            <Text style={styles.colCant}>CANT.</Text>
            <Text style={styles.colUnit}>VALOR UNIDAD</Text>
            <Text style={styles.colTotal}>VALOR</Text>
          </View>
          {items.map((it) => (
            <View key={it.id} style={styles.tableRow}>
              <Text style={styles.colItem}>{it.orden}</Text>
              <Text style={styles.colDesc}>{it.descripcion}</Text>
              <Text style={styles.colCant}>{it.cantidad}</Text>
              <Text style={styles.colUnit}>{formatCOP(it.valor_unidad)}</Text>
              <Text style={styles.colTotal}>{formatCOP(it.valor_total)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>TOTAL: {formatCOP(cc.total)}</Text>

        <View style={styles.bancos}>
          <Text>Forma de pago:</Text>
          <Text>• Davivienda Ahorros: {EMPRESA.banco.davivienda}</Text>
          <Text>• Bancolombia Ahorros: {EMPRESA.banco.bancolombia}</Text>
          <Text>A nombre de: {EMPRESA.representante}</Text>
        </View>

        {cc.observaciones && (
          <View style={{ marginTop: 12 }}>
            <Text>Observaciones: {cc.observaciones}</Text>
          </View>
        )}

        <View style={styles.firma}>
          <Text>_____________________________</Text>
          <Text>{EMPRESA.representante}</Text>
          <Text>C.C. {EMPRESA.cc}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

`PDFCotizacion.tsx` reusa el header y la tabla pero sin sección bancaria y con texto "COTIZACIÓN" + "Válida hasta {fecha_validez}".

### 3.5 `FileUpload` — subida a Supabase Storage

```tsx
'use client';
import { createBrowserClient } from '@/lib/supabase/client';

export function FileUpload({ entidadTipo, entidadId, onUploaded }) {
  const supabase = createBrowserClient();

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) throw new Error('Máximo 10 MB');
    const path = `${entidadTipo}/${entidadId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from('adjuntos').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    // Commit en tabla adjuntos via Server Action
    await commitAdjunto({ entidadTipo, entidadId, path, nombre: file.name, mime: file.type, size: file.size });
    onUploaded();
  };

  return <input type="file" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />;
}
```

---

## 4. Generación de PDFs

### 4.1 Decisión: `@react-pdf/renderer` en el browser

**Por qué client-side y no server-side**:

| Criterio | Server (`renderToBuffer`) | Client (`PDFDownloadLink`) | Elegido |
|----------|--------------------------|----------------------------|---------|
| Tamaño bundle Vercel function | +1-2 MB (Page Functions OK, pero compite con otros) | 0 (corre en browser) | Client |
| Fuentes custom | Hay que registrar y resolver paths en serverless | `Font.register` con URL pública | Client |
| Preview interactivo en `/admin/.../[id]` | Requiere request adicional | `<PDFViewer>` inline | Client |
| Compartir por WhatsApp | URL pública directa | Hay que subir el blob a Storage primero | Server (pero ver §4.3) |
| Cold start | +200ms | 0 | Client |

**Conclusión**: client-side por defecto para download y preview. Para WhatsApp share se sube el blob generado en cliente a Supabase Storage y se genera signed URL.

### 4.2 Patrón de uso

```tsx
// components/pdf/PDFDownloadButton.tsx
'use client';
import dynamic from 'next/dynamic';

// PDFDownloadLink solo browser — dynamic import sin SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
);

export function DownloadCuentaCobro({ cc, cliente, items }) {
  return (
    <PDFDownloadLink
      document={<PDFCuentaCobro cc={cc} cliente={cliente} items={items} />}
      fileName={`${cc.consecutivo}.pdf`}
    >
      {({ loading }) => (loading ? 'Generando...' : 'Descargar PDF')}
    </PDFDownloadLink>
  );
}
```

### 4.3 Share por WhatsApp — flujo completo

1. Usuario click "Compartir por WhatsApp".
2. Componente Client genera el PDF en memoria con `pdf(<PDFCuentaCobro />).toBlob()`.
3. Sube el blob a Storage: `supabase.storage.from('adjuntos').upload('shared/{consecutivo}-{ts}.pdf', blob)`.
4. Pide signed URL: `createSignedUrl(path, 7 * 24 * 3600)`.
5. Abre `https://wa.me/{telefonoCliente}?text={textoConURL}`.

Texto plantilla (en español, profesional):
```
Hola {nombreCliente}, comparto la cuenta de cobro {consecutivo}
por valor de {total}. Puede descargarla aquí: {signedUrl}
Saludos, Carlos López — López Soluciones Eléctricas.
```

**Política de retención**: PDFs en `shared/` se borran a los 30 días (cron Supabase fase 2 o tarea manual en MVP). Si Carlos necesita reenviar, se regenera el PDF (los datos viven en la DB).

### 4.4 Fuentes en `@react-pdf/renderer`

```tsx
// components/pdf/fonts.ts (importado una vez en PDFCotizacion/PDFCuentaCobro)
import { Font } from '@react-pdf/renderer';
Font.register({
  family: 'Barlow',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_DMs5.ttf' },
    { src: 'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E3w-os0g.ttf', fontWeight: 700 },
  ],
});
```

Si la conexión falla, fallback a Helvetica (default) — no rompe el render.

---

## 5. Auth flow

### 5.1 Supabase Auth con email/password

- **Provider único**: email + password. Sin OAuth en MVP (Carlos no tiene cuenta Google/MS preferida).
- **Sesión**: cookies HttpOnly gestionadas por `@supabase/ssr` (paquete oficial Next.js).
- **`signInWithPassword`** desde `/admin/login` (Client Component) → redirect a `next` o `/admin`.

### 5.2 Middleware Next.js

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => res.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o) => res.cookies.set({ name: n, value: '', ...o }),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = req.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
```

### 5.3 Seed admin

Documentado en README. Pasos:
1. `supabase db reset` aplica todas las migraciones.
2. En el Dashboard de Supabase → Authentication → Users → "Add user".
3. Email `lopezosoriocarlosandres@gmail.com`, password temporal de 16 chars.
4. Compartir password con Carlos por canal seguro; pedirle que lo cambie (UI "Cambiar password" fase 2; MVP edita en Dashboard).

---

## 6. Consecutivos automáticos

Resuelto en §2.3. Resumen del contrato:

- **Una sequence por (tipo, año)**. Crece monotónicamente dentro del año, reinicia con `tipo + año` nuevo.
- **`next_consecutivo('COT')`** retorna `(consecutivo text, numero_seq bigint)` — siempre dentro de transacción del `INSERT`.
- **Sin race conditions**: `nextval()` es atómico a nivel de Postgres, no bloquea otros writers, no requiere `SELECT FOR UPDATE`.
- **Sin huecos garantizados**: si una transacción hace `rollback` después de `nextval()`, el número se "pierde" (comportamiento estándar de sequences). Aceptable — no es un campo legal/regulado.
- **Reset anual**: el primer `INSERT` del 1-enero crea automáticamente `seq_cot_{año}` y arranca en 1.

Función `buscar_clientes` y `next_consecutivo` se ejecutan con `security invoker` (default) — respetan RLS del caller.

---

## 7. Tailwind config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { Barlow, Barlow_Condensed } from 'next/font/google';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#030f23',
        'navy-2': '#071a3e',
        blue: '#1354a8',
        'blue-bright': '#1e6fd4',
        'blue-glow': '#3b8cff',
        accent: '#f04e2b',
        white: '#f5f8ff',
        gray: '#8fa3c0',
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow-condensed)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(59, 140, 255, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

```tsx
// app/layout.tsx — fuentes con next/font
import { Barlow, Barlow_Condensed } from 'next/font/google';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="font-sans bg-navy text-white">{children}</body>
    </html>
  );
}
```

Tipografía: `font-display` (Barlow Condensed) para titulares hero/section; `font-sans` (Barlow) para body. Self-hosted automático vía `next/font` — sin layout shift.

---

## 8. ADRs — decisiones de arquitectura y tradeoffs

### ADR-001: Monorepo Next.js único (no separar API)

- **Contexto**: Tres opciones — (a) Next.js full-stack, (b) Next.js front + API Node/Express separada, (c) Next.js front + Supabase Edge Functions.
- **Decisión**: (a) Monorepo Next.js. Server Actions + Route Handlers cubren el backend; Supabase actúa como BaaS.
- **Por qué**: un solo deploy, type-safety end-to-end, cero coordinación entre repos. Carlos no necesita escalabilidad de API independiente.
- **Rechazado**:
  - (b) Doble deploy, doble auth handling, redundancia para un MVP de un usuario admin.
  - (c) Edge Functions de Supabase suman vendor lock-in y la lógica de PDF/Server Actions vive mejor en Next.js.

### ADR-002: `@react-pdf/renderer` client-side (no puppeteer ni server PDF)

- **Contexto**: 3 alternativas — `puppeteer/playwright`, `@react-pdf/renderer` server, `@react-pdf/renderer` client.
- **Decisión**: `@react-pdf/renderer` ejecutado en browser vía `PDFDownloadLink`/`pdf().toBlob()`.
- **Por qué**: evita el límite 50MB de Vercel Functions (R1), elimina cold start del PDF, permite preview interactivo, no consume horas de cómputo serverless.
- **Tradeoff**: depende de JS en cliente — pero el admin ya es full client-side, no impacta. Para WhatsApp share hace falta upload extra del blob a Storage; aceptable porque ya hay que generar signed URL.
- **Rechazado**:
  - `puppeteer` → R1 bloqueante.
  - `pdfkit/pdf-lib` → código imperativo verbose para layouts complejos.

### ADR-003: Server Actions como default, API Routes solo cuando se necesita endpoint reusable

- **Contexto**: Next.js 14 ofrece Server Actions (con form-actions y RPC-like) y Route Handlers.
- **Decisión**: Server Actions para todas las mutations admin. API Routes solo para `signed-url` (lectura reusable desde múltiples lugares).
- **Por qué**: menos boilerplate, type-safety con TypeScript directo, revalidación automática (`revalidatePath`), no expone surface REST que no necesitamos.
- **Tradeoff**: Server Actions tienen overhead en debugging (no son requests HTTP "limpias"). Mitigado: log estructurado en cada Server Action.

### ADR-004: Consecutivos por SEQUENCE por (tipo, año), no `MAX+1`

- **Contexto**: R5 — riesgo de colisión en consecutivos concurrentes.
- **Decisión**: una `SEQUENCE` por (tipo, año), creada on-demand vía función `next_consecutivo`.
- **Por qué**: `nextval()` es atómico sin lock; reinicio anual natural; no requiere `SELECT FOR UPDATE` ni serializable isolation.
- **Tradeoff**: pueden quedar "huecos" si una transacción aborta. Aceptable — cuentas de cobro no son facturas DIAN.
- **Rechazado**:
  - `MAX(numero_seq) + 1` → race condition garantizada en concurrencia.
  - Lock pesimista sobre tabla → escala mal.
  - UUID como consecutivo → no es legible humano, Carlos los nombra por número en WhatsApp.

### ADR-005: RLS binaria (anon=insert solicitudes / authenticated=todo)

- **Contexto**: R6 — fuga de datos del admin al público.
- **Decisión**: una policy permisiva por tabla para `authenticated` (acceso total) y una sola excepción `INSERT` a `solicitudes_publicas` para `anon`.
- **Por qué**: hay un solo admin (Carlos). Modelar roles finos es over-engineering. RLS binaria es auditable a simple vista.
- **Tradeoff**: cuando se agreguen más usuarios (técnicos, asistente), hay que migrar a policies con `auth.uid()` por tabla. Trabajo de fase 2, no MVP.

### ADR-006: PDFs no se persisten en DB — se regeneran on-demand

- **Contexto**: hay dos modelos — (a) generar PDF cada vez, (b) generar y guardar versión "oficial".
- **Decisión**: (a) regenerar siempre. Solo se sube a Storage cuando se comparte por WhatsApp (para tener URL pública).
- **Por qué**: la fuente de verdad son los datos de la DB. Editar una cotización después de descargar implica nuevo PDF; no hay versionado de "facturas firmadas" como en DIAN.
- **Tradeoff**: si Carlos edita una cotización después de enviarla al cliente, el cliente recibe un PDF distinto al original. Mitigación: convención UI de que cotizaciones `aprobada` y cuentas de cobro `pagada` son read-only (validación en Server Action). Fase 2: agregar `versiones_documento` con snapshot JSONB si la operación lo demanda.

### ADR-007: Datos bancarios y firma hardcoded en `lib/constants/empresa.ts`

- **Contexto**: R8 — cambio de banco implica redeploy.
- **Decisión**: hardcoded en MVP, con plan documentado de tabla `config_empresa` (singleton) editable desde `/admin/configuracion` en fase 2.
- **Por qué**: ahorra un módulo CRUD + UI completos para datos que cambian quizás 1 vez por año.
- **Tradeoff**: cualquier cambio requiere PR + deploy. Aceptable dado el ritmo de cambio histórico.

### ADR-008: Triggers Postgres para totales (no cálculo en app)

- **Contexto**: el `subtotal` y `total` de cotización/cuenta de cobro depende de la sum de items.
- **Decisión**: trigger `AFTER INSERT/UPDATE/DELETE on items_*` que recalcula y actualiza el header.
- **Por qué**: garantiza consistencia incluso si hay updates fuera del flujo "oficial" (ej. SQL manual de soporte). La columna `valor_total` por item ya es `GENERATED ALWAYS AS` — extiende la misma filosofía.
- **Tradeoff**: lógica "fantasma" en la DB que el equipo debe conocer. Mitigado: comentarios SQL claros y test E2E que verifica que tras un INSERT/UPDATE de ítem, el total del header refleja la suma.

### ADR-009: `unaccent + pg_trgm` para autocomplete (no Algolia/Meilisearch)

- **Contexto**: R7 — búsqueda accent/case-insensitive sobre clientes.
- **Decisión**: usar extensiones nativas de Postgres + índice GIN trigram.
- **Por qué**: cero infra extra; el volumen de clientes es pequeño (cientos, no millones); rendimiento sobra.
- **Rechazado**: motores de búsqueda externos suman costo y complejidad innecesaria a esta escala.

### ADR-010: Adjuntos en bucket único privado, signed URLs para share

- **Contexto**: 10 MB max por archivo, múltiples entidades pueden tener adjuntos.
- **Decisión**: bucket `adjuntos` privado, organización por path `{entidad_tipo}/{entidad_id}/{uuid}-{nombre}`, sharing con signed URL TTL 7 días.
- **Por qué**: simple, RLS-safe (anon no puede listar), URLs caducas evitan filtración indefinida.
- **Tradeoff**: el link de WhatsApp se invalida a los 7 días. Mensaje plantilla menciona "descargar lo antes posible"; Carlos puede regenerar el link desde el detalle de la cuenta de cobro.

### ADR-011: Single-PR delivery confirmado

- **Contexto**: el proposal marca `delivery_strategy: single-pr`.
- **Decisión**: mantener single-PR — el MVP completo cabe en un PR grande pero coherente. El `sdd-tasks` ordenará por capas (DB → auth → CRUDs → PDF → share) para facilitar review.
- **Tradeoff**: PR grande es más difícil de revisar. Mitigado con commits atómicos por capa y descripción detallada.

---

## 9. Riesgos arquitectónicos pendientes

| # | Riesgo | Estado | Plan |
|---|--------|--------|------|
| AR1 | `@react-pdf/renderer` puede no renderizar 1:1 el layout de Imagen 1 (espacios, alineación) | Pendiente validar en `sdd-apply` | POC en primer commit del PDF; iterar hasta visual signoff de Carlos. |
| AR2 | Supabase free tier: 500MB DB, 1GB Storage. PDFs compartidos + adjuntos pueden saturar | Bajo a corto plazo | Política de retención 30 días para `shared/` (cron fase 2). |
| AR3 | Sin email transaccional en MVP — solo `mailto:` (limita UX) | Aceptado | Documentar limitación; fase 2 evaluar Resend (free tier 100/día). |
| AR4 | Auditoría / log de cambios: hoy no hay tabla `audit_log` | Aceptado | Si Carlos necesita "quién cambió este estado", agregar `event_log` con trigger genérico. |
| AR5 | Backup de DB: depende de Supabase (free tier no incluye PITR) | Aceptado | Documentar export manual mensual con `pg_dump` desde dashboard. |

---

## 10. Próximo paso

Con `proposal.md` y `design.md` aprobados, `sdd-tasks` produce el plan de implementación en orden de dependencias:

1. Bootstrap Next.js + Tailwind + estructura de carpetas.
2. Supabase setup (proyecto, env vars, cliente helpers).
3. Migrations SQL (init → sequences → rls → storage) + función `buscar_clientes`.
4. Auth (middleware + login).
5. Landing pública (Hero, Servicios, Sectores, Footer, form Cotización + Server Action).
6. Admin layout + dashboard.
7. CRUDs (clientes → solicitudes → cotizaciones → cuentas de cobro), en ese orden por dependencia.
8. Adjuntos (FileUpload + bucket).
9. PDFs (template compartido → cotización → cuenta de cobro).
10. Share WhatsApp + signed URL.
11. README + deploy Vercel + seed admin instrucciones.
