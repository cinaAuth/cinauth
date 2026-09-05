import { createFileRoute } from "@tanstack/react-router";
import { PaymentMethodsPanel } from "@/components/PaymentMethodsPanel";

export const Route = createFileRoute("/_authenticated/panel/settings/payment-methods")({
  head: () => ({
    meta: [
      { title: "Payment methods — cinaAuth" },
      { name: "description", content: "Manage and review the payment methods your cinaAuth buyers can use." },
      { property: "og:title", content: "Payment methods — cinaAuth" },
      {
        property: "og:description",
        content: "Manage and review the payment methods your cinaAuth buyers can use.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PaymentMethodsPanel group="Settings" title="Payment Methods" />,
});
