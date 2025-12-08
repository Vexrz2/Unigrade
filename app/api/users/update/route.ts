import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { updateUser } from '@/lib/controllers/UserController';

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }
        
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const major = formData.get('major') as string;
        const profilePictureFile = formData.get('profilePicture') as File | null;
        
        let profilePictureBase64: string | undefined;
        
        if (profilePictureFile && profilePictureFile.size > 0) {
            const bytes = await profilePictureFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            profilePictureBase64 = `data:${profilePictureFile.type};base64,${buffer.toString('base64')}`;
        }
        
        const data = {
            username,
            email,
            major,
            profilePicture: profilePictureBase64
        };
        
        const result = await updateUser(auth.userId, data);
        return NextResponse.json({ updatedUser: result }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
