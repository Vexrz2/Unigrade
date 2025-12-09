import { User } from '@/lib/models/UserModel';
import { Course } from '@/types';

export async function addCourse(userId: string, data: { courseName: string; courseGrade: number; courseCredit: number }) {
    const { courseName, courseGrade, courseCredit } = data;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!courseName || typeof courseName !== 'string' || courseName.trim().length === 0) {
        throw new Error('Invalid course name');
    }

    if (isNaN(courseGrade) || courseGrade < 0 || courseGrade > 100) {
        throw new Error('Invalid course grade');
    }

    if (isNaN(courseCredit) || courseCredit <= 0) {
        throw new Error('Invalid course credit');
    }

    const newCourse = {
        courseName,
        courseGrade,
        courseCredit,
    };

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
