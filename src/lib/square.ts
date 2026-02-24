// Square utility functions
// Actual Square API calls happen in API routes

export function getSquareEnvironment(): "sandbox" | "production" {
  return (process.env.SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox";
}

export function getSquareBaseUrl(): string {
  const env = getSquareEnvironment();
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}
