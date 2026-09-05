import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$storeSlug")({
  component: () => <Outlet />,
});
