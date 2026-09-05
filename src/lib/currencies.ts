export type CurrencyInfo = { code: string; name: string; symbol: string; zeroDecimal?: boolean };

/** Currencies the storefront can display. Charges still happen in the product currency. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$", zeroDecimal: true },
  { code: "COP", name: "Colombian Peso", symbol: "COL$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", zeroDecimal: true },
  { code: "KRW", name: "South Korean Won", symbol: "₩", zeroDecimal: true },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", zeroDecimal: true },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", zeroDecimal: true },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
];

export const CURRENCY_BY_CODE = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));

/** Offline fallback rates against USD; refreshed at runtime from a live rates feed. */
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, BRL: 5.4, MXN: 18.5, ARS: 1000, CLP: 950, COP: 4000,
  PEN: 3.7, CAD: 1.36, AUD: 1.5, NZD: 1.64, CHF: 0.88, SEK: 10.5, NOK: 10.7, DKK: 6.9,
  PLN: 3.95, CZK: 23, RON: 4.6, HUF: 360, TRY: 34, UAH: 41, RUB: 92, ILS: 3.7,
  AED: 3.67, SAR: 3.75, ZAR: 18.3, NGN: 1500, EGP: 48, INR: 84, PKR: 278, CNY: 7.2,
  TWD: 32, HKD: 7.8, JPY: 150, KRW: 1350, SGD: 1.34, MYR: 4.5, THB: 34.5, VND: 25000,
  IDR: 15800, PHP: 58,
};

/** Best-guess currency for a browser locale / region. */
export const REGION_CURRENCY: Record<string, string> = {
  ES: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", PT: "EUR", NL: "EUR", IE: "EUR", BE: "EUR",
  AT: "EUR", FI: "EUR", GR: "EUR", US: "USD", GB: "GBP", BR: "BRL", MX: "MXN", AR: "ARS",
  CL: "CLP", CO: "COP", PE: "PEN", CA: "CAD", AU: "AUD", NZ: "NZD", CH: "CHF", SE: "SEK",
  NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", RO: "RON", HU: "HUF", TR: "TRY", UA: "UAH",
  RU: "RUB", IL: "ILS", AE: "AED", SA: "SAR", ZA: "ZAR", NG: "NGN", EG: "EGP", IN: "INR",
  PK: "PKR", CN: "CNY", TW: "TWD", HK: "HKD", JP: "JPY", KR: "KRW", SG: "SGD", MY: "MYR",
  TH: "THB", VN: "VND", ID: "IDR", PH: "PHP",
};

export function convert(amount: number, from: string, to: string, rates: Record<string, number>) {
  const fromRate = rates[from] ?? FALLBACK_RATES[from] ?? 1;
  const toRate = rates[to] ?? FALLBACK_RATES[to] ?? 1;
  return (amount / fromRate) * toRate;
}

export function formatMoney(amount: number, code: string, locale: string) {
  const info = CURRENCY_BY_CODE[code];
  const digits = info?.zeroDecimal ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${info?.symbol ?? ""}${amount.toFixed(digits)} ${code}`;
  }
}
