import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/UserModel';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
        if (!isValidEmail) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        
        return NextResponse.json({ 
            exists: !!existingUser,
            message: existingUser ? 'Email already registered' : 'Email available'
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
}
