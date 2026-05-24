# Tasks: López Soluciones Eléctricas — Plataforma Web

**Change name:** `lopez-plataforma-web`
**Date:** 2026-05-23
**Delivery strategy:** `single-pr`

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2.800 – 3.800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation + DB + Auth) → PR 2 (Landing + Admin layout) → PR 3 (CRUDs + Server Actions) → PR 4 (PDF + Adjuntos + Share) |
| Delivery strategy | `single-pr` |
| Chain strategy | `size-exception` |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

> **Nota**: La estrategia `single-pr` requiere `size:exception` del mantenedor antes de ejecutar `sdd-apply`. El PR va a superar ampliamente las 400 líneas (greenfield completo). Con commits atómicos por capa, el review queda particionado por commit aunque sea un solo PR.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Setup + DB + Auth | PR único (commit 1-3) | Base para todo |
| 2 | Landing pública | PR único (commit 4) | Independiente, SSG |
| 3 | Admin layout + Dashboard | PR único (commit 5-6) | Depende de Unit 1 |
| 4 | CRUDs admin | PR único (commit 7-10) | Depende de Unit 3 |
| 5 | PDF + Adjuntos + Share | PR único (commit 11-13) | Depende de Unit 4 |

---

## Phase 1: Setup inicial

- [x] 1.1 Crear proyecto Next.js 14 con `create-next-app --typescript --tailwind --app --src-dir false` en `C:\Users\adjua\Desktop\LOPEZ`. Archivos: `package.json`, `next.config.js`, `tsconfig.json`.
- [x] 1.2 Instalar dependencias: `@supabase/supabase-js @supabase/ssr @react-pdf/renderer zod`. Archivo: `package.json`.
- [x] 1.3 Configurar `tailwind.config.ts` con paleta de colores custom (navy, blue, accent, off-white, gray) y tipografía Barlow/Barlow Condensed.
- [x] 1.4 Configurar `app/layout.tsx` con `next/font` (Barlow + Barlow Condensed), variables CSS `--font-barlow` y `--font-barlow-condensed`, metadata global.
- [x] 1.5 Crear `app/globals.css` con directivas Tailwind y tokens raíz.
- [x] 1.6 Crear `.env.local.example` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [x] 1.7 Crear `lib/constants/empresa.ts` con NIT, titular (Carlos Andrés López Osorio), CC (1.088.252.549), email, teléfono, bancos (Davivienda 127070034526, Bancolombia 27054262871).
- [x] 1.8 Crear `lib/formatters/currency.ts` (COP "$ 1.234.567"), `lib/formatters/date.ts` ("23 de mayo de 2026"), `lib/formatters/consecutivo.ts`.
- [x] 1.9 Agregar regla ESLint `no-restricted-imports` que prohíbe importar `lib/supabase/admin` desde archivos `'use client'` o carpetas `app/(public)/` y `components/public/`. Archivo: `.eslintrc.json`.

---

## Phase 2: Supabase — base de datos y storage

- [x] 2.1 Crear `supabase/migrations/0001_init.sql`: extensiones (`pgcrypto`, `unaccent`, `pg_trgm`), enums, tablas (`clientes`, `solicitudes_publicas`, `cotizaciones`, `items_cotizacion`, `cuentas_cobro`, `items_cuenta_cobro`, `adjuntos`), índices, triggers `updated_at` y recálculo de totales.
- [x] 2.2 Crear `supabase/migrations/0002_sequences.sql`: tabla `consecutivos_anuales`, función `next_consecutivo(p_tipo text)`, función `buscar_clientes(q text, lim int)` con `pg_trgm`.
- [x] 2.3 Crear `supabase/migrations/0003_rls.sql`: habilitar RLS en todas las tablas, policy INSERT anon en `solicitudes_publicas`, policies full-access authenticated en el resto, grants a `next_consecutivo` y `buscar_clientes`.
- [x] 2.4 Crear `supabase/migrations/0004_storage.sql`: bucket `adjuntos` (privado), policies storage para `authenticated` (SELECT, INSERT, UPDATE, DELETE).
- [x] 2.5 Crear `supabase/seed.sql` con 2-3 clientes y 1 solicitud de prueba (datos ficticios). Archivo: `supabase/seed.sql`.
- [x] 2.6 Crear `lib/supabase/server.ts` (`createServerClient` para Server Components y Server Actions), `lib/supabase/client.ts` (`createBrowserClient`), `lib/supabase/middleware.ts` (para el middleware Next.js), `lib/supabase/admin.ts` (service role, solo server).

