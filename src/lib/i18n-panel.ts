/**
 * Dashboard ("console") sub-section labels per language.
 * Keys are the last path segment of the sidebar item URL.
 * Missing languages / keys fall back to the English label.
 */
export const PANEL_EN: Record<string, string> = {
  products: "Products",
  addons: "Addons",
  groups: "Groups",
  categories: "Categories",
  "shipping-zones": "Shipping Zones",
  invoices: "Invoices",
  subscriptions: "Subscriptions",
  "abandoned-checkouts": "Abandoned Checkouts",
  customers: "Customers",
  resellers: "Resellers",
  affiliates: "Affiliates",
  feedbacks: "Feedbacks",
  tickets: "Tickets",
  coupons: "Coupons",
  "quantity-deals": "Quantity Deals",
  "bundle-offers": "Bundle Offers",
  email: "Email Marketing",
  blog: "Blog",
  crypto: "Crypto",
  configure: "Configure",
  themes: "Themes",
  "visual-editor": "Visual Editor",
  "code-editor": "Code Editor",
  "custom-pages": "Custom Pages",
  checkout: "Checkout",
  "email-settings": "Email Settings",
  images: "Images",
  files: "Files",
  "push-notifications": "Push Notifications",
  "subscription-plan": "Subscription Plan",
  "payment-methods": "Payment Methods",
  team: "Team",
  domains: "Domains",
  "activity-logs": "Activity Logs",
  blacklist: "Blacklist",
  whitelist: "Whitelist",
  "fraud-logs": "Fraud Logs",
  "api-keys": "API Keys",
  embeds: "Embeds",
  "webhook-logs": "Webhook Logs",
  profile: "Profile",
  invites: "Invites",
  referrals: "Referrals",
  purchases: "My purchases",
};

type PanelDict = Partial<Record<keyof typeof PANEL_EN, string>>;

const es: PanelDict = {
  products: "Productos", addons: "Complementos", groups: "Grupos", categories: "Categorías", "shipping-zones": "Zonas de envío",
  invoices: "Facturas", subscriptions: "Suscripciones", "abandoned-checkouts": "Carritos abandonados",
  customers: "Clientes", resellers: "Revendedores", affiliates: "Afiliados", feedbacks: "Opiniones", tickets: "Tickets",
  coupons: "Cupones", "quantity-deals": "Descuentos por cantidad", "bundle-offers": "Packs", email: "Email marketing", blog: "Blog",
  crypto: "Cripto", configure: "Configurar", themes: "Temas", "visual-editor": "Editor visual", "code-editor": "Editor de código",
  "custom-pages": "Páginas propias", checkout: "Pago", "email-settings": "Ajustes de correo", images: "Imágenes", files: "Archivos",
  "push-notifications": "Notificaciones push", "subscription-plan": "Plan de suscripción",
  "payment-methods": "Métodos de pago", team: "Equipo", domains: "Dominios", "activity-logs": "Registro de actividad",
  blacklist: "Lista negra", whitelist: "Lista blanca", "fraud-logs": "Registro de fraude",
  "api-keys": "Claves API", embeds: "Integraciones", "webhook-logs": "Registro de webhooks",
  profile: "Perfil", invites: "Invitaciones", referrals: "Referidos", purchases: "Mis compras",
};

const ca: PanelDict = {
  products: "Productes", addons: "Complements", groups: "Grups", categories: "Categories", "shipping-zones": "Zones d'enviament",
  invoices: "Factures", subscriptions: "Subscripcions", "abandoned-checkouts": "Cistelles abandonades",
  customers: "Clients", resellers: "Revenedors", affiliates: "Afiliats", feedbacks: "Opinions", tickets: "Tiquets",
  coupons: "Cupons", "quantity-deals": "Descomptes per quantitat", "bundle-offers": "Packs", email: "Email màrqueting", blog: "Blog",
  crypto: "Cripto", configure: "Configurar", themes: "Temes", "visual-editor": "Editor visual", "code-editor": "Editor de codi",
  "custom-pages": "Pàgines pròpies", checkout: "Pagament", "email-settings": "Configuració de correu", images: "Imatges", files: "Fitxers",
  "push-notifications": "Notificacions push", "subscription-plan": "Pla de subscripció",
  "payment-methods": "Mètodes de pagament", team: "Equip", domains: "Dominis", "activity-logs": "Registre d'activitat",
  blacklist: "Llista negra", whitelist: "Llista blanca", "fraud-logs": "Registre de frau",
  "api-keys": "Claus API", embeds: "Integracions", "webhook-logs": "Registre de webhooks",
  profile: "Perfil", invites: "Invitacions", referrals: "Referits", purchases: "Les meves compres",
};

