import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateUserPassword } from '@/lib/controllers/AuthController';

export async function POST(request: NextRequest) {
    try {
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
