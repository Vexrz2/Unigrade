import { Course } from '@/lib/models/CourseModel';
import { User } from '@/lib/models/UserModel';
import type { Course as CourseType } from '@/types';

// Search approved courses in the database
export async function searchCourses(params: {
    query?: string;
    department?: string;
    limit?: number;
}) {
    const { query, department, limit = 20 } = params;
    
    const filter: Record<string, unknown> = { status: 'approved' };
    
    if (query && query.trim()) {
        // Use regex for partial matching
        const regex = new RegExp(query.trim(), 'i');
        filter.$or = [
            { name: regex },
            { code: regex },
            { department: regex },
        ];
    }
    
    if (department) {
        filter.department = department;
    }
    
    const courses = await Course.find(filter)
        .sort({ usageCount: -1, name: 1 })
        .limit(limit)
        .lean();
    
    return courses;
}

// Get popular courses (most used)
export async function getPopularCourses(limit: number = 10, department?: string) {
    const filter: Record<string, unknown> = { status: 'approved' };
    
    if (department) {
        filter.department = department;
    }
    
    const courses = await Course.find(filter)
        .sort({ usageCount: -1 })
        .limit(limit)
        .lean();
    
    return courses;
}

// Increment usage count when a user adds a course from the database
export async function incrementCourseUsage(courseId: string) {
    await Course.findByIdAndUpdate(courseId, {
        $inc: { usageCount: 1 },
    });
}

// Submit a course suggestion (creates a pending course)
export async function submitCourseSuggestion(userId: string, data: {
    name: string;
    code?: string;
    credits: number;
    department?: string;
}) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    // Check if an approved course with this code already exists
    if (data.code) {
        const existingCourse = await Course.findOne({
            code: { $regex: new RegExp(`^${data.code}$`, 'i') },
            status: 'approved',
        });
        
        if (existingCourse) {
            throw new Error('A course with this code already exists in the database');
        }
    }
    
    // Check if there's already a pending suggestion with the same code
    if (data.code) {
        const existingSuggestion = await Course.findOne({
            code: { $regex: new RegExp(`^${data.code}$`, 'i') },
            status: 'pending',
        });
        
        if (existingSuggestion) {
            throw new Error('A suggestion for this course is already pending review');
        }
    }
    
    const suggestion = new Course({
        name: data.name,
        code: data.code || `CUSTOM-${Date.now()}`,
        credits: data.credits,
        department: data.department || 'Other',
        status: 'pending',
        createdBy: userId,
        usageCount: 0,
    });
    
    await suggestion.save();
    
    return suggestion;
}

// Get pending suggestions (for admins)
export async function getPendingSuggestions(limit: number = 50) {
    const suggestions = await Course.find({ status: 'pending' })
        .populate('createdBy', 'username email')
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
    
    return suggestions;
}

// Approve a course suggestion (admin only)
export async function approveSuggestion(adminUserId: string, courseId: string) {
    const admin = await User.findById(adminUserId);
    if (!admin || !admin.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }
    
    if (course.status !== 'pending') {
        throw new Error('Course has already been reviewed');
    }
    
    course.status = 'approved';
    await course.save();
    
    return course;
}

// Reject a course suggestion (admin only)
export async function rejectSuggestion(adminUserId: string, courseId: string) {
    const admin = await User.findById(adminUserId);
    if (!admin || !admin.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }
    
    if (course.status !== 'pending') {
        throw new Error('Course has already been reviewed');
    }
    
    course.status = 'rejected';
    await course.save();
    
    return course;
}

// Get user's own suggestions
export async function getUserSuggestions(userId: string) {
    const suggestions = await Course.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .lean();
    
    return suggestions;
}

// Add a course to the database directly (admin only)
export async function addCourseToDatabase(adminUserId: string, data: Partial<CourseType>) {
    const admin = await User.findById(adminUserId);
    if (!admin || !admin.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
    }
    
    if (!data.name || !data.credits || !data.code) {
        throw new Error('Course name, code, and credits are required');
    }
    
    const existingCourse = await Course.findOne({
        code: { $regex: new RegExp(`^${data.code}$`, 'i') },
    });
    
    if (existingCourse) {
        throw new Error('A course with this code already exists');
    }
    
    const newCourse = new Course({
        name: data.name,
        code: data.code,
        credits: data.credits,
        department: data.department || 'Other',
        status: 'approved',
        usageCount: 0,
    });
    
    await newCourse.save();
    
    return newCourse;
}

// Get all courses for a specific department
export async function getCoursesByDepartment(department: string) {
    const courses = await Course.find({ department, status: 'approved' })
        .sort({ name: 1 })
        .lean();
    
    return courses;
}

// Get all unique departments
export async function getDepartments() {
    const departments = await Course.distinct('department', { status: 'approved' });
    return departments.filter(Boolean).sort();
}
