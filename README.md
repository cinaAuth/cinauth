# cinaAuth

Plataforma todo-en-uno para vender productos digitales. Crea tu tienda, sube productos, conecta pagos reales y empiezas a vender en minutos. Estilo cyber-industrial / marketplace.

## Qué es cinaAuth

cinaAuth es una plataforma de comercio digital tipo **SellAuth** + **Amazon** que permite a cualquier creador montar su propia tienda de productos digitales bajo un subdominio propio (`tutienda.cinaauth.com`). Cada vendedor tiene un panel de control completo, y los compradores pueden navegar por catálogo, dejar reseñas, guardar favoritos y pagar con tarjeta mediante Stripe.

## Funcionalidades principales

### Landing pública
- Hero con estilo cyber-industrial, paleta *Sunset Blaze* y tipografía Orbitron + JetBrains Mono.
- Productos destacados retraídos de la base de datos.
- CTA a onboarding, demo store e inicio de sesión.

### Autenticación
- Registro e inicio de sesión con correo y contraseña.
- Inicio de sesión con Google (OAuth).
- Verificación en dos pasos (TOTP) opcional.
- Recuperación de contraseña.

### Onboarding (3 pasos)
1. **Cuenta** — nombre del dueño, correo, contraseña y aceptación de términos.
2. **Tienda** — nombre de la tienda y subdominio con sufijo `.cinaauth.com`.
3. **Lanzamiento** — resumen y botón para publicar la tienda.

### Panel de vendedor (Dashboard)
- Estadísticas: ingresos totales, pedidos totales, clientes únicos.
- Gráficas de Revenue y Orders de los últimos 7 días.
- Últimos pedidos completados.
- Productos con pestañas Best / Decliners / Risers.
- Top compradores y métodos de pago más usados.
- Menú lateral completo: Dashboard, Catalog, Sales, Audience, Marketing, Wallets, Storefront, Settings, Anti-Fraud, Developers, Account.
- Logo/nombre de la tienda y botón "View my store".
- Tarjeta de perfil con correo del dueño y logout.

### Tienda pública
- Cada tienda tiene su propia URL: `/<slug>`.
- Catálogo de productos con búsqueda y filtro por categorías.
- Tarjetas de producto con precio, tipo (one-time / subscription), rating y wishlist.
- Ficha de producto con descripción, reseñas con estrellas (solo compradores verificados) y productos relacionados.
- Carrito persistente.
- Checkout con Stripe (pagos únicos y suscripciones).
- Seguimiento de pedidos.

### Marketplace estilo Amazon
- Tablas: `categories`, `reviews`, `wishlists`.
- Reviews con estrellas solo de compradores verificados.
- Recomendaciones "Customers also bought".
- Wishlist (corazón, requiere login).

### Pagos
- Integración real con **Stripe**.
- Pagos únicos y suscripciones.
- Comisión de plataforma configurable (`PLATFORM_FEE_RATE`).
- Historial de compras y ventas.

### Admin / Staff
- Sistema de roles: `admin`, `moderator`, `user`.
- Consola de administración en `/_authenticated/admin.tsx`.
- Panel de staff con acceso a funciones de moderación.

### Analítica
- Tráfico y visitantes reales.
- Visitas, sesiones, fuentes, dispositivos, países y campañas.

## Tecnología

- **Framework:** TanStack Start v1
- **Frontend:** React 19, TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend / BD / Auth:** Lovable Cloud (Supabase) — no tocar credenciales ni sesiones manualmente
- **Pagos:** Stripe
- **UI:** Radix UI + shadcn/ui
- **Build:** Vite 8

## Scripts de desarrollo

```sh
npm i
npm run dev      # servidor de desarrollo en http://localhost:8080
npm run build    # build de producción
npm run lint     # ESLint
npm run format   # Prettier
```

## Estructura de rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública |
| `/auth` | Registro / login |
| `/onboarding` | Asistente de creación de tienda |
| `/dashboard` | Panel del vendedor |
| `/admin` | Panel de staff (solo admin/moderator) |
| `/:storeSlug` | Tienda pública |
| `/:storeSlug/:productSlug` | Ficha de producto |
| `/cart` | Carrito |
| `/checkout` | Checkout con Stripe |
| `/orders` | Historial de pedidos del comprador |
| `/orders/:orderNumber` | Detalle de un pedido |

## Datos de prueba

- Tienda demo: `/demo-cinaauth`
- Vendedor demo: `demo.vendedor@cinaauth.app` / `CinaAuth!Demo2026`
- Pedido verificado de ejemplo: `DFEA5D0F5B`

## Roadmap

Ver `roadmap.md` para el estado actual:

- ✅ Marketplace estilo Amazon (tienda pública).
- 🔄 Panel de vendedor estilo Notion (notas, tareas, dashboard personalizable, tablas tipo base de datos, colaboración).

## Despliegue

El proyecto está pensado para desplegarse en cualquier hosting compatible con **Vite + React + TanStack Start**, como Vercel, Netlify, Cloudflare Pages o tu propio servidor.

## Notas

- El dominio de correo de la plataforma se puede activar más adelante para enviar confirmaciones de compra y notificaciones de venta.
- La verificación en dos pasos es opcional; puede activarse desde `/mfa`.

---

Código generado con [Lovable](https://lovable.dev). El proyecto es tuyo: puedes conectarlo a GitHub o descargarlo y subirlo donde prefieras.
