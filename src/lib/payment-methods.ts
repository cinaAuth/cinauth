export type PaymentMethodDef = {
  key: string;
  name: string;
  description: string;
  category: "card" | "platform" | "wallet" | "crypto" | "other";
  initials: string;
  color: string;
  slug?: string;
};

export const PAYMENT_METHOD_CATEGORIES: { id: PaymentMethodDef["category"]; label: string }[] = [
  { id: "card", label: "Card processors" },
  { id: "platform", label: "Platforms" },
  { id: "wallet", label: "Wallets & transfers" },
  { id: "crypto", label: "Cryptocurrency" },
  { id: "other", label: "Other" },
];

export const PAYMENT_METHODS: PaymentMethodDef[] = [
  // Card processors
  { key: "stripe", name: "Stripe", description: "Credit & debit cards, Apple Pay, Google Pay.", category: "card", initials: "S", color: "#635BFF" , slug: "stripe" },
  { key: "sumup", name: "SumUp", description: "Credit & debit cards, Apple Pay.", category: "card", initials: "SU", color: "#1B1B1B" , slug: "sumup" },
  { key: "mollie", name: "Mollie", description: "Cards, iDEAL, Bancontact and more.", category: "card", initials: "MO", color: "#000000" , slug: "mollie" },
  { key: "adyen", name: "Adyen", description: "Cards, Apple Pay, local methods.", category: "card", initials: "AD", color: "#0ABF53" , slug: "adyen" },
  { key: "revolut", name: "Revolut Business", description: "Cards, Apple Pay, Revolut Pay.", category: "card", initials: "R", color: "#191C1F" , slug: "revolut" },
  { key: "monei", name: "MONEI", description: "Cards and Bizum for Spain.", category: "card", initials: "M", color: "#12C2AE" },
  { key: "mercadopago", name: "Mercado Pago", description: "Cards and local methods in LATAM.", category: "card", initials: "MP", color: "#00B1EA" , slug: "mercadopago" },
  { key: "razorpay", name: "Razorpay - UPI", description: "UPI, cards and netbanking in India.", category: "card", initials: "RP", color: "#0C2451" , slug: "razorpay" },

  // Platforms
  { key: "lemonsqueezy", name: "Lemon Squeezy", description: "Cards, Apple Pay, merchant of record.", category: "platform", initials: "LS", color: "#7047EB" , slug: "lemonsqueezy" },
  { key: "paddle", name: "Paddle", description: "Cards and local methods, taxes included.", category: "platform", initials: "PD", color: "#FDDD35" , slug: "paddle" },
  { key: "whop", name: "Whop", description: "Cards, Apple Pay, digital storefront.", category: "platform", initials: "W", color: "#FF541F" },

  // Wallets & transfers
  { key: "paypal", name: "PayPal", description: "Cards and PayPal balance.", category: "wallet", initials: "PP", color: "#003087" , slug: "paypal" },
  { key: "apple_pay", name: "Apple Pay", description: "One tap on Safari and iOS.", category: "wallet", initials: "AP", color: "#111111" , slug: "applepay" },
  { key: "google_pay", name: "Google Pay", description: "One tap on Chrome and Android.", category: "wallet", initials: "GP", color: "#4285F4" , slug: "googlepay" },
  { key: "amazon_pay", name: "Amazon Pay", description: "Pay with an Amazon account.", category: "wallet", initials: "AZ", color: "#FF9900" , slug: "amazonpay" },
  { key: "cashapp", name: "Cash App", description: "Accept Cash App Pay.", category: "wallet", initials: "$", color: "#00D54B" , slug: "cashapp" },
  { key: "bizum", name: "Bizum", description: "Instant mobile payments in Spain.", category: "wallet", initials: "BZ", color: "#00B3C8" },
  { key: "sepa", name: "SEPA transfer", description: "Bank transfers across the Eurozone.", category: "wallet", initials: "SE", color: "#1E3A8A" },
  { key: "klarna", name: "Klarna", description: "Buy now, pay later.", category: "wallet", initials: "K", color: "#FFB3C7" , slug: "klarna" },
  { key: "ideal", name: "iDEAL", description: "Bank payments in the Netherlands.", category: "wallet", initials: "iD", color: "#CC0066" , slug: "ideal" },
  { key: "bancontact", name: "Bancontact", description: "Bank payments in Belgium.", category: "wallet", initials: "BC", color: "#005498" , slug: "bancontact" },
  { key: "p24", name: "Przelewy24", description: "Bank payments in Poland.", category: "wallet", initials: "P24", color: "#D13239" , slug: "przelewy24" },
  { key: "multibanco", name: "Multibanco", description: "Bank references in Portugal.", category: "wallet", initials: "MB", color: "#0C4DA2" },
  { key: "alipay", name: "Alipay", description: "Wallet payments in China.", category: "wallet", initials: "AL", color: "#1677FF" , slug: "alipay" },
  { key: "wechat", name: "WeChat Pay", description: "Wallet payments in China.", category: "wallet", initials: "WC", color: "#07C160" , slug: "wechat" },

  // Crypto
  { key: "usdc_erc20", name: "USDC (ERC20)", description: "Accept USDC on Ethereum.", category: "crypto", initials: "UC", color: "#2775CA" },
  { key: "usdt_erc20", name: "USDT (ERC20)", description: "Accept USDT on Ethereum.", category: "crypto", initials: "UT", color: "#26A17B" , slug: "tether" },
  { key: "usdc_spl", name: "USDC (SPL)", description: "Accept USDC on Solana.", category: "crypto", initials: "UC", color: "#2775CA" },
  { key: "usdt_spl", name: "USDT (SPL)", description: "Accept USDT on Solana.", category: "crypto", initials: "UT", color: "#26A17B" , slug: "tether" },
  { key: "bitcoin", name: "Bitcoin", description: "Accept Bitcoin.", category: "crypto", initials: "₿", color: "#F7931A" , slug: "bitcoin" },
  { key: "ethereum", name: "Ethereum", description: "Accept Ethereum.", category: "crypto", initials: "Ξ", color: "#627EEA" , slug: "ethereum" },
  { key: "litecoin", name: "Litecoin", description: "Accept Litecoin.", category: "crypto", initials: "Ł", color: "#345D9D" , slug: "litecoin" },
  { key: "solana", name: "Solana", description: "Accept Solana.", category: "crypto", initials: "SO", color: "#14F195" , slug: "solana" },

  // Other
  { key: "customer_balance", name: "Customer Balance", description: "Let customers top up and pay from balance.", category: "other", initials: "CB", color: "#F59E0B" },
  { key: "manual", name: "Manual Payment Method", description: "Collect payment your own way and confirm by hand.", category: "other", initials: "M", color: "#6B7280" },
];

export const PAYMENT_METHOD_MAP: Record<string, PaymentMethodDef> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.key, m]),
);

export const DEFAULT_ENABLED_METHODS = ["stripe", "apple_pay", "google_pay", "paypal"];

export type ConfigField = { key: string; label: string; placeholder?: string; secret?: boolean };

export function configFieldsFor(method: PaymentMethodDef): ConfigField[] {
  if (method.category === "crypto") {
    return [
      { key: "address", label: "Receiving wallet address", placeholder: "0x... / bc1..." },
      { key: "network", label: "Network (optional)", placeholder: "Ethereum, Solana, Bitcoin..." },
    ];
  }
  if (method.key === "manual") {
    return [
      { key: "instructions", label: "Payment instructions for the buyer", placeholder: "Send the transfer to..." },
    ];
  }
  if (method.category === "card" || method.category === "platform") {
    return [
      { key: "public_key", label: "Publishable / client key", placeholder: "pk_live_..." },
      { key: "secret_key", label: "Secret / API key", placeholder: "sk_live_...", secret: true },
    ];
  }
  return [
    { key: "account", label: "Account / merchant ID (optional)", placeholder: "merchant@example.com" },
  ];
}
