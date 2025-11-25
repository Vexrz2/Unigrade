import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });
        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
