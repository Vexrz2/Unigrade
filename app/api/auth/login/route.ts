import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { loginUser } from '@/lib/controllers/AuthController';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const result = await loginUser(data);
        const response = NextResponse.json(
            { user: result.user },
            { status: 200 }
        );
        setAuthCookie(response, result.token);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        return NextResponse.json({ message }, { status: 400 });
    }
}
