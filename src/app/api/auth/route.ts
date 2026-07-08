import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_USER } from '../../../data/seed';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { email, password } = result.data;

    // Check credentials matching our seed admin
    if (email.trim().toLowerCase() === ADMIN_USER.email.trim().toLowerCase() && password === ADMIN_USER.passwordHash) {
      const response = NextResponse.json({
        success: true,
        user: {
          name: ADMIN_USER.name,
          email: ADMIN_USER.email
        },
        token: 'mock-admin-jwt-token'
      });

      // Set cookie directly in response header
      response.cookies.set('admin_session', 'mock-admin-jwt-token', {
        path: '/',
        maxAge: 86400, // 1 day
        httpOnly: false, // Accessible to Zustand on the client side
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      return response;
    }

    return NextResponse.json({ error: { formErrors: ['Invalid email or password'] } }, { status: 401 });
  } catch (error) {
    console.error('Error logging in API:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
