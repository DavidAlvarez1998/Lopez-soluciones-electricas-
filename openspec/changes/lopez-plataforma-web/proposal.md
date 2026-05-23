# Proposal — López Soluciones Eléctricas: Plataforma Web

**Change name:** `lopez-plataforma-web`
**Author:** SDD (sdd-propose phase)
**Date:** 2026-05-23
**Status:** Proposed
**Artifact store:** openspec
**Delivery strategy:** single-pr
**Stack:** Next.js 14 (App Router) + React + Tailwind CSS + Supabase (Postgres + Auth + Storage)

---

## 1. Cambio propuesto

### Qué es

Construir desde cero la **plataforma web full-stack de López Soluciones Eléctricas** (Pereira, Risaralda), reemplazando el HTML estático actual (`index_legacy.html`) por una aplicación Next.js 14 con backend integrado en Supabase.

La plataforma tiene **dos caras**:

1. **Sitio público** — landing comercial + formulario de cotización abierto al público.
2. **Backoffice (admin)** — área privada para Carlos López donde gestiona clientes, cotizaciones y cuentas de cobro (que hoy lleva en Word/Excel y comparte por WhatsApp como PDF).

### Qué problema resuelve

Hoy el negocio opera con tres dolores concretos:

- **Documentos manuales**: cada cuenta de cobro y cotización se hace a mano en Word, sin consecutivos automáticos, sin trazabilidad de pagos ni estados. Se duplican datos del cliente en cada documento.
- **Datos de clientes dispersos**: cuando un cliente recurrente vuelve a contratar, Carlos retipea NIT, dirección, correo y teléfono desde memoria o buscando en chats viejos.
- **Sin canal estructurado**: las cotizaciones que entran por la landing actual se envían como string de texto por WhatsApp (`wa.me/...`), sin quedar registradas en ningún sistema.

### Por qué ahora

Carlos necesita escalar la operación (atiende sectores residencial, industrial, comercial e institucional) sin contratar personal administrativo. Centralizar clientes + documentos + estados en una sola herramienta web le devuelve horas/semana y reduce errores en facturación (consecutivos, datos de contratante, totales).

### Success looks like

- Carlos genera una cuenta de cobro en < 2 minutos eligiendo un cliente existente (autocomplete) y los items del servicio.
- Cada cuenta de cobro tiene consecutivo único automático y estado (pendiente/pagada).
- Carlos descarga el PDF idéntico al formato actual (Imagen 1) o lo envía por WhatsApp/correo desde la UI.
- El público envía cotizaciones desde la landing y quedan registradas en el backoffice (no solo en WhatsApp).
- Cotización aprobada → se convierte en cuenta de cobro reutilizando los datos.

---

## 2. Alcance

### In-scope (MVP)

**Público:**
- Landing migrada a Next.js manteniendo paleta (`#030f23`, `#1354a8`, `#f04e2b`...) y tipografía (Barlow Condensed / Barlow).
- Secciones: Hero, Servicios (6), Sectores (4), Cotización (form), Contacto, Footer.
- Formulario público de cotización que persiste en Supabase y dispara notificación (mínimo: queda visible en el dashboard admin).
- Click-to-WhatsApp y mailto en CTAs (mantener UX existente).

**Backoffice (admin):**
- Auth con Supabase Auth (email + password, un solo rol `admin` para Carlos en MVP).
- Dashboard con métricas básicas: cotizaciones pendientes, cuentas de cobro pendientes, total cobrado del mes.
- CRUD de **Clientes**: nombre/razón social, NIT/CC, dirección, teléfono, correo. Búsqueda por nombre con autocomplete.
- CRUD de **Cotizaciones** (admin): crear desde cero o desde una solicitud pública, asociar a cliente existente o nuevo, items con descripción/valor, total automático, estado `pendiente | aprobada | rechazada`, consecutivo automático.
- CRUD de **Cuentas de Cobro**: mismos datos que el PDF actual (Imagen 1), consecutivo `CC-{año}-{nnn}`, items `ITEM | DESCRIPCION | CANTIDAD | VALOR UNIDAD | VALOR`, subtotal y total automáticos, sin IVA, estado `pendiente | pagada` con fecha de pago, observaciones libres, datos bancarios fijos (Davivienda + Bancolombia), firma fija (Carlos Andrés López Osorio).
- **Vinculación cotización → cuenta de cobro**: desde una cotización aprobada, botón "Generar cuenta de cobro" que precarga datos. Quedan relacionadas vía FK.
- **Adjuntos**: Carlos puede subir documentos adicionales (cédula, tarjeta profesional, soportes) a Supabase Storage y adjuntarlos a una cuenta de cobro/cotización antes de enviarla.
- **Exportación PDF**: descarga del documento (cotización o cuenta de cobro) replicando el layout actual.
- **Envío**: botones "Enviar por WhatsApp" (link `wa.me` con texto + URL pública del PDF) y "Enviar por correo" (mailto o transactional email — ver Riesgos).

