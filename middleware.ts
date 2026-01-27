import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// handles authentication routing and session management
// redirects users based on authentication status and requested path
export async function middleware(req: NextRequest) {
    // initialize response object for modifications
    const res = NextResponse.next()
    // extract the pathname from the request url
    const path = req.nextUrl.pathname 
    // define routes that don't require authentication
    const publicUrls = ["/set-password", "/auth", "/contact"]
    // early return for public routes to improve performance
    // uses startswith to handle nested routes and trailing slashes
    if (publicUrls.some(url => path.startsWith(url))) {
        return res;
    }

    // only create supabase client for protected routes
    const supabase = createMiddlewareClient({req, res})
    // retrieve the current user session from supabase
    const { data: { session }} = await supabase.auth.getSession()
    
    // if user is authenticated and accessing root, redirect to dashboard
    if (session && path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // if user is not authenticated and trying to access dashboard, redirect to home
    else if (!session && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  
    // allow request to proceed for all other cases
    return res;
}

// matcher configuration defines which routes this middleware applies to
// - /dashboard/:path* matches all dashboard routes and nested paths
// - excludes static assets, images, and favicon for performance
export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}