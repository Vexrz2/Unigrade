import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/lib/models/UserModel';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 10; // Allow up to 10 years in the past
const MAX_YEAR = CURRENT_YEAR + 10; // Allow up to 10 years in the future

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const data = await request.json();
        const { 
            degreeType, 
            major, 
            creditRequirement,
            startYear, 
            expectedGraduationYear, 
            currentYear,
            courses 
        } = data;
        
        // Validate years with sane limits
        if (startYear && (startYear < MIN_YEAR || startYear > MAX_YEAR)) {
            return NextResponse.json({ 
                message: `Start year must be between ${MIN_YEAR} and ${MAX_YEAR}` 
            }, { status: 400 });
        }
        
        if (expectedGraduationYear && (expectedGraduationYear < MIN_YEAR || expectedGraduationYear > MAX_YEAR)) {
            return NextResponse.json({ 
                message: `Expected graduation year must be between ${MIN_YEAR} and ${MAX_YEAR}` 
            }, { status: 400 });
        }
        
        if (startYear && expectedGraduationYear && startYear > expectedGraduationYear) {
            return NextResponse.json({ 
                message: 'Start year cannot be after expected graduation year' 
            }, { status: 400 });
        }
        
        // Validate current year (1-8 for typical degree programs)
        if (currentYear && (currentYear < 1 || currentYear > 8)) {
            return NextResponse.json({ 
                message: 'Current year must be between 1 and 8' 
            }, { status: 400 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        // Update degree information
        if (!user.degree) {
            user.degree = { type: '', major: '', creditRequirement: 120 };
        }
        
        if (degreeType) user.degree.type = degreeType;
        if (major) user.degree.major = major;
        if (creditRequirement) user.degree.creditRequirement = creditRequirement;
        
        // Update year information
        if (startYear) user.startYear = startYear;
        if (expectedGraduationYear) user.expectedGraduationYear = expectedGraduationYear;
        if (currentYear) user.currentYear = currentYear;
        
        // Add initial courses if provided
        if (courses && Array.isArray(courses) && courses.length > 0) {
            for (const course of courses) {
                if (course.courseId) {
                    user.courses.push({
                        course: course.courseId,
                        semester: course.semester || { year: startYear || CURRENT_YEAR, term: 'Fall' },
                        grades: course.grades || [],
                    });
                }
            }
        }
        
        // Mark onboarding as completed
        user.onboardingCompleted = true;
        
        await user.save();
        
        // Populate courses before returning
        await user.populate('courses.course');
        
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}