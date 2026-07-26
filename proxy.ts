// proxy.ts

import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // const token = request.cookies.get("access_token")?.value;

  // if (!token) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
