// Stripe utility functions
// These are thin wrappers — actual Stripe calls happen in API routes

export function formatCurrency(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function calculateHST(amountCents: number, rate = 0.13): number {
  return Math.round(amountCents * rate);
}

export function calculateTotal(amountCents: number, taxRate = 0.13): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const tax = calculateHST(amountCents, taxRate);
  return {
    subtotal: amountCents,
    tax,
    total: amountCents + tax,
  };
}
