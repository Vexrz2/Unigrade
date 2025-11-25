import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateDegree } from '@/lib/controllers/DegreeController';

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const data = await request.json();
        const result = await updateDegree(auth.userId, data);
        return NextResponse.json({ updatedUser: result }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
