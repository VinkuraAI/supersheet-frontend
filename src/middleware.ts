import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');

  if (!accessToken) {
    // If no access token, redirect to the login page
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If there is a token, allow the request to proceed
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/workspace/:path*', '/workspace-setup/:path*'],
}