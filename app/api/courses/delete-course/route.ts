import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { removeCourse } from '@/lib/controllers/CourseController';

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const { courseId } = await request.json();
        const result = await removeCourse(auth.userId, courseId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete course';
        return NextResponse.json({ message }, { status: 400 });
    }
}
