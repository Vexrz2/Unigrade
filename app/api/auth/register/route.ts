import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { registerUser } from '@/lib/controllers/AuthController';
import { setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        const rateLimitResult = checkRateLimit(`register:${clientIP}`, RATE_LIMITS.auth);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: 'Too many registration attempts. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                    }
                }
            );
        }

        await connectDB();
        const data = await request.json();
        const result = await registerUser(data);
        const response = NextResponse.json(
            { user: result.user },
            { status: 201 }
        );
        setAuthCookie(response, result.token);
        return response;
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 400 });
    }
}
