import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { rejectSuggestion } from '@/lib/controllers/CourseDatabaseController';
import { verifyAdmin } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ suggestionId: string }> }
) {
    try {
        await connectDB();
        
        const adminId = await verifyAdmin(request);
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
        }
        
        const { suggestionId } = await params;
        
        const course = await rejectSuggestion(adminId, suggestionId);
        
        return NextResponse.json({ course }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
