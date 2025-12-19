import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { incrementCourseUsage } from '@/lib/controllers/CourseDatabaseController';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { courseId } = await request.json();
        
        if (!courseId) {
            return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
        }
        
        await incrementCourseUsage(courseId);
        
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
