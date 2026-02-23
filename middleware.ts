import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware";

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabase(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && !isPublicRoute) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
