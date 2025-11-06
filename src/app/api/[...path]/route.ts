import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const path = pathSegments.join('/');
  const url = `${BACKEND_URL}/${path}`;
  
  // Forward cookies from the browser request to the backend
  const cookies = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');

  // Handle multipart/form-data (file uploads)
  const isMultipart = contentType?.includes('multipart/form-data');
  
  let body;
  const headers: Record<string, string> = {
    ...(cookies && { Cookie: cookies }),
  };

  if (method !== 'GET' && method !== 'DELETE') {
    if (isMultipart) {
      // For multipart/form-data, pass the FormData directly
      body = await request.formData();
      // Don't set Content-Type - let fetch set it with the boundary
    } else {
      // For JSON requests
      try {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
        headers['Content-Type'] = 'application/json';
      } catch {
        // No body or invalid JSON
      }
    }
  }

  try {
    const backendResponse = await fetch(url, {
      method,
      headers,
      body: body as BodyInit | undefined,
      credentials: 'include',
    });

    const data = await backendResponse.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // Create response
    const response = NextResponse.json(jsonData, {
      status: backendResponse.status,
    });

    // Forward Set-Cookie headers from backend to browser
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('Set-Cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
