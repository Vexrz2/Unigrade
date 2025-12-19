import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getPendingSuggestions, addCourseToDatabase } from '@/lib/controllers/CourseDatabaseController';
import { verifyAdmin } from '@/lib/auth';

// Get pending suggestions
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const adminId = await verifyAdmin(request);
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }
        
        const suggestions = await getPendingSuggestions();
        
        return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}

// Add a new course directly to the database
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const adminId = await verifyAdmin(request);
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }
        
        const data = await request.json();
        
        const course = await addCourseToDatabase(adminId, data);
        
        return NextResponse.json({ course }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
