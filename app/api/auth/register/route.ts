import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { registerUser } from '@/lib/controllers/AuthController';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
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
