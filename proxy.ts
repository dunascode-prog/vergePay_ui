import { NextRequest, NextResponse } from "next/server";

// Optimistic session check before a page renders. It only reads cookies, so
// it can't be fooled into granting data: the API verifies every request
// itself. Its job is sending people to the right screen.
//
//   no session                  /dashboard → /signin?next=…
//   password ok, 2FA code due   /dashboard → /signin?step=2fa
//   full session                /signin, /signup → /dashboard

// The access token's claims, decoded but NOT verified: this app doesn't have
// (and shouldn't have) the API's signing key. Good enough for routing only.
function readClaims(token: string): { tfa?: string } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function safeNext(value: string | null): string {
  // Only same-site paths, so ?next= can't send someone to another site.
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const hasRefreshToken = request.cookies.has("refresh_token");

  const pendingTwoFactor = accessToken ? readClaims(accessToken)?.tfa === "pending" : false;
  const fullSession = Boolean(accessToken) && !pendingTwoFactor;
  // The access cookie expires with its token (15 min); the refresh cookie
  // outlives it. The first API call then refreshes the session (lib/api.ts).
  const mayHaveSession = fullSession || (!accessToken && hasRefreshToken);

  if (pathname.startsWith("/dashboard")) {
    if (pendingTwoFactor) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("step", "2fa");
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (!mayHaveSession) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // /signin and /signup: someone already fully signed in goes to the app.
  if (fullSession) {
    return NextResponse.redirect(new URL(safeNext(searchParams.get("next")), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