const val: PanelDict = { ...ca, purchases: "Les meues compres", feedbacks: "Opinions" };

const gl: PanelDict = {
  products: "Produtos", addons: "Complementos", groups: "Grupos", categories: "Categorías", "shipping-zones": "Zonas de envío",
  invoices: "Facturas", subscriptions: "Subscricións", "abandoned-checkouts": "Carros abandonados",
  customers: "Clientes", resellers: "Revendedores", affiliates: "Afiliados", feedbacks: "Opinións", tickets: "Tickets",
  coupons: "Cupóns", "quantity-deals": "Descontos por cantidade", "bundle-offers": "Packs", email: "Email marketing", blog: "Blog",
  crypto: "Cripto", configure: "Configurar", themes: "Temas", "visual-editor": "Editor visual", "code-editor": "Editor de código",
  "custom-pages": "Páxinas propias", checkout: "Pagamento", "email-settings": "Axustes de correo", images: "Imaxes", files: "Ficheiros",
  "push-notifications": "Notificacións push", "subscription-plan": "Plan de subscrición",
  "payment-methods": "Métodos de pagamento", team: "Equipo", domains: "Dominios", "activity-logs": "Rexistro de actividade",
  blacklist: "Lista negra", whitelist: "Lista branca", "fraud-logs": "Rexistro de fraude",
  "api-keys": "Chaves API", embeds: "Integracións", "webhook-logs": "Rexistro de webhooks",
  profile: "Perfil", invites: "Convites", referrals: "Referidos", purchases: "As miñas compras",
};

const eu: PanelDict = {
  products: "Produktuak", addons: "Gehigarriak", groups: "Taldeak", categories: "Kategoriak", "shipping-zones": "Bidalketa eremuak",
  invoices: "Fakturak", subscriptions: "Harpidetzak", "abandoned-checkouts": "Utzitako erosketak",
  customers: "Bezeroak", resellers: "Birsaltzaileak", affiliates: "Afiliatuak", feedbacks: "Iritziak", tickets: "Tiketak",
  coupons: "Kupoiak", "quantity-deals": "Kopuru beherapenak", "bundle-offers": "Pack eskaintzak", email: "Email marketina", blog: "Bloga",
  crypto: "Kripto", configure: "Konfiguratu", themes: "Gaiak", "visual-editor": "Editore bisuala", "code-editor": "Kode editorea",
  "custom-pages": "Orri pertsonalak", checkout: "Ordainketa", "email-settings": "Posta ezarpenak", images: "Irudiak", files: "Fitxategiak",
  "push-notifications": "Push jakinarazpenak", "subscription-plan": "Harpidetza plana",
  "payment-methods": "Ordainketa metodoak", team: "Taldea", domains: "Domeinuak", "activity-logs": "Jarduera erregistroa",
  blacklist: "Zerrenda beltza", whitelist: "Zerrenda zuria", "fraud-logs": "Iruzur erregistroa",
  "api-keys": "API gakoak", embeds: "Txertaketak", "webhook-logs": "Webhook erregistroa",
  profile: "Profila", invites: "Gonbidapenak", referrals: "Gomendioak", purchases: "Nire erosketak",
};

const fr: PanelDict = {
  products: "Produits", addons: "Options", groups: "Groupes", categories: "Catégories", "shipping-zones": "Zones de livraison",
  invoices: "Factures", subscriptions: "Abonnements", "abandoned-checkouts": "Paniers abandonnés",
  customers: "Clients", resellers: "Revendeurs", affiliates: "Affiliés", feedbacks: "Avis", tickets: "Tickets",
  coupons: "Coupons", "quantity-deals": "Remises par quantité", "bundle-offers": "Offres groupées", email: "Email marketing", blog: "Blog",
  crypto: "Crypto", configure: "Configurer", themes: "Thèmes", "visual-editor": "Éditeur visuel", "code-editor": "Éditeur de code",
  "custom-pages": "Pages personnalisées", checkout: "Paiement", "email-settings": "Paramètres e-mail", images: "Images", files: "Fichiers",
  "push-notifications": "Notifications push", "subscription-plan": "Formule d'abonnement",
  "payment-methods": "Moyens de paiement", team: "Équipe", domains: "Domaines", "activity-logs": "Journal d'activité",
  blacklist: "Liste noire", whitelist: "Liste blanche", "fraud-logs": "Journal des fraudes",
  "api-keys": "Clés API", embeds: "Intégrations", "webhook-logs": "Journal des webhooks",
  profile: "Profil", invites: "Invitations", referrals: "Parrainages", purchases: "Mes achats",
};

