import { User } from '@/lib/models/UserModel';
import type { Course, Semester, GradeAttempt } from '@/types';
import { validateCourseName, validateCredits, validateGrade, validateSemester, VALIDATION_RULES } from '@/lib/validation';

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

    // Validate course name
    const nameValidation = validateCourseName(name);
    if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
    }

    // Validate credits
    const creditsValidation = validateCredits(credits);
    if (!creditsValidation.isValid) {
        throw new Error(creditsValidation.error);
    }

    // Validate grades if provided
    if (grades && grades.length > 0) {
        for (const attempt of grades) {
            const gradeValidation = validateGrade(attempt.grade);
            if (!gradeValidation.isValid) {
                throw new Error(VALIDATION_RULES.course.grade.messages.invalid);
            }
        }
    }

    // Validate semester if provided
    if (semester) {
        const semesterValidation = validateSemester(semester);
        if (!semesterValidation.isValid) {
            throw new Error(semesterValidation.error);
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

    // Validate course name if provided
    if (updatedCourseData.name !== undefined) {
        const nameValidation = validateCourseName(updatedCourseData.name);
        if (!nameValidation.isValid) {
            throw new Error(nameValidation.error);
        }
    }

    // Validate credits if provided
    if (updatedCourseData.credits !== undefined) {
        const creditsValidation = validateCredits(updatedCourseData.credits);
        if (!creditsValidation.isValid) {
            throw new Error(creditsValidation.error);
        }
    }

    // Validate grades if provided
    if (updatedCourseData.grades && updatedCourseData.grades.length > 0) {
        for (const attempt of updatedCourseData.grades) {
            const gradeValidation = validateGrade(attempt.grade);
            if (!gradeValidation.isValid) {
                throw new Error(VALIDATION_RULES.course.grade.messages.invalid);
            }
        }
    }

    // Validate semester if provided
    if (updatedCourseData.semester) {
        const semesterValidation = validateSemester(updatedCourseData.semester);
        if (!semesterValidation.isValid) {
            throw new Error(semesterValidation.error);
        }
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
