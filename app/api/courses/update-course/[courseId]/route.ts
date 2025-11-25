import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateCourse } from '@/lib/controllers/CourseController';

export async function PATCH(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const { courseId } = params;
        const data = await request.json();
        const result = await updateCourse(auth.userId, courseId, data);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
