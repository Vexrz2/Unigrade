import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';

export default function Proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Protected routes that require authentication
    const protectedRoutes = [
        '/dashboard',
        '/profile',
        '/courses',
        '/study-plan',
        '/career-plan',
    ];

    // API routes that require authentication
    // const protectedApiRoutes = [
    //     '/api/users/profile',
    //     '/api/users/update',
    //     '/api/users/delete',
    //     '/api/users/change-password',
    //     '/api/users/logout',
    //     '/api/courses/add-course',
    //     '/api/courses/course-list',
    //     '/api/courses/update-course',
    //     '/api/courses/delete-course',
    //     '/api/users/update-degree',
    // ];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    // const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) { // || isProtectedApiRoute
        const token = req.cookies.get('token')?.value;

        if (!token) {
            // if (isProtectedApiRoute) {
            //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            // }
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET || '');
        } catch (error) {
            // if (isProtectedApiRoute) {
            //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            // }
            console.error('Authentication error:', error);
            req.cookies.delete('token');
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    const response = NextResponse.next();
    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
};