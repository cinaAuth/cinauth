<div align="center">

```text
        ██████╗██╗███╗   ██╗ █████╗ ██╗   ██╗████████╗██╗  ██╗
       ██╔════╝██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝██║  ██║
       ██║     ██║██╔██╗ ██║███████║██║   ██║   ██║   ███████║
       ██║     ██║██║╚██╗██║██╔══██║██║   ██║   ██║   ██╔══██║
       ╚██████╗██║██║ ╚████║██║  ██║╚██████╔╝   ██║   ██║  ██║
        ╚═════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝

        [ D I G I T A L   C O M M E R C E   ·   B U I L T   F O R   S C A L E ]
```

`> SYSTEM ONLINE` &nbsp;·&nbsp; `> 24 LANGUAGES` &nbsp;·&nbsp; `> STRIPE LIVE` &nbsp;·&nbsp; `> CYBER MODE: ENABLED`

![stack](https://img.shields.io/badge/TanStack_Start-v1-F97316?style=flat-square&labelColor=0A0A0A)
![react](https://img.shields.io/badge/React-19-F97316?style=flat-square&labelColor=0A0A0A)
![ts](https://img.shields.io/badge/TypeScript-strict-F97316?style=flat-square&labelColor=0A0A0A)
![tailwind](https://img.shields.io/badge/Tailwind-v4-F97316?style=flat-square&labelColor=0A0A0A)
![stripe](https://img.shields.io/badge/Payments-Stripe-F97316?style=flat-square&labelColor=0A0A0A)
![status](https://img.shields.io/badge/status-active-22C55E?style=flat-square&labelColor=0A0A0A)

</div>

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  01 · WHAT IS CINAAUTH                                               ║
╚══════════════════════════════════════════════════════════════════════╝
```

**cinaAuth** es una plataforma de comercio digital todo-en-uno. Cualquier creador monta su tienda
bajo su propio subdominio (`tutienda.cinaauth.com`), sube productos, conecta pagos reales y vende
en minutos. Estética *cyber-industrial*: negro casi absoluto, acento naranja `#F97316`, tipografía
Orbitron + JetBrains Mono y bordes angulares.

```text
   VENDEDOR ──▶ ONBOARDING ──▶ TIENDA ──▶ CATÁLOGO ──▶ CHECKOUT ──▶ PAGO
       ▲                                                              │
       └──────────────  MÉTRICAS · PEDIDOS · SUSCRIPCIONES  ◀─────────┘
```

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  02 · MODULES                                                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

| ◈ Módulo | Descripción |
|---|---|
| **Landing** | Hero cyber-industrial, efectos glow, scroll-to-top animado, productos reales de la BD |
| **Auth** | Email + contraseña, Google OAuth, 2FA TOTP opcional, aviso *New login detected* por correo |
| **Onboarding** | 3 pasos: Cuenta → Tienda → Lanzamiento (sin verificación previa de correo) |
| **Dashboard** | Ingresos, pedidos, clientes, gráficas 7 días, top compradores, métodos de pago, tráfico real |
| **Storefront** | Catálogo con búsqueda y categorías, reseñas verificadas, wishlist, recomendaciones |
| **Checkout** | Formato factura: resumen a la izquierda, pasos de pago a la derecha |
| **Pagos** | Tarjeta, Apple/Google Pay, PayPal, Klarna, SEPA, Bizum, Revolut y **cripto** |
| **Suscripciones** | Alta, cancelación, upgrade/downgrade y notificaciones automáticas |
| **Planes SaaS** | Core · Signal · Empire con Stripe Embedded Checkout |
| **Admin / Staff** | Roles `admin`, `moderator`, `user` con RLS y consola de moderación |
| **i18n** | 24 idiomas (es, ca, val, gl, eu, en, fr, de, pt, it, nl, pl, ru, uk, tr, sv, ar, hi, id, zh, ja, ko, vi, th) |
| **Temas** | Claro/oscuro persistente, paletas, efectos estacionales (nieve, hojas) y descuentos por festivo/país |
| **Email** | Dominio `notify.cinauth.com` + plantillas de compra, venta y seguridad |

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  03 · STACK                                                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

```text
  FRONTEND   React 19 · TypeScript · Tailwind v4 · Radix UI / shadcn
  FRAMEWORK  TanStack Start v1 (SSR + server functions) · Vite
  BACKEND    Lovable Cloud (Postgres + Auth + Storage + RLS)
  PAGOS      Stripe (one-time · subscriptions · webhooks)
  CORREO     notify.cinauth.com
```

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  04 · BOOT SEQUENCE                                                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

```sh
bun install        # dependencias
bun run dev        # http://localhost:8080
bun run build      # build de producción
bun run lint       # ESLint
bun run format     # Prettier
```

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  05 · ROUTE MAP                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

| Ruta | Descripción |
|---|---|
| `/` | Landing pública |
| `/changelog` | Registro público de cambios |
| `/auth` · `/mfa` | Login / registro y verificación en dos pasos |
| `/loading` | Pantalla de carga inteligente tras el login |
| `/onboarding` | Asistente de creación de tienda |
| `/dashboard` | Panel del vendedor |
| `/panel/*` | Catálogo, ventas, audiencia, marketing, wallets, storefront, ajustes |
| `/panel/storefront/subscription-plan` | Planes Core / Signal / Empire |
| `/admin` | Consola de staff (admin · moderator) |
| `/:storeSlug` · `/:storeSlug/:productSlug` | Tienda pública y ficha de producto |
| `/cart` · `/checkout` | Carrito y checkout tipo factura |
| `/orders` · `/orders/:orderNumber` | Pedidos del comprador |
| `/account` | Área de cliente: compras y suscripciones |

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  06 · TEST ACCESS                                                    ║
╚══════════════════════════════════════════════════════════════════════╝
```

```text
  STORE     /demo-cinaauth
  SELLER    demo.vendedor@cinaauth.app  ::  CinaAuth!Demo2026
  ORDER     DFEA5D0F5B
```

---

```text
╔══════════════════════════════════════════════════════════════════════╗
║  07 · DOCS & DEPLOY                                                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

- Cambios de la plataforma → [`CHANGELOG.md`](CHANGELOG.md) (visible también en `/changelog`).
- Estado y siguientes fases → [`roadmap.md`](roadmap.md).
- Despliegue en cualquier hosting compatible con Vite + TanStack Start (Vercel, Netlify,
  Cloudflare Pages o servidor propio).

<div align="center">

```text
─────────────  cinaAuth · powered by Lovable · © 2026  ─────────────
```

</div>
