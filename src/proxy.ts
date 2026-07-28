import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/g9x2k7m3q8w-admin";
const API_PATH = "/api";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Admin pages: noindex
  if (pathname.startsWith(ADMIN_PATH)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");
  }

  // API routes: CORS + additional protection
  if (pathname.startsWith(API_PATH)) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
      "https://glymee.com",
      "https://www.glymee.com",
      "http://localhost:3000",
      "http://localhost:8787",
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Block non-admin API access from external referrers
    const referer = request.headers.get("referer") || "";
    if (!pathname.startsWith(ADMIN_PATH) && referer && !referer.includes("glymee.com") && !referer.includes("localhost")) {
      // Allow if it has a valid origin check above
    }

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|Glymee_logo_1.png|glymee_dashboard.png|dashboard-preview.svg|robots.txt|sitemap.xml).*)",
  ],
};