const it: PanelDict = {
  products: "Prodotti", addons: "Estensioni", groups: "Gruppi", categories: "Categorie", "shipping-zones": "Zone di spedizione",
  invoices: "Fatture", subscriptions: "Abbonamenti", "abandoned-checkouts": "Carrelli abbandonati",
  customers: "Clienti", resellers: "Rivenditori", affiliates: "Affiliati", feedbacks: "Recensioni", tickets: "Ticket",
  coupons: "Coupon", "quantity-deals": "Sconti quantità", "bundle-offers": "Offerte bundle", email: "Email marketing", blog: "Blog",
  crypto: "Cripto", configure: "Configura", themes: "Temi", "visual-editor": "Editor visuale", "code-editor": "Editor di codice",
  "custom-pages": "Pagine personalizzate", checkout: "Pagamento", "email-settings": "Impostazioni email", images: "Immagini", files: "File",
  "push-notifications": "Notifiche push", "subscription-plan": "Piano di abbonamento",
  "payment-methods": "Metodi di pagamento", team: "Team", domains: "Domini", "activity-logs": "Registro attività",
  blacklist: "Lista nera", whitelist: "Lista bianca", "fraud-logs": "Registro frodi",
  "api-keys": "Chiavi API", embeds: "Integrazioni", "webhook-logs": "Registro webhook",
  profile: "Profilo", invites: "Inviti", referrals: "Referral", purchases: "I miei acquisti",
};

const pt: PanelDict = {
  products: "Produtos", addons: "Extras", groups: "Grupos", categories: "Categorias", "shipping-zones": "Zonas de envio",
  invoices: "Faturas", subscriptions: "Subscrições", "abandoned-checkouts": "Carrinhos abandonados",
  customers: "Clientes", resellers: "Revendedores", affiliates: "Afiliados", feedbacks: "Opiniões", tickets: "Tickets",
  coupons: "Cupões", "quantity-deals": "Descontos por quantidade", "bundle-offers": "Pacotes", email: "Email marketing", blog: "Blog",
  crypto: "Cripto", configure: "Configurar", themes: "Temas", "visual-editor": "Editor visual", "code-editor": "Editor de código",
  "custom-pages": "Páginas personalizadas", checkout: "Pagamento", "email-settings": "Definições de email", images: "Imagens", files: "Ficheiros",
  "push-notifications": "Notificações push", "subscription-plan": "Plano de subscrição",
  "payment-methods": "Métodos de pagamento", team: "Equipa", domains: "Domínios", "activity-logs": "Registo de atividade",
  blacklist: "Lista negra", whitelist: "Lista branca", "fraud-logs": "Registo de fraude",
  "api-keys": "Chaves API", embeds: "Integrações", "webhook-logs": "Registo de webhooks",
  profile: "Perfil", invites: "Convites", referrals: "Referências", purchases: "As minhas compras",
};

const de: PanelDict = {
  products: "Produkte", addons: "Add-ons", groups: "Gruppen", categories: "Kategorien", "shipping-zones": "Versandzonen",
  invoices: "Rechnungen", subscriptions: "Abos", "abandoned-checkouts": "Abgebrochene Käufe",
  customers: "Kunden", resellers: "Reseller", affiliates: "Affiliates", feedbacks: "Bewertungen", tickets: "Tickets",
  coupons: "Gutscheine", "quantity-deals": "Mengenrabatte", "bundle-offers": "Bundle-Angebote", email: "E-Mail-Marketing", blog: "Blog",
  crypto: "Krypto", configure: "Einrichten", themes: "Designs", "visual-editor": "Visueller Editor", "code-editor": "Code-Editor",
  "custom-pages": "Eigene Seiten", checkout: "Kasse", "email-settings": "E-Mail-Einstellungen", images: "Bilder", files: "Dateien",
  "push-notifications": "Push-Benachrichtigungen", "subscription-plan": "Abo-Plan",
  "payment-methods": "Zahlungsarten", team: "Team", domains: "Domains", "activity-logs": "Aktivitätsprotokoll",
  blacklist: "Sperrliste", whitelist: "Freigabeliste", "fraud-logs": "Betrugsprotokoll",
  "api-keys": "API-Schlüssel", embeds: "Einbettungen", "webhook-logs": "Webhook-Protokoll",
  profile: "Profil", invites: "Einladungen", referrals: "Empfehlungen", purchases: "Meine Käufe",
};