**Cross-cutting:**
- Esquema de base de datos en Postgres (Supabase) con RLS (Row Level Security) para aislar lo público de lo admin.
- Despliegue en Vercel.

### Out-of-scope (NO en este MVP)

- **Facturación electrónica DIAN** (esto NO es una factura legal, son "cuentas de cobro" — no requieren CUFE ni firma electrónica). Si en el futuro Carlos se vuelve responsable de IVA, se evalúa integrar Siigo/Alegra.
- **IVA y retenciones**: explícitamente fuera. Los totales son simples (sum de líneas).
- **Multi-usuario / multi-rol**: solo Carlos como admin. No hay rol técnico ni cliente con login.
- **Portal cliente**: los clientes NO se loguean para ver su histórico. Solo reciben PDFs por WhatsApp/correo.
- **Pagos en línea**: no se integra pasarela. El pago se confirma manualmente cambiando el estado a `pagada`.
- **Agenda / calendario de servicios**: las "emergencias 24/7" siguen llegando por WhatsApp/teléfono — no se modela orden de trabajo.
- **Inventario** de materiales eléctricos.
- **Reportes contables avanzados** (P&L, flujo de caja). Solo métricas básicas del dashboard.
- **App móvil nativa**. La web responsive cubre el caso de uso de Carlos en campo.
- **Internacionalización**. Solo español Colombia.

---

## 3. Usuarios y flujos principales

### Usuario 1 — Visitante público (cliente potencial)

**Flujo "Solicitar cotización":**
1. Llega a la landing, navega Servicios/Sectores.
2. Llena form de cotización (fecha, nombre, contacto, teléfono, dirección, descripción del trabajo).
3. Envía → la solicitud se guarda en Postgres como `cotizacion_solicitud` con estado `nueva` + opcionalmente abre WhatsApp con resumen.
4. Recibe confirmación visual en pantalla.

### Usuario 2 — Carlos (admin)

**Flujo "Atender solicitud pública":**
1. Login en `/admin`.
2. Ve en dashboard "3 cotizaciones nuevas".
3. Abre una solicitud → revisa datos → si el cliente no existe lo crea desde el mismo modal; si existe, lo vincula.
4. Construye la cotización formal (items, valores) → guarda como `pendiente` → descarga PDF o envía por WhatsApp.

**Flujo "Cotización recurrente con cliente conocido":**
1. `/admin/cotizaciones/nueva`.
2. En campo "Cliente" escribe "Indust..." → autocomplete muestra "Industrias XYZ S.A.S." con datos precargados (NIT, dirección, etc.).
3. Agrega items, guarda, exporta.

**Flujo "Cobrar":**
1. Cotización aprobada (Carlos cambia estado manualmente cuando el cliente confirma).
2. Click "Generar cuenta de cobro" → se crea `cuenta_cobro` vinculada, mismos items, consecutivo nuevo.
3. Carlos adjunta cédula + tarjeta profesional si el cliente lo pidió.
4. Descarga PDF / envía por WhatsApp/correo.
5. Cuando le pagan, marca `pagada` con fecha de pago.

---

## 4. Stack y decisiones técnicas

### Next.js 14 App Router (decidido)

**Por qué:** un solo proyecto sirve landing pública (SSG/ISR para SEO) + dashboard admin (Client Components con Server Actions) + API routes. Evita el split de "frontend Vercel + API en otro lado". Server Components permiten consultar Supabase directamente desde el servidor sin exponer claves al cliente.

**Tradeoff:** App Router tiene más curva que Pages Router; mitigado porque el proyecto es greenfield y no hay legacy.

### Supabase (decidido)

**Por qué:**
- **Postgres real** (no un KV/NoSQL): los datos son relacionales puros (cliente 1:N cotizaciones 1:N items, cotización 1:1 cuenta_cobro).
- **Auth incluida**: no hace falta montar NextAuth + provider + hashing manual para un solo usuario admin.
- **Storage incluido**: bucket para PDFs generados, cédula, tarjeta profesional y adjuntos. URLs firmadas para envío seguro por WhatsApp.
- **RLS nativo**: políticas por tabla para que el form público solo pueda `INSERT` en `cotizacion_solicitud` y nada más.
- **Free tier generoso** (500MB DB, 1GB storage) — suficiente para el MVP de un electricista.

