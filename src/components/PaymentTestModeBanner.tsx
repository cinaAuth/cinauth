const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/15 px-4 py-2 text-center text-sm text-destructive-foreground">
        Production checkout is not configured yet. Complete payments go-live to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-xs text-primary">
        Test mode — payments made here are not real.
      </div>
    );
  }
  return null;
}