const nl: PanelDict = {
  products: "Producten", addons: "Add-ons", groups: "Groepen", categories: "Categorieën", "shipping-zones": "Verzendzones",
  invoices: "Facturen", subscriptions: "Abonnementen", "abandoned-checkouts": "Verlaten winkelwagens",
  customers: "Klanten", resellers: "Resellers", affiliates: "Affiliates", feedbacks: "Beoordelingen", tickets: "Tickets",
  coupons: "Kortingsbonnen", "quantity-deals": "Staffelkortingen", "bundle-offers": "Bundelaanbiedingen", email: "E-mailmarketing", blog: "Blog",
  crypto: "Crypto", configure: "Instellen", themes: "Thema's", "visual-editor": "Visuele editor", "code-editor": "Code-editor",
  "custom-pages": "Eigen pagina's", checkout: "Afrekenen", "email-settings": "E-mailinstellingen", images: "Afbeeldingen", files: "Bestanden",
  "push-notifications": "Pushmeldingen", "subscription-plan": "Abonnement",
  "payment-methods": "Betaalmethoden", team: "Team", domains: "Domeinen", "activity-logs": "Activiteitenlog",
  blacklist: "Zwarte lijst", whitelist: "Witte lijst", "fraud-logs": "Fraudelog",
  "api-keys": "API-sleutels", embeds: "Insluitingen", "webhook-logs": "Webhooklog",
  profile: "Profiel", invites: "Uitnodigingen", referrals: "Verwijzingen", purchases: "Mijn aankopen",
};

const sv: PanelDict = {
  products: "Produkter", addons: "Tillägg", groups: "Grupper", categories: "Kategorier", "shipping-zones": "Fraktzoner",
  invoices: "Fakturor", subscriptions: "Prenumerationer", "abandoned-checkouts": "Övergivna kassor",
  customers: "Kunder", resellers: "Återförsäljare", affiliates: "Affiliates", feedbacks: "Omdömen", tickets: "Ärenden",
  coupons: "Rabattkoder", "quantity-deals": "Mängdrabatter", "bundle-offers": "Paketerbjudanden", email: "E-postmarknadsföring", blog: "Blogg",
  crypto: "Krypto", configure: "Konfigurera", themes: "Teman", "visual-editor": "Visuell redigerare", "code-editor": "Kodredigerare",
  "custom-pages": "Egna sidor", checkout: "Kassa", "email-settings": "E-postinställningar", images: "Bilder", files: "Filer",
  "push-notifications": "Pushnotiser", "subscription-plan": "Prenumerationsplan",
  "payment-methods": "Betalsätt", team: "Team", domains: "Domäner", "activity-logs": "Aktivitetslogg",
  blacklist: "Svartlista", whitelist: "Vitlista", "fraud-logs": "Bedrägerilogg",
  "api-keys": "API-nycklar", embeds: "Inbäddningar", "webhook-logs": "Webhook-logg",
  profile: "Profil", invites: "Inbjudningar", referrals: "Hänvisningar", purchases: "Mina köp",
};

const pl: PanelDict = {
  products: "Produkty", addons: "Dodatki", groups: "Grupy", categories: "Kategorie", "shipping-zones": "Strefy wysyłki",
  invoices: "Faktury", subscriptions: "Subskrypcje", "abandoned-checkouts": "Porzucone koszyki",
  customers: "Klienci", resellers: "Resellerzy", affiliates: "Partnerzy", feedbacks: "Opinie", tickets: "Zgłoszenia",
  coupons: "Kupony", "quantity-deals": "Rabaty ilościowe", "bundle-offers": "Pakiety", email: "E-mail marketing", blog: "Blog",
  crypto: "Krypto", configure: "Konfiguruj", themes: "Motywy", "visual-editor": "Edytor wizualny", "code-editor": "Edytor kodu",
  "custom-pages": "Własne strony", checkout: "Płatność", "email-settings": "Ustawienia e-mail", images: "Obrazy", files: "Pliki",
  "push-notifications": "Powiadomienia push", "subscription-plan": "Plan subskrypcji",
  "payment-methods": "Metody płatności", team: "Zespół", domains: "Domeny", "activity-logs": "Dziennik aktywności",
  blacklist: "Czarna lista", whitelist: "Biała lista", "fraud-logs": "Dziennik oszustw",
  "api-keys": "Klucze API", embeds: "Osadzenia", "webhook-logs": "Dziennik webhooków",
  profile: "Profil", invites: "Zaproszenia", referrals: "Polecenia", purchases: "Moje zakupy",
};

