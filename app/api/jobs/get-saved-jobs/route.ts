import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { User } from '@/lib/models/UserModel';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ savedJobs: user.savedJobs || [] }, { status: 200 });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        const message = error instanceof Error ? error.message : 'Failed to get saved jobs';
        return NextResponse.json({ message }, { status: 500 });
    }
}