---

## Phase 3: Auth — middleware y login

- [x] 3.1 Crear `middleware.ts` en la raíz: intercepta `/admin/*`, excluye `/admin/login`, redirige a `/admin/login?next=...` si no hay sesión, redirige a `/admin` si hay sesión en la login page. Exportar `config.matcher`.
- [x] 3.2 Crear `app/admin/login/page.tsx` (Client Component): form email + password, llamada a `supabase.auth.signInWithPassword`, redirect a `next` o `/admin`, mostrar "Credenciales incorrectas" en error.
- [x] 3.3 Agregar logout en `app/admin/layout.tsx`: llama `supabase.auth.signOut()` + redirect a `/admin/login`. El layout también hace `getUser()` server-side como segunda línea de defensa.

---

## Phase 4: Landing pública

- [ ] 4.1 Crear `app/(public)/layout.tsx` (sin auth check, sin sidebar admin).
- [ ] 4.2 Crear `components/public/Hero.tsx`: sección hero con fondo navy, título Barlow Condensed, botón CTA WhatsApp `wa.me/573004513435`.
- [ ] 4.3 Crear `components/public/Servicios.tsx`: grilla de 6 servicios con íconos SVG, fondo navy-2.
- [ ] 4.4 Crear `components/public/Sectores.tsx`: 4 sectores con imagen de fondo + overlay.
- [ ] 4.5 Crear `components/public/Contacto.tsx`: datos de contacto, mapa embed opcional, CTA WhatsApp y mailto.
- [ ] 4.6 Crear `components/public/Footer.tsx`: NIT, dirección, email, redes, copyright.
- [ ] 4.7 Crear `components/public/FormCotizacion.tsx` (Client Component): campos nombre, teléfono, dirección, descripción; validación inline; llama Server Action `crear-solicitud`; muestra mensaje de éxito.
- [ ] 4.8 Crear `app/(public)/actions/crear-solicitud.ts` (Server Action): valida con Zod, inserta en `solicitudes_publicas` via cliente Supabase anon, retorna `{ ok, error }`.
- [ ] 4.9 Crear `app/(public)/page.tsx` (Server Component, SSG): componer Hero + Servicios + Sectores + FormCotizacion + Contacto + Footer. Metadata con `title` y `description` para Lighthouse.
- [ ] 4.10 Copiar `public/logo.svg` (o `.png`) desde el legado HTML al directorio `public/`.

---

## Phase 5: Componentes UI base y Admin layout

- [ ] 5.1 Crear `components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Label.tsx` con variantes Tailwind (primary, secondary, ghost, danger).
- [ ] 5.2 Crear `components/admin/Sidebar.tsx` (Client Component): navegación con íconos, estado open/closed en móvil, links a Dashboard/Solicitudes/Clientes/Cotizaciones/Cuentas de Cobro.
- [ ] 5.3 Crear `components/admin/Topbar.tsx`: muestra email del usuario, botón logout.
- [ ] 5.4 Crear `components/admin/EstadoBadge.tsx`: chip de color según estado (nueva=blue, pendiente=yellow, aprobada=green, rechazada=red, pagada=green).
- [ ] 5.5 Crear `components/admin/ConfirmDialog.tsx` (Client Component): modal de confirmación reutilizable.
- [ ] 5.6 Crear `app/admin/layout.tsx` (Server Component): `getUser()`, bloquea render si no hay user, renderiza Sidebar + Topbar + `{children}`.

---

## Phase 6: Dashboard admin

- [x] 6.1 Crear `app/admin/page.tsx` (Server Component): 4 queries Supabase paralelas para métricas (solicitudes nuevas, cotizaciones pendientes, cuentas de cobro pendientes, total cobrado en el mes). Manejo de zero state. Links a módulos filtrados.

---

## Phase 7: Módulo Clientes

- [x] 7.1 Crear `lib/validators/cliente.ts` con schema Zod para create/update cliente. [Inline en lib/actions/clientes.ts]
- [x] 7.2 Crear `lib/actions/clientes.ts`: Server Actions `crearCliente`, `actualizarCliente`, `eliminarCliente` (previene borrar si hay documentos vinculados), `buscarClientes`.
- [x] 7.3 `components/admin/ClienteAutocomplete.tsx` — ya existía, reutilizado sin cambios.
- [x] 7.4 Crear `app/admin/clientes/page.tsx` (Server Component): lista de clientes con búsqueda básica + link a nuevo/editar, paginación 25/page.
- [x] 7.5 Crear `app/admin/clientes/nuevo/page.tsx`: form Client Component, llama `crearCliente` action.
- [x] 7.6 Crear `app/admin/clientes/[id]/editar/page.tsx`: carga cliente, form de edición, confirmación eliminar.