const ru: PanelDict = {
  products: "Товары", addons: "Дополнения", groups: "Группы", categories: "Категории", "shipping-zones": "Зоны доставки",
  invoices: "Счета", subscriptions: "Подписки", "abandoned-checkouts": "Брошенные корзины",
  customers: "Клиенты", resellers: "Реселлеры", affiliates: "Партнёры", feedbacks: "Отзывы", tickets: "Обращения",
  coupons: "Купоны", "quantity-deals": "Скидки за объём", "bundle-offers": "Наборы", email: "Email-маркетинг", blog: "Блог",
  crypto: "Крипто", configure: "Настроить", themes: "Темы", "visual-editor": "Визуальный редактор", "code-editor": "Редактор кода",
  "custom-pages": "Свои страницы", checkout: "Оплата", "email-settings": "Настройки почты", images: "Изображения", files: "Файлы",
  "push-notifications": "Push-уведомления", "subscription-plan": "Тариф подписки",
  "payment-methods": "Способы оплаты", team: "Команда", domains: "Домены", "activity-logs": "Журнал действий",
  blacklist: "Чёрный список", whitelist: "Белый список", "fraud-logs": "Журнал мошенничества",
  "api-keys": "API-ключи", embeds: "Встраивания", "webhook-logs": "Журнал вебхуков",
  profile: "Профиль", invites: "Приглашения", referrals: "Рефералы", purchases: "Мои покупки",
};

const uk: PanelDict = {
  products: "Товари", addons: "Доповнення", groups: "Групи", categories: "Категорії", "shipping-zones": "Зони доставки",
  invoices: "Рахунки", subscriptions: "Підписки", "abandoned-checkouts": "Покинуті кошики",
  customers: "Клієнти", resellers: "Реселери", affiliates: "Партнери", feedbacks: "Відгуки", tickets: "Звернення",
  coupons: "Купони", "quantity-deals": "Знижки за кількість", "bundle-offers": "Набори", email: "Email-маркетинг", blog: "Блог",
  crypto: "Крипто", configure: "Налаштувати", themes: "Теми", "visual-editor": "Візуальний редактор", "code-editor": "Редактор коду",
  "custom-pages": "Власні сторінки", checkout: "Оплата", "email-settings": "Налаштування пошти", images: "Зображення", files: "Файли",
  "push-notifications": "Push-сповіщення", "subscription-plan": "Тариф підписки",
  "payment-methods": "Способи оплати", team: "Команда", domains: "Домени", "activity-logs": "Журнал дій",
  blacklist: "Чорний список", whitelist: "Білий список", "fraud-logs": "Журнал шахрайства",
  "api-keys": "API-ключі", embeds: "Вбудовування", "webhook-logs": "Журнал вебхуків",
  profile: "Профіль", invites: "Запрошення", referrals: "Реферали", purchases: "Мої покупки",
};

const tr: PanelDict = {
  products: "Ürünler", addons: "Eklentiler", groups: "Gruplar", categories: "Kategoriler", "shipping-zones": "Gönderim bölgeleri",
  invoices: "Faturalar", subscriptions: "Abonelikler", "abandoned-checkouts": "Terk edilen sepetler",
  customers: "Müşteriler", resellers: "Bayiler", affiliates: "Ortaklar", feedbacks: "Geri bildirimler", tickets: "Destek talepleri",
  coupons: "Kuponlar", "quantity-deals": "Miktar indirimleri", "bundle-offers": "Paket teklifleri", email: "E-posta pazarlama", blog: "Blog",
  crypto: "Kripto", configure: "Yapılandır", themes: "Temalar", "visual-editor": "Görsel düzenleyici", "code-editor": "Kod düzenleyici",
  "custom-pages": "Özel sayfalar", checkout: "Ödeme", "email-settings": "E-posta ayarları", images: "Görseller", files: "Dosyalar",
  "push-notifications": "Push bildirimleri", "subscription-plan": "Abonelik planı",
  "payment-methods": "Ödeme yöntemleri", team: "Ekip", domains: "Alan adları", "activity-logs": "Etkinlik kayıtları",
  blacklist: "Kara liste", whitelist: "Beyaz liste", "fraud-logs": "Dolandırıcılık kayıtları",
  "api-keys": "API anahtarları", embeds: "Gömme kodları", "webhook-logs": "Webhook kayıtları",
  profile: "Profil", invites: "Davetler", referrals: "Referanslar", purchases: "Satın aldıklarım",
};

