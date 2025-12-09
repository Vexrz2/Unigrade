import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { recoverUserPassword } from '@/lib/controllers/AuthController';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email } = await request.json();
        const result = await recoverUserPassword(email);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to recover password';
        return NextResponse.json({ message }, { status: 400 });
    }
}
