import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateCourse } from '@/lib/controllers/CourseController';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const { courseId } = await params;
        const data = await request.json();
        const result = await updateCourse(auth.userId, courseId, data);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update course';
        return NextResponse.json({ message }, { status: 400 });
    }
}
