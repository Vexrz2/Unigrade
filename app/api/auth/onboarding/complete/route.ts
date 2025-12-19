import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import { User } from '@/lib/models/UserModel';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findByIdAndUpdate(
            auth.userId,
            { onboardingCompleted: true },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            user 
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
}
