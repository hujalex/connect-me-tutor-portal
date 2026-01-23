import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const path = req.nextUrl.pathname 
    const publicUrls = ["/set-password", "/auth", "/contact"]
    // Allow public routes (handles trailing slashes)
    if (publicUrls.some(url => path.startsWith(url))) {
        return res;
    }

    const supabase = createMiddlewareClient({req, res})
    const { data: { session }} = await supabase.auth.getSession()
    
    if (session && path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    else if (!session && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  

    return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}