---

## Phase 8: Módulo Solicitudes

- [x] 8.1 Crear `lib/actions/solicitudes-admin.ts`: Server Actions `listarSolicitudes`, `actualizarEstadoSolicitud`, `convertirSolicitudACotizacion`.
- [x] 8.2 Crear `app/admin/solicitudes/page.tsx` (Server Component): lista filtrable por estado, badge contador de nuevas.
- [x] 8.3 Crear `app/admin/solicitudes/[id]/page.tsx`: detalle + acciones (crear cotización, revisar, descartar, reactivar).

---

## Phase 9: Módulo Cotizaciones

- [x] 9.1 Schema Zod para cotizaciones inline en `lib/actions/cotizaciones.ts`.
- [x] 9.2 `components/admin/InvoiceTableCotizacion.tsx` — ya existía, reutilizado.
- [x] 9.3 Crear `lib/actions/cotizaciones.ts`: `crearCotizacion` (next_consecutivo atomico), `actualizarCotizacion`, `actualizarEstadoCotizacion`, `eliminarCotizacion`, `obtenerCotizacion`, `vincularCuentaCobro`.
- [x] 9.4 Crear `app/admin/cotizaciones/page.tsx` (Server Component): lista con filtros por estado.
- [x] 9.5 Crear `app/admin/cotizaciones/nuevo/page.tsx` (Client Component): ClienteAutocomplete + InvoiceTableCotizacion, pre-carga desde solicitud_id.
- [x] 9.6 Crear `app/admin/cotizaciones/[id]/page.tsx` (Client Component): detalle/editar, cambio estado, generar CC, placeholders PDF/WhatsApp, FileUpload adjuntos.

---

## Phase 10: Módulo Cuentas de Cobro

- [x] 10.1 Schema Zod para cuentas de cobro inline en `lib/actions/cuentas-cobro.ts`.
- [x] 10.2 Crear `lib/actions/cuentas-cobro.ts`: `crearCuentaCobro` (next_consecutivo), `actualizarCuentaCobro`, `marcarPagada`, `marcarPendiente`, `obtenerCuentaCobro`, `crearDesdeCotizacion`, `eliminarCuentaCobro`.
- [x] 10.3 Crear `app/admin/cuentas-cobro/page.tsx` (Server Component): lista con filtros pendiente/pagada.
- [x] 10.4 Crear `app/admin/cuentas-cobro/nuevo/page.tsx` (Client Component): pre-carga desde cotizacion_id.
- [x] 10.5 Crear `app/admin/cuentas-cobro/[id]/page.tsx` (Client Component): detalle con marcar pagada (date picker), revertir, datos bancarios EMPRESA, placeholders PDF/WhatsApp, FileUpload.

---

## Phase 11: Adjuntos

- [ ] 11.1 Crear `components/admin/FileUpload.tsx` (Client Component): input file, validación 10 MB client-side, upload a Supabase Storage via `createBrowserClient`, llama Server Action `commitAdjunto` para persistir en tabla `adjuntos`.
- [ ] 11.2 Crear `components/admin/FileList.tsx`: lista adjuntos de un documento, link de descarga con signed URL (7 días), botón eliminar.
- [ ] 11.3 Crear `app/admin/actions/adjuntos.ts`: Server Actions `commitAdjunto` (INSERT en tabla `adjuntos`), `deleteAdjunto` (borra de Storage + tabla), `getSignedUrl` (genera signed URL TTL 7 días).
- [ ] 11.4 Crear `app/api/adjuntos/signed-url/route.ts`: GET handler que recibe `?path=...`, valida sesión, llama `supabase.storage.from('adjuntos').createSignedUrl`, retorna URL (para uso desde WhatsApp share).

---

## Phase 12: PDF Templates

