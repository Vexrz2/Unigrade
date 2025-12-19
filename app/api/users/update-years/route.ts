import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import { User } from '@/lib/models/UserModel';

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const auth = await authMiddleware(request);
        
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { startYear, expectedGraduationYear } = await request.json();
        
        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 10;
        const maxYear = currentYear + 10;

        if (startYear !== undefined) {
            if (startYear < minYear || startYear > maxYear) {
                return NextResponse.json({ 
                    message: `Start year must be between ${minYear} and ${maxYear}` 
                }, { status: 400 });
            }
        }

        if (expectedGraduationYear !== undefined) {
            if (expectedGraduationYear < minYear || expectedGraduationYear > maxYear) {
                return NextResponse.json({ 
                    message: `Expected graduation year must be between ${minYear} and ${maxYear}` 
                }, { status: 400 });
            }
        }

        const updateData: Record<string, number> = {};
        if (startYear !== undefined) updateData.startYear = startYear;
        if (expectedGraduationYear !== undefined) updateData.expectedGraduationYear = expectedGraduationYear;

        const user = await User.findByIdAndUpdate(
            auth.userId,
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            user 
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
}
