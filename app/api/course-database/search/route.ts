import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { searchCourses, getPopularCourses } from '@/lib/controllers/CourseDatabaseController';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query') || undefined;
        const department = searchParams.get('degreeField') || searchParams.get('department') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
        const popular = searchParams.get('popular') === 'true';
        
        let courses;
        
        if (popular && !query) {
            courses = await getPopularCourses(limit, department);
        } else {
            courses = await searchCourses({ query, department, limit });
        }
        
        return NextResponse.json({ courses }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