- [ ] 12.1 Crear `components/pdf/fonts.ts`: registrar Barlow vía `Font.register` con URLs de Google Fonts. Fallback a Helvetica.
- [ ] 12.2 Crear `components/pdf/PDFShared.tsx`: componente header compartido (logo + datos empresa + bloque consecutivo/fecha) y footer con email.
- [ ] 12.3 Crear `components/pdf/PDFCotizacion.tsx`: template cotización con `PDFShared`, tabla items (ITEM | DESCRIPCIÓN | VALOR), total, bloque firma. Sin sección bancaria.
- [ ] 12.4 Crear `components/pdf/PDFCuentaCobro.tsx`: template cuenta de cobro con `PDFShared`, bloque cliente, tabla items (ITEM | DESCRIPCIÓN | CANTIDAD | VALOR UNIDAD | VALOR), subtotal/total, sección bancaria hardcoded desde `EMPRESA`, observaciones, firma.
- [ ] 12.5 Crear `components/pdf/PDFDownloadButton.tsx` (Client Component): wrappea `PDFDownloadLink` con `dynamic({ ssr: false })`, acepta `document` prop, muestra "Generando..." durante render.

---

## Phase 13: Compartir (WhatsApp + correo)

- [ ] 13.1 Crear `lib/whatsapp.ts`: función `buildWhatsAppURL({ telefono, nombreCliente, consecutivo, total, signedUrl })` que genera `wa.me/{telefono}?text={encoded}` con texto plantilla profesional en español.
- [ ] 13.2 Crear `components/admin/ShareButtons.tsx` (Client Component): botón "Compartir por WhatsApp" — genera PDF blob con `pdf(...).toBlob()`, sube a Storage en `shared/{consecutivo}-{ts}.pdf`, obtiene signed URL via `/api/adjuntos/signed-url`, abre `wa.me` link. Botón "Compartir por correo" — genera `mailto:` con email del cliente, asunto y URL del PDF.

---

## Phase 14: Polish, responsive y UX

- [ ] 14.1 Agregar drawer mobile para Sidebar en `components/admin/Sidebar.tsx` (toggle con botón hamburguesa en Topbar, overlay backdrop).
- [ ] 14.2 Agregar loading states (`loading.tsx`) en rutas `/admin/cotizaciones`, `/admin/cuentas-cobro`, `/admin/clientes` con skeleton Tailwind.
- [ ] 14.3 Agregar `error.tsx` global en `/app` y en `/app/admin` con mensaje de error y botón retry.
- [ ] 14.4 Agregar toasts de éxito/error (usando `sonner` o implementación mínima custom) en Server Actions de creación/edición/borrado.
- [ ] 14.5 Verificar Lighthouse score > 90 en landing (`/`): optimizar imágenes con `next/image`, revisar `metadata` en `app/(public)/page.tsx`.
- [ ] 14.6 Crear `README.md` con instrucciones de setup local, cómo crear el admin user en Supabase dashboard, cómo correr migrations, y URL de deploy Vercel.

---

## Phase 15: Verificación contra spec

- [ ] 15.1 Probar escenario: visitante carga `/`, verifica todas las secciones visibles y colores de marca.
- [ ] 15.2 Probar escenario: formulario público con campos vacíos — debe rechazar sin crear registro.
- [ ] 15.3 Probar escenario: visitante anónimo hace SELECT a `solicitudes_publicas` vía Supabase anon key — debe retornar 0 filas (RLS).
- [ ] 15.4 Probar escenario: usuario no autenticado navega a `/admin/dashboard` — debe redirigir a `/admin/login`.
- [ ] 15.5 Probar escenario: login con credenciales incorrectas — debe mostrar "Credenciales incorrectas" sin crear sesión.
- [ ] 15.6 Probar escenario: autocomplete con tildes — "acueducto" encuentra "Acueducto Risaralda".
- [ ] 15.7 Probar escenario: crear cotización, verificar consecutivo `COT-2026-001`, estado `pendiente`, total = suma items.
- [ ] 15.8 Probar escenario: cotización `aprobada` → "Generar cuenta de cobro" → nueva cuenta `COB-2026-001` con items pre-poblados.
- [ ] 15.9 Probar escenario: cuenta de cobro, cantidad=2, valor_unidad=150000 → valor_total=300000 automático.
- [ ] 15.10 Probar escenario: marcar cuenta de cobro como pagada → `fecha_pago` = hoy, dashboard actualiza "Total cobrado en el mes".
- [ ] 15.11 Probar escenario: intentar eliminar cliente con cotizaciones vinculadas — debe mostrar mensaje de error y no borrar.
- [ ] 15.12 Probar escenario: subir archivo > 10 MB → rechazado antes de enviarse a Storage.
- [ ] 15.13 Probar escenario: descargar PDF de cuenta de cobro — incluye "Davivienda N° 127070034526" y "Carlos Andrés López Osorio".
- [ ] 15.14 Probar escenario: compartir por WhatsApp — genera URL `wa.me/573004513435` con texto y signed URL válida 7 días.
