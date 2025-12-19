import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { submitCourseSuggestion, getUserSuggestions } from '@/lib/controllers/CourseDatabaseController';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const data = await request.json();
        
        const suggestion = await submitCourseSuggestion(userId, {
            name: data.name,
            code: data.code,
            credits: data.credits,
            department: data.department || 'Undeclared',
        });
        
        return NextResponse.json({ suggestion }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const suggestions = await getUserSuggestions(userId);
        
        return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
