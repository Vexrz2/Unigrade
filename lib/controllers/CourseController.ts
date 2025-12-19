import { User } from '@/lib/models/UserModel';
import type { Course, Semester, GradeAttempt } from '@/types';

interface AddCourseData {
    name: string;
    credits: number;
    grades?: GradeAttempt[];
    semester?: Semester;
}

export async function addCourse(userId: string, data: AddCourseData) {
    const { 
        name, 
        credits, 
        grades,
        semester,
    } = data;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Invalid course name');
    }

    if (isNaN(credits) || credits <= 0) {
        throw new Error('Invalid course credit');
    }

    // Validate grades if provided
    if (grades && grades.length > 0) {
        for (const attempt of grades) {
            if (isNaN(attempt.grade) || attempt.grade < 0 || attempt.grade > 100) {
                throw new Error('Invalid grade attempt value');
            }
        }
    }

    // Validate semester if provided
    if (semester) {
        if (!semester.year || !semester.term) {
            throw new Error('Invalid semester format');
        }
        if (!['Fall', 'Spring', 'Summer'].includes(semester.term)) {
            throw new Error('Invalid semester term');
        }
    }

    const newCourse: Partial<Course> = {
        name,
        credits,
    };

    // Add grade data
    if (grades && grades.length > 0) {
        newCourse.grades = grades;
    }

    if (semester) {
        newCourse.semester = semester;
    }

    user.courses.push(newCourse);
    await user.save();
    return newCourse;
}

export async function getCourses(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.courses;
}

export async function updateCourse(userId: string, courseId: string, updatedCourseData: Partial<Course>) {
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