const ar: PanelDict = {
  products: "المنتجات", addons: "الإضافات", groups: "المجموعات", categories: "الفئات", "shipping-zones": "مناطق الشحن",
  invoices: "الفواتير", subscriptions: "الاشتراكات", "abandoned-checkouts": "السلات المتروكة",
  customers: "العملاء", resellers: "الموزعون", affiliates: "المسوّقون", feedbacks: "التقييمات", tickets: "التذاكر",
  coupons: "الكوبونات", "quantity-deals": "خصومات الكمية", "bundle-offers": "العروض المجمعة", email: "التسويق بالبريد", blog: "المدونة",
  crypto: "العملات الرقمية", configure: "الإعداد", themes: "السمات", "visual-editor": "المحرر المرئي", "code-editor": "محرر الشيفرة",
  "custom-pages": "صفحات مخصصة", checkout: "الدفع", "email-settings": "إعدادات البريد", images: "الصور", files: "الملفات",
  "push-notifications": "الإشعارات", "subscription-plan": "خطة الاشتراك",
  "payment-methods": "طرق الدفع", team: "الفريق", domains: "النطاقات", "activity-logs": "سجل النشاط",
  blacklist: "القائمة السوداء", whitelist: "القائمة البيضاء", "fraud-logs": "سجل الاحتيال",
  "api-keys": "مفاتيح API", embeds: "التضمينات", "webhook-logs": "سجل الويب هوك",
  profile: "الملف الشخصي", invites: "الدعوات", referrals: "الإحالات", purchases: "مشترياتي",
};

const hi: PanelDict = {
  products: "उत्पाद", addons: "ऐड-ऑन", groups: "समूह", categories: "श्रेणियाँ", "shipping-zones": "शिपिंग ज़ोन",
  invoices: "चालान", subscriptions: "सदस्यताएँ", "abandoned-checkouts": "छोड़े गए चेकआउट",
  customers: "ग्राहक", resellers: "रीसेलर", affiliates: "एफिलिएट", feedbacks: "प्रतिक्रिया", tickets: "टिकट",
  coupons: "कूपन", "quantity-deals": "मात्रा छूट", "bundle-offers": "बंडल ऑफ़र", email: "ईमेल मार्केटिंग", blog: "ब्लॉग",
  crypto: "क्रिप्टो", configure: "कॉन्फ़िगर", themes: "थीम", "visual-editor": "विज़ुअल एडिटर", "code-editor": "कोड एडिटर",
  "custom-pages": "कस्टम पेज", checkout: "चेकआउट", "email-settings": "ईमेल सेटिंग", images: "छवियाँ", files: "फ़ाइलें",
  "push-notifications": "पुश सूचनाएँ", "subscription-plan": "सदस्यता योजना",
  "payment-methods": "भुगतान विधियाँ", team: "टीम", domains: "डोमेन", "activity-logs": "गतिविधि लॉग",
  blacklist: "ब्लैकलिस्ट", whitelist: "व्हाइटलिस्ट", "fraud-logs": "धोखाधड़ी लॉग",
  "api-keys": "API कुंजियाँ", embeds: "एम्बेड", "webhook-logs": "वेबहुक लॉग",
  profile: "प्रोफ़ाइल", invites: "आमंत्रण", referrals: "रेफ़रल", purchases: "मेरी खरीद",
};

