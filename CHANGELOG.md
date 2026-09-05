# Changelog

Todos los cambios importantes de cinaAuth se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [2026-09-05]

### Añadido
- Botón flotante "volver arriba" con animación, disponible en toda la web.
- Efectos visuales en landing, tienda y panel: brillo neón en bordes, elevación de tarjetas al pasar el ratón, aparición al hacer scroll y efecto glitch cyber.
- Landing rediseñada con estilo asimétrico industrial: titular "UNLEASH DIGITAL EMPIRE" y maqueta del panel conectada a datos reales (ingresos, pedidos, clientes y gráfica de 7 días).
- Logo nuevo de cinaAuth (rayo naranja + wordmark blanco/naranja) sin fondo, aplicado al panel y al favicon.
- Página pública de changelog en `/changelog`.

### Cambiado
- Toda la web unificada al tema cyber: fondo casi negro, acento naranja, Orbitron en titulares y JetBrains Mono en el cuerpo.
- El panel muestra el nombre del dueño de la tienda en la tarjeta de perfil.
- La landing ya no lista productos; muestra un adelanto del dashboard.

### Corregido
- Slugs de tienda duplicados: se genera una variante libre automáticamente.
- Error `notifications.is_read` inexistente.
- Palabra con contorno naranja del hero que no se renderizaba.

## [2026-09-04]

### Añadido
- Marketplace público: búsqueda, categorías, reviews con estrellas de compradores verificados, wishlist y recomendaciones.
- Carrito persistente, checkout con Stripe (pagos únicos y suscripciones) y seguimiento de pedidos.
- Suscripciones con lógica de negocio: alta, cancelación, upgrade/downgrade y avisos.
- Panel de vendedor completo: Dashboard, Catalog, Sales, Audience, Marketing, Wallets, Storefront, Settings, Anti-Fraud, Developers y Account.
- Onboarding en 3 pasos: Account, Shop y Launch.
- Autenticación con email/contraseña, Google OAuth y 2FA opcional (TOTP).
- Sistema de roles (admin, moderator, user) con consola de staff en `/admin`.
- Analítica de tráfico real: visitas, sesiones, fuentes, dispositivos, países y campañas.
- Subdominios de tienda `*.cinaauth.com`.
