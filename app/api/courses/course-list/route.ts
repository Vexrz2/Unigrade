import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { getCourses } from '@/lib/controllers/CourseController';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        const courses = await getCourses(auth.userId);
        return NextResponse.json(courses, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch courses';
        return NextResponse.json({ message }, { status: 400 });
    }
}
