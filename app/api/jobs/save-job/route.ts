import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware, unauthorizedResponse } from '@/lib/auth';
import { User } from '@/lib/models/UserModel';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        if (!auth) {
            return unauthorizedResponse();
        }

        const { job } = await request.json();
        
        if (!job || !job.job_id) {
            return NextResponse.json({ message: 'Job object with job_id is required' }, { status: 400 });
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Initialize savedJobs if it doesn't exist
        if (!user.savedJobs) {
            user.savedJobs = [] as any;
        }

        // Toggle save/unsave
        const jobIndex = user.savedJobs.findIndex((j: any) => j.job_id === job.job_id);
        if (jobIndex > -1) {
            user.savedJobs.splice(jobIndex, 1);
            await user.save();
            return NextResponse.json({ message: 'Job removed from saved', savedJobs: user.savedJobs }, { status: 200 });
        } else {
            user.savedJobs.push(job);
            await user.save();
            return NextResponse.json({ message: 'Job saved successfully', savedJobs: user.savedJobs }, { status: 200 });
        }
    } catch (error: any) {
        console.error('Save job error:', error);
        return NextResponse.json({ message: error.message || 'Failed to save job' }, { status: 500 });
    }
}
