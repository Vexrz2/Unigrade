import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { getUser } from '@/lib/controllers/UserController';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const user = await getUser(auth.userId);
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user profile';
        return NextResponse.json({ message }, { status: 400 });
    }
}
