import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
        
        if (!clientId) {
            return NextResponse.json({ message: 'Google OAuth is not configured' }, { status: 500 });
        }

        // Build Google OAuth URL
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.append('client_id', clientId);
        googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
        googleAuthUrl.searchParams.append('response_type', 'code');
        googleAuthUrl.searchParams.append('scope', 'openid email profile');
        googleAuthUrl.searchParams.append('access_type', 'offline');
        googleAuthUrl.searchParams.append('prompt', 'consent');

        return NextResponse.redirect(googleAuthUrl.toString());
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initiate Google OAuth';
        return NextResponse.json({ message }, { status: 500 });
    }
}
