import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const path = req.nextUrl.pathname 
    const publicUrls = ["/set-password", "/auth", "/contact"]
    if (publicUrls.some((url) => path.startsWith(url))) {
        return res;
    }

    const supabase = createMiddlewareClient({req, res})
    const { data : { user }} = await supabase.auth.getUser()
    
    if (user && path === '/') {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    else if (!user && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}