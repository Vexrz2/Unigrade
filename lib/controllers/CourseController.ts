import { User } from '@/lib/models/UserModel';
import type { Course, CourseStatus, CourseCategory, Semester, GradeAttempt } from '@/types';

interface AddCourseData {
    courseName: string;
    courseCredit: number;
    courseGrade?: number;
    grades?: GradeAttempt[];
    semester?: Semester;
    status?: CourseStatus;
    passed?: boolean | null;
    category?: CourseCategory;
}

export async function addCourse(userId: string, data: AddCourseData) {
    const { 
        courseName, 
        courseGrade, 
        courseCredit, 
        grades,
        semester,
        status = 'completed',
        passed,
        category = 'elective',
    } = data;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!courseName || typeof courseName !== 'string' || courseName.trim().length === 0) {
        throw new Error('Invalid course name');
    }

    if (isNaN(courseCredit) || courseCredit <= 0) {
        throw new Error('Invalid course credit');
    }

    // Validate grade only for completed courses
    if (status === 'completed') {
        // Check if we have grades array or legacy courseGrade
        const hasGrades = grades && grades.length > 0;
        const hasLegacyGrade = courseGrade !== undefined && courseGrade !== null;
        
        if (!hasGrades && !hasLegacyGrade) {
            throw new Error('Completed courses must have a grade');
        }
        
        if (hasLegacyGrade && (isNaN(courseGrade) || courseGrade < 0 || courseGrade > 100)) {
            throw new Error('Invalid course grade');
        }
        
        if (hasGrades) {
            for (const attempt of grades) {
                if (isNaN(attempt.grade) || attempt.grade < 0 || attempt.grade > 100) {
                    throw new Error('Invalid grade attempt value');
                }
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

    // Validate status
    if (!['planned', 'in-progress', 'completed'].includes(status)) {
        throw new Error('Invalid course status');
    }

    // Validate category if provided
    if (category && !['required', 'elective', 'general'].includes(category)) {
        throw new Error('Invalid course category');
    }

    const newCourse: Partial<Course> = {
        courseName,
        courseCredit,
        status,
        category,
    };

    // Add grade data
    if (grades && grades.length > 0) {
        newCourse.grades = grades;
        // Set courseGrade to the final grade for backward compatibility
        const finalGrade = grades.find(g => g.isFinal) || grades[grades.length - 1];
        newCourse.courseGrade = finalGrade.grade;
    } else if (courseGrade !== undefined) {
        newCourse.courseGrade = courseGrade;
        newCourse.grades = [{ grade: courseGrade, isFinal: true, label: 'Final' }];
    }

    if (semester) {
        newCourse.semester = semester;
    }

    if (passed !== undefined) {
        newCourse.passed = passed;
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
