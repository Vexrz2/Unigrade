import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/UserModel';

export async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user) {
            return null;
        }
        return decoded;
    } catch (err) {
        return null;
    }
}

export function setAuthCookie(response: NextResponse, token: string) {
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });
}

export function unauthorizedResponse() {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
