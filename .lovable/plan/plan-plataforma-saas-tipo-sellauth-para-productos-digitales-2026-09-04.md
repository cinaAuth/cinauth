# Plan: Plataforma SaaS tipo SellAuth para productos digitales

## Objetivo
Construir un MVP funcional de una plataforma de e-commerce digital al estilo SellAuth: vendedores se registran, crean una tienda personalizable, suben productos digitales, y compradores pueden visitar la tienda, pagar y recibir la entrega digital automáticamente.

## Tecnología
- **Frontend/SSR:** TanStack Start + React 19 + Tailwind CSS v4 + shadcn/ui.
- **Backend:** Lovable Cloud (PostgreSQL, auth, storage).
- **Pagos:** Stripe (Lovable Payments), con full compliance handling para productos digitales.
- **Instalación:** PWA manifest-only para añadir a pantalla de inicio sin complejidad de offline.

## Fases

### 1. Diseño y marca
- Tema oscuro tipo SellAuth (fondo #0B0F19, tarjetas #111827, acento cálido o violeta).
- Tipografía moderna sans-serif.
- Logo/identidad provisional basado en el nombre que elija el usuario.

### 2. Backend y autenticación
- Tablas: `profiles`, `stores`, `products`, `orders`, `order_items`, `payouts`.
- Auth por email/password + Google OAuth.
- RLS para que cada vendedor solo vea sus datos.
- Almacenamiento para archivos digitales (entregables).

### 3. Landing page
- Hero explicando la propuesta.
- Características: tienda propia, checkout, entrega instantánea, panel de ventas.
- CTA a registro de vendedor.

### 4. Onboarding y dashboard de vendedor
- Flujo de creación de tienda (nombre, slug, descripción, logo).
- Dashboard con métricas: ventas, ingresos, pedidos recientes.
- Navegación: Tienda, Productos, Pedidos, Ajustes.

### 5. Gestión de productos
- CRUD de productos digitales: nombre, descripción, precio, archivo entregable, imágenes.
- Tipos: descarga directa, claves/seriales, redirección.
- Publicar/ocultar producto.

### 6. Tienda pública del vendedor
- Ruta tipo `/:storeSlug`.
- Listado de productos con tarjetas estilo SellAuth.
- Página de producto con botón de compra.

### 7. Checkout y pagos
- Integración con Stripe Checkout.
- Webhook para confirmar pago y crear pedido.
- Entrega digital automática tras pago exitoso.

### 8. Pedidos y entrega
- Panel de pedidos para vendedores.
- Página de éxito de compra para compradores con descarga.
- Historial de compras para compradores registrados.

### 9. PWA / app instalable
- `manifest.webmanifest` con iconos.
- Meta tags para iOS y Android.
- Sin service worker de offline (manifest-only).

## Próximo paso inmediato
Definir nombre de marca, paleta de colores y empezar con el diseño del tema oscuro + landing page.
