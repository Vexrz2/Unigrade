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
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

// Helper function to verify auth and return userId
export async function verifyAuth(request: NextRequest): Promise<string | null> {
    const result = await authMiddleware(request);
    return result?.userId || null;
}

// Middleware to check admin status
export async function verifyAdmin(request: NextRequest): Promise<string | null> {
    const userId = await verifyAuth(request);
    if (!userId) return null;
    
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) return null;
    
    return userId;
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
