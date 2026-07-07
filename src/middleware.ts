import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // central CORS configuration for APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin') || '';
    
    // Check if origin matches localhost:3001 or the deployed Vercel admin URL
    const allowedOrigins = [
      'http://localhost:3001',
      'https://sss-baby-skin-care-admin.vercel.app'
    ];
    
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
    const allowOrigin = isAllowed ? origin : 'https://sss-baby-skin-care-admin.vercel.app';

    // 1. Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 240 });
      response.headers.set('Access-Control-Allow-Origin', allowOrigin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 2. Attach CORS headers to standard API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
