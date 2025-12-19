"use client";

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { UserContext } from '../../context/UserContext';
import { getDegreeProgress, getWeightedAverage, getFinalGrade, getCourseStatus } from '../../lib/CoursesUtil';
import { useCourses } from '@/hooks/useCourses';
import { User, Course } from '@/types';
import { DashboardCardSkeleton, StatsRowSkeleton } from '@/components/Skeleton';
import { FiBook, FiTrendingUp, FiBriefcase, FiAward, FiClock, FiCheckCircle, FiTarget } from 'react-icons/fi';

export default function DashboardPage() {
    const { data: courses = [], isLoading } = useCourses();
    const ctx = useContext(UserContext);
    const user = ctx?.user ?? null;
    const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
    const degreeProgress = useMemo(() => getDegreeProgress(user as User), [user]);

    // Calculate additional stats
    const completedCourses = useMemo(() => courses.filter((c: Course) => getFinalGrade(c) !== undefined).length, [courses]);
    const totalCredits = useMemo(() => courses.reduce((acc: number, c: Course) => acc + (c.credits || 0), 0), [courses]);
    const highestGrade = useMemo(() => {
        const grades = courses.filter((c: Course) => getFinalGrade(c) !== undefined).map((c: Course) => getFinalGrade(c) as number);
        return grades.length > 0 ? Math.max(...grades) : 0;
    }, [courses]);
    const recentCourses = useMemo(() => [...courses].reverse().slice(0, 3), [courses]);

    // Get grade color based on value
    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600';
        if (grade >= 80) return 'text-blue-600';
        if (grade >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Get progress bar color based on percentage
    const getProgressColor = (progress: number) => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-theme2 px-4 py-12">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-5xl font-bold text-gray-800 mb-2">Dashboard</h1>
                    <p className='text-gray-600 text-lg'>Welcome back, <span className="font-semibold text-theme3">{user?.username ?? 'student'}</span>!</p>
                    {user?.degree && user.degree.major && (
                        <p className='text-gray-600 text-lg mt-2'>Currently studying <span className="font-semibold text-theme3">{user.degree.major}</span></p>
                    )}
                </div>

                {/* Main Stats Cards */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <DashboardCardSkeleton />
                        <DashboardCardSkeleton />
                        <DashboardCardSkeleton />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Current Average Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FiTrendingUp className="text-green-600 text-xl" />
                                </div>
                                <h3 className='text-gray-700 font-semibold'>Weighted Average</h3>
                            </div>
                            <p className={`text-4xl font-bold mb-4 ${getGradeColor(weightedAverage ?? 0)}`}>
                                {(weightedAverage ?? 0).toFixed(2)}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div 
                                    className={`h-2 rounded-full ${getProgressColor(weightedAverage ?? 0)}`}
                                    style={{ width: `${Math.min(weightedAverage ?? 0, 100)}%` }}
                                ></div>
                            </div>
                            <Link href="/courses" className="inline-flex items-center text-theme3 hover:text-blue-600 font-medium transition-colors">
                                View Courses →
                            </Link>
                        </div>

                        {/* Degree Progress Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FiTarget className="text-blue-600 text-xl" />
                                </div>
                                <h3 className='text-gray-700 font-semibold'>Degree Progress</h3>
                            </div>
                            <p className='text-4xl font-bold text-blue-600 mb-4'>{(degreeProgress ?? 0).toFixed(1)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div 
                                    className={`h-2 rounded-full ${getProgressColor(degreeProgress ?? 0)}`}
                                    style={{ width: `${Math.min(degreeProgress ?? 0, 100)}%` }}
                                ></div>
                            </div>
                            <Link href="/study-plan" className="inline-flex items-center text-theme3 hover:text-blue-600 font-medium transition-colors">
                                Study Plan →
                            </Link>
                        </div>

                        {/* Career Plan Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FiBriefcase className="text-purple-600 text-xl" />
                                </div>
                                <h3 className='text-gray-700 font-semibold'>Career Planning</h3>
                            </div>
                            <p className='text-lg text-gray-600 mb-4'>Find jobs matching your skills and degree</p>
                            <Link href="/career-plan" className="inline-flex items-center text-theme3 hover:text-blue-600 font-medium transition-colors">
                                Explore Careers →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Secondary Stats Row */}
                {isLoading ? (
                    <div className="mb-8">
                        <StatsRowSkeleton />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                            <div className="flex justify-center mb-2">
                                <FiBook className="text-theme3 text-2xl" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{courses.length}</p>
                            <p className="text-gray-500 text-sm">Total Courses</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                            <div className="flex justify-center mb-2">
                                <FiCheckCircle className="text-green-500 text-2xl" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{completedCourses}</p>
                            <p className="text-gray-500 text-sm">Completed</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                            <div className="flex justify-center mb-2">
                                <FiClock className="text-yellow-500 text-2xl" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{totalCredits}</p>
                            <p className="text-gray-500 text-sm">Total Credits</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                            <div className="flex justify-center mb-2">
                                <FiAward className="text-purple-500 text-2xl" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{highestGrade}</p>
                            <p className="text-gray-500 text-sm">Highest Grade</p>
                        </div>
                    </div>
                )}

                {/* Recent Courses & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Courses */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiBook className="text-theme3" />
                            Recent Courses
                        </h3>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : recentCourses.length > 0 ? (
                            <div className="space-y-3">
                                {recentCourses.map((course: Course) => {
                                    const finalGrade = getFinalGrade(course);
                                    const status = getCourseStatus(course.semester);
                                    return (
                                    <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">{course.name}</p>
                                            <p className="text-sm text-gray-500">{course.credits} credits</p>
                                        </div>
                                        {status === 'completed' && finalGrade !== undefined ? (
                                            <span className={`text-lg font-bold ${getGradeColor(finalGrade)}`}>
                                                {finalGrade}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">{status === 'in-progress' ? 'In Progress' : 'Planned'}</span>
                                        )}
                                    </div>
                                    );
                                })}
                                <Link href="/courses" className="block text-center text-theme3 hover:text-blue-600 font-medium py-2 transition-colors">
                                    View All Courses →
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No courses added yet</p>
                                <Link href="/courses" className="inline-flex items-center gap-2 bg-theme3 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                    Add Your First Course
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiTarget className="text-theme3" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link href="/courses" className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <FiBook className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Add New Course</p>
                                    <p className="text-sm text-gray-500">Track your academic progress</p>
                                </div>
                            </Link>
                            <Link href="/study-plan" className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <FiClock className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Plan Your Studies</p>
                                    <p className="text-sm text-gray-500">Organize your semester schedule</p>
                                </div>
                            </Link>
                            <Link href="/career-plan" className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <FiBriefcase className="text-purple-600 text-xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Explore Careers</p>
                                    <p className="text-sm text-gray-500">Find jobs matching your skills</p>
                                </div>
                            </Link>
                            <Link href="/profile" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                    <FiAward className="text-gray-600 text-xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Update Profile</p>
                                    <p className="text-sm text-gray-500">Manage your account settings</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
