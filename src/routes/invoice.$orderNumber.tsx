import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/invoice/$orderNumber")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/orders/$orderNumber",
      params: { orderNumber: params.orderNumber.toUpperCase() },
    });
  },
});
