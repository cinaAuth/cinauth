import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMyStore } from "@/lib/stores.functions";
import { getStoreProducts, createProduct } from "@/lib/products.functions";
import { Zap, Package, Loader2, DollarSign, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "Products — cinaAuth" },
      { name: "description", content: "Manage your digital products." },
      { property: "og:title", content: "Products — cinaAuth" },
      { property: "og:description", content: "Manage your digital products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const getMyStoreFn = useServerFn(getMyStore);
  const getStoreProductsFn = useServerFn(getStoreProducts);
  const createProductFn = useServerFn(createProduct);

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ["my-store"],
    queryFn: () => getMyStoreFn(),
  });

  const { data: productsData, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ["store-products", storeData?.store?.id],
    queryFn: () => getStoreProductsFn({ data: { storeId: storeData!.store!.id } }),
    enabled: !!storeData?.store?.id,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [billingInterval, setBillingInterval] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData?.store) return;
    setCreating(true);
    setError(null);
    try {
      await createProductFn({
        data: {
          storeId: storeData.store.id,
          name,
          slug,
          description,
          price: Number(price),
          fileUrl,
          billingInterval: (billingInterval || null) as "month" | "year" | null,
        },
      });
      await refetch();
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setFileUrl("");
      setBillingInterval("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const isLoading = storeLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            cinaAuth
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Back to dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <p className="mt-2 text-muted-foreground">Create and manage the digital products in your store.</p>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-border bg-card p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !storeData?.store ? (
          <Card className="mt-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Create your store first</CardTitle>
              <CardDescription className="text-muted-foreground">You need a store before adding products.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create store</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Add a product</CardTitle>
                <CardDescription className="text-muted-foreground">Buyers will see this on your public store.</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product name</Label>
                    <Input id="product-name" placeholder="e.g. Pro Digital Pack" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-slug">Slug</Label>
                    <Input id="product-slug" placeholder="pro-digital-pack" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea id="product-description" placeholder="What's included?" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price (USD)</Label>
                      <Input id="product-price" type="number" min="0" step="0.01" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-file">Delivery URL</Label>
                      <Input id="product-file" placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-billing">Billing</Label>
                    <select
                      id="product-billing"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={billingInterval}
                      onChange={(e) => setBillingInterval(e.target.value)}
                    >
                      <option value="">One-time payment</option>
                      <option value="month">Subscription — monthly</option>
                      <option value="year">Subscription — yearly</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Subscriptions renew automatically; buyers keep access until the end of the paid period when they cancel.</p>
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={creating}>
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                    Create product
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Your products</h2>
              {productsData?.products?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet. Add your first one.</p>
              ) : (
                productsData?.products?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">/{product.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center text-sm font-semibold text-primary">
                        <DollarSign className="mr-1 h-3 w-3" />
                        {Number(product.price).toFixed(2)}
                      </span>
                      <a
                        href={`/${storeData.store!.slug}/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