const id: PanelDict = {
  products: "Produk", addons: "Add-on", groups: "Grup", categories: "Kategori", "shipping-zones": "Zona pengiriman",
  invoices: "Faktur", subscriptions: "Langganan", "abandoned-checkouts": "Keranjang ditinggalkan",
  customers: "Pelanggan", resellers: "Reseller", affiliates: "Afiliasi", feedbacks: "Ulasan", tickets: "Tiket",
  coupons: "Kupon", "quantity-deals": "Diskon jumlah", "bundle-offers": "Penawaran bundel", email: "Email marketing", blog: "Blog",
  crypto: "Kripto", configure: "Konfigurasi", themes: "Tema", "visual-editor": "Editor visual", "code-editor": "Editor kode",
  "custom-pages": "Halaman khusus", checkout: "Pembayaran", "email-settings": "Pengaturan email", images: "Gambar", files: "Berkas",
  "push-notifications": "Notifikasi push", "subscription-plan": "Paket langganan",
  "payment-methods": "Metode pembayaran", team: "Tim", domains: "Domain", "activity-logs": "Log aktivitas",
  blacklist: "Daftar hitam", whitelist: "Daftar putih", "fraud-logs": "Log penipuan",
  "api-keys": "Kunci API", embeds: "Sematan", "webhook-logs": "Log webhook",
  profile: "Profil", invites: "Undangan", referrals: "Referal", purchases: "Pembelian saya",
};

const zh: PanelDict = {
  products: "商品", addons: "附加项", groups: "分组", categories: "分类", "shipping-zones": "配送区域",
  invoices: "发票", subscriptions: "订阅", "abandoned-checkouts": "弃单",
  customers: "客户", resellers: "分销商", affiliates: "推广伙伴", feedbacks: "评价", tickets: "工单",
  coupons: "优惠券", "quantity-deals": "数量折扣", "bundle-offers": "套餐优惠", email: "邮件营销", blog: "博客",
  crypto: "加密货币", configure: "配置", themes: "主题", "visual-editor": "可视化编辑器", "code-editor": "代码编辑器",
  "custom-pages": "自定义页面", checkout: "结账", "email-settings": "邮件设置", images: "图片", files: "文件",
  "push-notifications": "推送通知", "subscription-plan": "订阅套餐",
  "payment-methods": "支付方式", team: "团队", domains: "域名", "activity-logs": "操作日志",
  blacklist: "黑名单", whitelist: "白名单", "fraud-logs": "欺诈日志",
  "api-keys": "API 密钥", embeds: "嵌入代码", "webhook-logs": "Webhook 日志",
  profile: "个人资料", invites: "邀请", referrals: "推荐", purchases: "我的购买",
};

const ja: PanelDict = {
  products: "商品", addons: "アドオン", groups: "グループ", categories: "カテゴリ", "shipping-zones": "配送地域",
  invoices: "請求書", subscriptions: "サブスク", "abandoned-checkouts": "カゴ落ち",
  customers: "顧客", resellers: "リセラー", affiliates: "アフィリエイト", feedbacks: "レビュー", tickets: "チケット",
  coupons: "クーポン", "quantity-deals": "数量割引", "bundle-offers": "バンドル", email: "メール配信", blog: "ブログ",
  crypto: "暗号資産", configure: "設定", themes: "テーマ", "visual-editor": "ビジュアルエディタ", "code-editor": "コードエディタ",
  "custom-pages": "カスタムページ", checkout: "チェックアウト", "email-settings": "メール設定", images: "画像", files: "ファイル",
  "push-notifications": "プッシュ通知", "subscription-plan": "サブスクプラン",
  "payment-methods": "支払い方法", team: "チーム", domains: "ドメイン", "activity-logs": "操作ログ",
  blacklist: "ブラックリスト", whitelist: "ホワイトリスト", "fraud-logs": "不正ログ",
  "api-keys": "APIキー", embeds: "埋め込み", "webhook-logs": "Webhookログ",
  profile: "プロフィール", invites: "招待", referrals: "紹介", purchases: "購入履歴",
};

const ko: PanelDict = {
  products: "상품", addons: "애드온", groups: "그룹", categories: "카테고리", "shipping-zones": "배송 지역",
  invoices: "인보이스", subscriptions: "구독", "abandoned-checkouts": "장바구니 이탈",
  customers: "고객", resellers: "리셀러", affiliates: "제휴", feedbacks: "후기", tickets: "티켓",
  coupons: "쿠폰", "quantity-deals": "수량 할인", "bundle-offers": "번들 상품", email: "이메일 마케팅", blog: "블로그",
  crypto: "암호화폐", configure: "설정", themes: "테마", "visual-editor": "비주얼 편집기", "code-editor": "코드 편집기",
  "custom-pages": "사용자 페이지", checkout: "결제", "email-settings": "이메일 설정", images: "이미지", files: "파일",
  "push-notifications": "푸시 알림", "subscription-plan": "구독 플랜",
  "payment-methods": "결제 수단", team: "팀", domains: "도메인", "activity-logs": "활동 기록",
  blacklist: "블랙리스트", whitelist: "화이트리스트", "fraud-logs": "사기 기록",
  "api-keys": "API 키", embeds: "임베드", "webhook-logs": "웹훅 로그",
  profile: "프로필", invites: "초대", referrals: "추천", purchases: "내 구매",
};

