import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Middleware function to handle authentication routing and session 
// managementRedirects users based on their authentication status and requested path
export async function middleware(req: NextRequest) {
    // intialize response object for modifications
    const res = NextResponse.next()
    
    // extract the pathname from the request URL
    const path = req.nextUrl.pathname 
    
    // define routes that don't require authentication
    const publicUrls = ["/set-password", "/auth", "/contact"]
    
    // early return for public routes to improve performance
    // Uuses startsWith to handle nested routes and trailing slashes
    if (publicUrls.some(url => path.startsWith(url))) {
        return res;
    }

    // create Supabase client for protected routes to avoid unnecessary auth checks
    const supabase = createMiddlewareClient({req, res})
    
    // retrieve the current user session from Supabase
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


export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}