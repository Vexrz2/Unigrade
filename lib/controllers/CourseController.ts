import { User } from '@/lib/models/UserModel';
import { submitCourseSuggestion } from '@/lib/controllers/CourseDatabaseController';
import type { Semester, GradeAttempt } from '@/types';

interface CustomCourseData {
    name: string;
    code?: string;
    credits: number;
    department?: string;
}

interface AddCourseData {
    courseId?: string;           // Reference to existing Course in database
    customCourse?: CustomCourseData;  // Or create a new custom course (pending)
    semester: Semester;          // When taking the course
    grades?: GradeAttempt[];
}

export async function addCourse(userId: string, data: AddCourseData) {
    const { 
        courseId,
        customCourse,
        grades,
        semester,
    } = data;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Must provide either courseId or customCourse data
    if (!courseId && !customCourse) {
        throw new Error('Either courseId or custom course data is required');
    }
    
    // Determine the final course ID to use
    let finalCourseId = courseId;
    
    // If custom course data is provided, create a pending course first
    if (!courseId && customCourse) {
        if (!customCourse.name?.trim()) {
            throw new Error('Custom course name is required');
        }
        if (!customCourse.credits || customCourse.credits <= 0) {
            throw new Error('Custom course credits must be greater than 0');
        }
        
        // Create a pending course using the existing suggestion logic
        const pendingCourse = await submitCourseSuggestion(userId, {
            name: customCourse.name,
            code: customCourse.code,
            credits: customCourse.credits,
            department: customCourse.department,
        });
        
        finalCourseId = pendingCourse._id.toString();
    }
    
    if (!finalCourseId) {
        throw new Error('Failed to determine course ID');
    }

    // Validate semester
    if (!semester || !semester.year || !semester.term) {
        throw new Error('Semester is required');
    }
    if (!['Fall', 'Spring', 'Summer'].includes(semester.term)) {
        throw new Error('Invalid semester term');
    }

    // Validate grades if provided
    if (grades && grades.length > 0) {
        for (const attempt of grades) {
            if (isNaN(attempt.grade) || attempt.grade < 0 || attempt.grade > 100) {
                throw new Error('Invalid grade attempt value');
            }
        }
    }

    const newCourse = {
        course: finalCourseId,
        semester,
        grades: grades || [],
    };

    user.courses.push(newCourse);
    await user.save();
    
    // Populate the course reference and return
    await user.populate('courses.course');
    return user.courses[user.courses.length - 1];
}

export async function getCourses(userId: string) {
    const user = await User.findById(userId).populate('courses.course');
    if (!user) {
        throw new Error('User not found');
    }
    return user.courses;
}

export async function updateCourse(userId: string, courseId: string, updatedCourseData: Partial<{ course: string; semester: { year: number; term: string }; grades: GradeAttempt[] }>) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const course = user.courses.id(courseId);
    if (!course) {
        throw new Error('Course not found');
    }

    Object.assign(course, updatedCourseData);
    await user.save();
    
    // Return populated user
    await user.populate('courses.course');
    return user;
}

export async function removeCourse(userId: string, courseId: string) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const courseIndex = user.courses.findIndex((course) => courseId === course._id.toString());
    if (courseIndex === -1) {
        throw new Error('Course not found');
    }

    user.courses.splice(courseIndex, 1);
    await user.save();
    return courseIndex;
}