const vi: PanelDict = {
  products: "Sản phẩm", addons: "Tiện ích", groups: "Nhóm", categories: "Danh mục", "shipping-zones": "Khu vực giao hàng",
  invoices: "Hoá đơn", subscriptions: "Gói đăng ký", "abandoned-checkouts": "Giỏ hàng bỏ quên",
  customers: "Khách hàng", resellers: "Đại lý", affiliates: "Đối tác", feedbacks: "Đánh giá", tickets: "Yêu cầu hỗ trợ",
  coupons: "Mã giảm giá", "quantity-deals": "Giảm theo số lượng", "bundle-offers": "Combo", email: "Email marketing", blog: "Blog",
  crypto: "Tiền mã hoá", configure: "Cấu hình", themes: "Giao diện", "visual-editor": "Trình sửa trực quan", "code-editor": "Trình sửa mã",
  "custom-pages": "Trang tuỳ chỉnh", checkout: "Thanh toán", "email-settings": "Cài đặt email", images: "Hình ảnh", files: "Tệp",
  "push-notifications": "Thông báo đẩy", "subscription-plan": "Gói thuê bao",
  "payment-methods": "Phương thức thanh toán", team: "Nhóm làm việc", domains: "Tên miền", "activity-logs": "Nhật ký hoạt động",
  blacklist: "Danh sách đen", whitelist: "Danh sách trắng", "fraud-logs": "Nhật ký gian lận",
  "api-keys": "Khoá API", embeds: "Nhúng", "webhook-logs": "Nhật ký webhook",
  profile: "Hồ sơ", invites: "Lời mời", referrals: "Giới thiệu", purchases: "Đơn đã mua",
};

const th: PanelDict = {
  products: "สินค้า", addons: "ส่วนเสริม", groups: "กลุ่ม", categories: "หมวดหมู่", "shipping-zones": "เขตจัดส่ง",
  invoices: "ใบแจ้งหนี้", subscriptions: "การสมัครสมาชิก", "abandoned-checkouts": "ตะกร้าที่ถูกทิ้ง",
  customers: "ลูกค้า", resellers: "ตัวแทนจำหน่าย", affiliates: "พันธมิตร", feedbacks: "รีวิว", tickets: "ตั๋วช่วยเหลือ",
  coupons: "คูปอง", "quantity-deals": "ส่วนลดตามจำนวน", "bundle-offers": "ชุดโปรโมชั่น", email: "อีเมลมาร์เก็ตติ้ง", blog: "บล็อก",
  crypto: "คริปโต", configure: "ตั้งค่า", themes: "ธีม", "visual-editor": "ตัวแก้ไขภาพ", "code-editor": "ตัวแก้ไขโค้ด",
  "custom-pages": "หน้าที่กำหนดเอง", checkout: "ชำระเงิน", "email-settings": "ตั้งค่าอีเมล", images: "รูปภาพ", files: "ไฟล์",
  "push-notifications": "การแจ้งเตือน", "subscription-plan": "แผนสมาชิก",
  "payment-methods": "วิธีชำระเงิน", team: "ทีม", domains: "โดเมน", "activity-logs": "บันทึกกิจกรรม",
  blacklist: "บัญชีดำ", whitelist: "บัญชีขาว", "fraud-logs": "บันทึกการฉ้อโกง",
  "api-keys": "คีย์ API", embeds: "โค้ดฝัง", "webhook-logs": "บันทึกเว็บฮุก",
  profile: "โปรไฟล์", invites: "คำเชิญ", referrals: "แนะนำเพื่อน", purchases: "การซื้อของฉัน",
};

export const PANEL: Record<string, PanelDict> = {
  es, ca, val, gl, eu, fr, it, pt, de, nl, sv, pl, ru, uk, tr, ar, hi, id, zh, ja, ko, vi, th,
};

/** Translate a sidebar/panel section slug for a language. */
export function panelLabel(lang: string, slug: string, fallback: string): string {
  return PANEL[lang]?.[slug] ?? PANEL_EN[slug] ?? fallback;
}
