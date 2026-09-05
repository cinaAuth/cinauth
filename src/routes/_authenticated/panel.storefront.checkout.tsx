import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { getMyStore } from "@/lib/stores.functions";

export const Route = createFileRoute("/_authenticated/panel/storefront/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout settings — cinaAuth" },
      { name: "description", content: "Review the payment methods buyers see at your cinaAuth store checkout." },
      { property: "og:title", content: "Checkout settings — cinaAuth" },
      {
        property: "og:description",
        content: "Review the payment methods buyers see at your cinaAuth store checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutSettingsPage,
});

const GLOBAL_METHODS = [
  { label: "Card", note: "Visa, Mastercard, Amex" },
  { label: "Apple Pay", note: "On Safari / iOS" },
  { label: "Google Pay", note: "On Chrome / Android" },
  { label: "Link", note: "Saved 1-click details" },
  { label: "PayPal", note: "One-time payments" },
  { label: "Amazon Pay", note: "One-time payments" },
];

const EUR_METHODS = [
  { label: "Bizum", note: "Spain" },
  { label: "SEPA transfer", note: "Eurozone" },
  { label: "Klarna", note: "Pay later" },
  { label: "iDEAL", note: "Netherlands" },
  { label: "Bancontact", note: "Belgium" },
  { label: "Przelewy24", note: "Poland" },
  { label: "EPS", note: "Austria" },
  { label: "Multibanco", note: "Portugal" },
  { label: "Alipay", note: "China" },
  { label: "WeChat Pay", note: "China" },
];

function MethodGrid({ items }: { items: { label: string; note: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between gap-3 rounded-none border border-border bg-background/60 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold">{m.label}</p>
            <p className="text-xs text-muted-foreground">{m.note}</p>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            Active
          </Badge>
        </div>
      ))}
    </div>
  );
}

function CheckoutSettingsPage() {
  const fetchStore = useServerFn(getMyStore);
  const { data } = useQuery({ queryKey: ["my-store"], queryFn: () => fetchStore() });
  const store = data?.store ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Storefront</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        This is what buyers see when they pay. Payment methods appear automatically based on their country and the
        product currency.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" /> Checkout page
            </CardTitle>
            <CardDescription>Cart, email and embedded secure payment form.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/checkout">
              <Button>Open checkout</Button>
            </Link>
            {store?.slug && (
              <a href={`/${store.slug}`}>
                <Button variant="outline">
                  View my store <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> Security
            </CardTitle>
            <CardDescription>
              Payments are processed on a PCI-compliant hosted form. Card details never touch your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test mode is used in preview. Real charges start once your store goes live.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Available everywhere</h2>
      <div className="mt-4">
        <MethodGrid items={GLOBAL_METHODS} />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Euro prices</h2>
      <div className="mt-4">
        <MethodGrid items={EUR_METHODS} />
      </div>

      <div className="mt-10">
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
