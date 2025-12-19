import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/db';
import { handleGoogleAuth } from '@/lib/controllers/AuthController';
import { setAuthCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            // User denied access or other error
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=google_auth_failed`);
        }

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=config_missing`);
        }

        // Exchange code for tokens
        const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_payload`);
        }

        // Handle Google authentication
        const result = await handleGoogleAuth({
            googleId: payload.sub,
            email: payload.email!,
            name: payload.name || payload.email!.split('@')[0],
            profilePicture: payload.picture,
        });
        
        // Redirect to onboarding for new users, dashboard for existing users
        const redirectUrl = result.user.onboardingCompleted 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding`;
        const response = NextResponse.redirect(redirectUrl);

        // Set auth cookie
        setAuthCookie(response, result.token);
        
        return response;
    } catch (error: unknown) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=auth_failed`);
    }
}
