import { NextResponse } from 'next/server';
import { generateOAuthState } from '@/lib/security';

export async function GET() {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
        
        if (!clientId) {
            return NextResponse.json({ message: 'Google OAuth is not configured' }, { status: 500 });
        }

        // Generate CSRF protection state
        const state = generateOAuthState();

        // Build Google OAuth URL
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.append('client_id', clientId);
        googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.append('response_type', 'code');
        googleAuthUrl.searchParams.append('scope', 'openid email profile');
        googleAuthUrl.searchParams.append('access_type', 'offline');
        googleAuthUrl.searchParams.append('prompt', 'consent');
        googleAuthUrl.searchParams.append('state', state);

        // Set state in cookie for verification on callback
        const response = NextResponse.redirect(googleAuthUrl.toString());
        response.cookies.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });
        
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initiate Google OAuth';
        return NextResponse.json({ message }, { status: 500 });
    }
}
