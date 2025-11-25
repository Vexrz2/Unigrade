import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { deleteUser } from '@/lib/controllers/UserController';

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const result = await deleteUser(auth.userId);
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
