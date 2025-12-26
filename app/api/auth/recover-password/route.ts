import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { recoverUserPassword } from '@/lib/controllers/AuthController';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Strict rate limiting for password recovery
        const clientIP = getClientIP(request);
        const rateLimitResult = checkRateLimit(`recover:${clientIP}`, RATE_LIMITS.passwordRecovery);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: 'Too many password recovery attempts. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                    }
                }
            );
        }

        await connectDB();
        const { email } = await request.json();
        const result = await recoverUserPassword(email);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to recover password';
        return NextResponse.json({ message }, { status: 400 });
    }
}