**Tradeoff:** vendor lock-in moderado. Mitigado: usamos SQL estándar y la lógica vive en Next.js, no en Edge Functions de Supabase. Migrar a Postgres self-hosted + S3 sería viable.

### Tailwind CSS (decidido)

**Por qué:** velocidad de iteración para replicar el diseño del landing (variables CSS → tokens Tailwind) y construir el dashboard admin sin mantener CSS separado. Custom theme en `tailwind.config.ts` con los tokens de marca (`navy`, `blue`, `accent`...).

### Generación de PDF — a decidir en `sdd-design`

Tres opciones realistas (ver Riesgos §6):

- **A. `@react-pdf/renderer`** (server-side, React declarativo) — recomendado por DX y consistencia visual.
- **B. `puppeteer` / `playwright-chromium`** (renderiza HTML real) — más fiel pero pesa mucho en serverless.
- **C. `pdfkit` / `pdf-lib`** (imperativo) — control total pero código verbose.

La decisión final se cierra en `sdd-design`. **Recomendación inicial: A**.

### Despliegue — Vercel (recomendado)

Integración nativa con Next.js + variables de entorno + preview deployments por PR. Sin servidor que mantener.

---

## 5. Módulos principales

| Módulo | Responsabilidad | Rutas / superficie |
|--------|----------------|---------------------|
| **Landing pública** | Replicar HTML actual en componentes React; SEO básico (metadata, OG). | `/`, `/servicios`, `/sectores`, `/contacto` (o single-page con anclas) |
| **Cotización pública** | Form abierto que persiste solicitud. | `/cotizar` + Server Action |
| **Auth** | Login admin con Supabase Auth, protección de `/admin/*`. | `/admin/login`, middleware |
| **Dashboard admin** | Home con métricas y accesos rápidos. | `/admin` |
| **Clientes** | CRUD + búsqueda con autocomplete. | `/admin/clientes`, `/admin/clientes/[id]` |
| **Cotizaciones admin** | CRUD + estados + conversión a cuenta de cobro. | `/admin/cotizaciones`, `/admin/cotizaciones/[id]` |
| **Cuentas de cobro** | CRUD + estados de pago + consecutivos. | `/admin/cuentas-cobro`, `/admin/cuentas-cobro/[id]` |
| **Adjuntos / documentos** | Upload a Supabase Storage, vínculo con cotización/cuenta. | Componente reusable + bucket policies |
| **Export PDF** | Renderizado server-side de cotización y cuenta de cobro. | `/api/pdf/cotizacion/[id]`, `/api/pdf/cuenta-cobro/[id]` |
| **Compartir** | Botones WhatsApp (link `wa.me` + URL firmada del PDF en Storage) y correo. | Componentes en detalle de documento |
| **DB schema + migrations** | Tablas, índices, RLS, seeds. | `supabase/migrations/*.sql` |

### Tablas principales (preview — se detalla en `sdd-spec` y `sdd-design`)

- `clientes` (id, nombre_razon_social, nit_cc, direccion, telefono, correo, created_at)
- `cotizaciones_solicitudes` (id, datos del form público, estado `nueva|atendida|descartada`)
- `cotizaciones` (id, consecutivo, cliente_id FK, concepto, total, estado `pendiente|aprobada|rechazada`, fechas)
- `cotizaciones_items` (id, cotizacion_id FK, descripcion, valor)
- `cuentas_cobro` (id, consecutivo, cliente_id FK, cotizacion_id FK nullable, subtotal, total, estado `pendiente|pagada`, fecha_creacion, fecha_pago, observaciones)
- `cuentas_cobro_items` (id, cuenta_cobro_id FK, descripcion, cantidad, valor_unidad, valor_total)
- `adjuntos` (id, entidad_tipo, entidad_id, storage_path, nombre_archivo, mime)

---

