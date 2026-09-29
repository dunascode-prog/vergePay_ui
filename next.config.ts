import type { NextConfig } from "next";

// Where the VergePay API runs. Server-only: the browser never calls it
// directly (see the rewrite below).
const apiUrl = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // The browser calls /v1/* on this app's own origin and Next forwards it to
  // the API. The API's HttpOnly session cookies are then first-party here,
  // so proxy.ts can see them in every environment, and no CORS is involved.
  async rewrites() {
    return [{ source: "/v1/:path*", destination: `${apiUrl}/v1/:path*` }];
  },
};

export default nextConfig;
