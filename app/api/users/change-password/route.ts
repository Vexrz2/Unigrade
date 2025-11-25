import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateUserPassword } from '@/lib/controllers/UserController';

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
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