## 6. Riesgos

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| R1 | **PDF en serverless**: `puppeteer` excede el límite de 50MB de Vercel functions. | Bloquea export. | Usar `@react-pdf/renderer` (puro JS, ~2MB). Validar en `sdd-design` con un POC del layout de Imagen 1. |
| R2 | **WhatsApp sharing**: `wa.me` no permite adjuntar archivos directamente; solo texto + URL. | UX no es "enviar el PDF", es "enviar link al PDF". | Generar URL firmada de Supabase Storage con expiración (ej. 7 días) e incluirla en el texto. Documentar el flujo claramente para Carlos. |
| R3 | **Envío por correo**: `mailto:` abre cliente local y no garantiza envío. SMTP requiere servicio externo (Resend, SendGrid). | Email no confiable o requiere config extra. | MVP: usar `mailto:` con PDF adjunto via data-URL pequeño O link a Storage. Fase 2: integrar Resend (free tier 100/día). Decidir en `sdd-design`. |
| R4 | **Supabase Storage costs**: si se acumulan muchos PDFs + adjuntos pesados (cédulas escaneadas), se pasa el free tier (1GB). | Costo inesperado. | Comprimir imágenes server-side antes de upload. Política de retención: borrar PDFs generados > 90 días (se regeneran on-demand). |
| R5 | **Consecutivos concurrentes**: dos cuentas de cobro creadas simultáneamente podrían colisionar consecutivo. | Documentos con número duplicado (problema legal/contable). | Usar `SEQUENCE` de Postgres (no `MAX(consecutivo)+1` en app). |
| R6 | **RLS mal configurada**: el form público podría exponer lectura de cotizaciones privadas. | Fuga de datos. | Policy explícita: `cotizaciones_solicitudes` permite `INSERT` con `anon` role; todo lo demás requiere `authenticated`. Auditar en `sdd-verify`. |
| R7 | **Autocomplete de clientes con tildes/case**: "industrias" vs "Industrias" vs "INDUSTRIAS". | UX rota, datos duplicados. | Índice `lower(unaccent(nombre_razon_social))` en Postgres + búsqueda case/accent-insensitive. |
| R8 | **Datos bancarios y firma hardcoded**: si Carlos cambia banco o número, hay que redeploy. | Mantenimiento manual del dev. | Tabla `config_empresa` (singleton) editable desde `/admin/configuracion` en una iteración futura. MVP: constantes en código documentadas. |
| R9 | **Carlos no es técnico**: la UI debe ser obvia, sin jerga. | Adopción fallida. | UX en español plano, labels iguales al PDF actual ("ITEMS", "DESCRIPCIÓN", "VALOR"). Onboarding 1:1 al hacer entrega. |

---

## 7. Criterio de Done (MVP)

El MVP se considera **completo** cuando se cumple TODO lo siguiente, validado por Carlos en producción:

### Funcional

- [ ] Landing pública desplegada en Vercel, idéntica visualmente al `index_legacy.html` (paleta, tipografía, secciones).
- [ ] Form público de cotización persiste en Supabase y la solicitud aparece en `/admin`.
- [ ] Carlos puede loguearse en `/admin/login` y todas las rutas `/admin/*` están protegidas.
- [ ] CRUD completo de clientes con autocomplete case/accent-insensitive funcionando.
- [ ] CRUD completo de cotizaciones con consecutivo automático, items, total, y 3 estados (pendiente/aprobada/rechazada).
- [ ] CRUD completo de cuentas de cobro con consecutivo automático, items (cantidad × valor unidad), subtotal, total, y 2 estados (pendiente/pagada con fecha de pago).
- [ ] Desde una cotización aprobada se genera una cuenta de cobro vinculada con datos precargados.
- [ ] Upload de adjuntos (cédula, tarjeta profesional) a Supabase Storage, asociados a cotización o cuenta de cobro.
- [ ] Botón "Descargar PDF" genera cotización en formato Imagen 2 y cuenta de cobro en formato Imagen 1 — visualmente fieles (logo, NIT, datos bancarios, firma, totales).
- [ ] Botón "Compartir por WhatsApp" abre `wa.me` con texto + URL firmada del PDF.
- [ ] Dashboard muestra: nº de solicitudes públicas nuevas, cotizaciones pendientes, cuentas de cobro pendientes, total cobrado en el mes.

### No funcional

- [ ] Schema Postgres con RLS auditada (verificado en `sdd-verify`).
- [ ] Despliegue automatizado en Vercel desde `main`.
- [ ] Variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) configuradas y NO expuestas al cliente.
- [ ] Responsive: dashboard usable en móvil (Carlos en campo con celular).
- [ ] Lighthouse del landing > 90 en Performance y Accessibility.
- [ ] README con setup local (`npm install`, `.env.local`, `supabase db reset`) y guía de despliegue.

### Entrega

- [ ] PR único merged a `main` (delivery_strategy = `single-pr`).
- [ ] Walkthrough en vivo con Carlos creando 1 cliente + 1 cotización + 1 cuenta de cobro + PDF + envío WhatsApp end-to-end.

---

## 8. Siguientes pasos

Este proposal habilita en paralelo:
- `sdd-spec` — detallar requisitos funcionales por módulo en formato SHALL.
- `sdd-design` — cerrar decisiones técnicas: librería PDF, estructura de carpetas Next.js App Router, esquema SQL final con RLS, estrategia de email.

Una vez ambos estén listos, `sdd-tasks` produce el plan de implementación.
