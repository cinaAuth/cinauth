import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Track your order — cinaAuth" },
      { name: "description", content: "Enter your order number to check the status and download your digital products." },
      { property: "og:title", content: "Track your order — cinaAuth" },
      { property: "og:description", content: "Enter your order number to check the status and download your digital products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderLookupPage,
});

function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the order number you received after paying.
        </p>
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const value = orderNumber.trim().toUpperCase();
            if (value) navigate({ to: "/orders/$orderNumber", params: { orderNumber: value } });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. A1B2C3D4E5"
            />
          </div>
          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Find order
          </Button>
        </form>
      </main>
    </div>
  );
}
