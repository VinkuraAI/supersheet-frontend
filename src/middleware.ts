import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  // If no access token, redirect to the login page for any protected route.
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If the user is logged in and tries to access the welcome page
  if (pathname.startsWith('/welcome')) {
    // If the user is trying to create a new workspace, let them through.
    if (request.nextUrl.searchParams.get('create') === 'true') {
      console.log("????")
      return NextResponse.next();
    }

    try {
      // We must use the full backend URL here as this is a server-to-server request.
      // The /api proxy is for client-side requests only.
      const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspaces`;
      
      const response = await fetch(backendUrl, {
        headers: {
          'Cookie': `access_token=${accessToken.value}`
        }
      });

      if (response.ok) {
        const workspaces = await response.json();
        // If the user has one or more workspaces, redirect them to the main app.
        if (workspaces && workspaces.length > 1 ) {
          return NextResponse.redirect(new URL('/workspace', request.url));
        }
      }
    } catch (error) {
      console.error("Middleware error fetching workspaces:", error);
      // If the API call fails for any reason, it's safest to let them proceed
      // to the welcome page instead of blocking them.
      return NextResponse.next();
    }
  }

  // If there is a token and the route is not /welcome, allow the request to proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/workspace/:path*', '/workspace-setup/:path*', '/welcome'],
}