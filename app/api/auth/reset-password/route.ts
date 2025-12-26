import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { resetPasswordWithToken } from '@/lib/controllers/AuthController';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        const rateLimitResult = checkRateLimit(`reset-password:${clientIP}`, RATE_LIMITS.auth);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: 'Too many password reset attempts. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                    }
                }
            );
        }

        await connectDB();
        const { token, newPassword } = await request.json();
        
        if (!token || !newPassword) {
            return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
        }
        
        const result = await resetPasswordWithToken(token, newPassword);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to reset password';
        return NextResponse.json({ message }, { status: 400 });
    }
}
