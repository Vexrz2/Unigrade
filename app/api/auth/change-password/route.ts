import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateUserPassword } from '@/lib/controllers/AuthController';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        const rateLimitResult = checkRateLimit(`change-password:${clientIP}`, RATE_LIMITS.auth);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: 'Too many password change attempts. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                    }
                }
            );
        }

        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const data = await request.json();
        const result = await updateUserPassword(auth.userId, data);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to change password';
        return NextResponse.json({ message }, { status: 400 });
    }
}
