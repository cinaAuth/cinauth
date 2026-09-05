import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/_authenticated/panel/$")({
  head: () => ({
    meta: [
      { title: "Store section — cinaAuth" },
      { name: "description", content: "Manage this section of your cinaAuth store." },
      { property: "og:title", content: "Store section — cinaAuth" },
      { property: "og:description", content: "Manage this section of your cinaAuth store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PanelSectionPage,
});

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function PanelSectionPage() {
  const { _splat } = Route.useParams();
  const parts = (_splat ?? "").split("/").filter(Boolean);
  const group = parts.length > 1 ? titleize(parts[0]!) : null;
  const section = titleize(parts[parts.length - 1] ?? "Section");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {group && <p className="text-sm font-medium text-primary">{group}</p>}
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{section}</h1>
      <p className="mt-2 text-muted-foreground">This section of your store dashboard.</p>

      <Card className="mt-8 border-border bg-card">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <Construction className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">{section} is coming next</CardTitle>
          <CardDescription>
            The menu entry is ready. Tell me what you want {section.toLowerCase()} to do and I will build it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
          <Link to="/products">
            <Button>Manage products</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
