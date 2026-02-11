import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = [
  "/account/login",
  "/account/register",
  "/account/reset-password-link",
  "/account/verify-email",
];

const PUBLIC_PREFIXES = ["/public"];
const PROTECTED_PREFIXES = ["/user", "/admin", "/assignment"];

const decodeJwtPayload = (token?: string) => {
  if (!token) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;

  const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    const raw = atob(padded);
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getUserRoles = (request: NextRequest) => {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const payload = decodeJwtPayload(accessToken || refreshToken);
  return Array.isArray(payload?.roles) ? payload.roles : [];
};

const normalizeLoginRole = (value: string | null) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "student" || normalized === "user") return "user";
  if (normalized === "tutor") return "tutor";
  if (normalized === "admin") return "admin";
  return null;
};

const isPublicPath = (path: string) => {
  if (path === "/") return true;
  if (AUTH_PAGES.includes(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const isProtectedPath = (path: string) =>
  PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

const redirectToLogin = (
  request: NextRequest,
  role: "user" | "admin",
  nextPath?: string
) => {
  const url = new URL("/account/login", request.url);
  url.searchParams.set("role", role);
  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(url);
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuth = request.cookies.get("is_auth")?.value === "true";
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = Boolean(isAuth && refreshToken);
  const roles = getUserRoles(request);
  const isAdmin = roles.includes("admin");
  const defaultAuthedPath = isAdmin ? "/admin" : "/user/dashboard";

  if (!isAuthenticated) {
    if (isPublicPath(path)) {
      return NextResponse.next();
    }

    if (path.startsWith("/admin")) {
      return redirectToLogin(request, "admin", path);
    }

    if (isProtectedPath(path)) {
      return redirectToLogin(request, "user", path);
    }

    return NextResponse.next();
  }

  if (path.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  if (path.startsWith("/user") && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (path === "/account/login") {
    const requestedRole = normalizeLoginRole(request.nextUrl.searchParams.get("role"));
    if (requestedRole === "admin" && !isAdmin) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    if (requestedRole && requestedRole !== "admin" && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
  }

  if (AUTH_PAGES.includes(path) || path === "/") {
    return NextResponse.redirect(new URL(defaultAuthedPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
