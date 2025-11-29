"use client";

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { UserContext } from '../../context/UserContext';
import { getDegreeProgress, getWeightedAverage } from '../../lib/CoursesUtil';
import { useCourses } from '@/hooks/useCourses';
import { User } from '@/types';

export default function DashboardPage() {
    const { data: courses = [], isLoading } = useCourses();
    const ctx = useContext(UserContext);
    const user = ctx?.user ?? null;
    const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
    const degreeProgress = useMemo(() => getDegreeProgress(user as User), [user]);

    return (
        <div className="min-h-screen flex flex-col items-center bg-linear-to-br from-theme2 to-theme1 px-4 py-12">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-2">Dashboard</h1>
                    <p className='text-gray-600 text-lg'>Welcome back, <span className="font-semibold text-theme3">{user?.username ?? 'student'}</span>!</p>
                    {user?.degree && user.degree.major && (
                        <p className='text-gray-600 text-lg mt-2'>Currently studying <span className="font-semibold text-theme3">{user.degree.major}</span></p>
                    )}
                </div>

                {/* Stats Cards */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-600">Loading dashboard...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Average Card */}
                        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className='text-gray-700 font-semibold'>Current Weighted Average</h3>
                            </div>
                            <p className='text-4xl font-bold text-green-600 mb-6'>{(weightedAverage ?? 0).toFixed(2)}</p>
                            <Link href="/courses" className="w-full text-center bg-theme3 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                View Courses
                            </Link>
                        </div>

                        {/* Degree Progress Card */}
                        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className='text-gray-700 font-semibold'>Degree Progress</h3>
                            </div>
                            <p className='text-4xl font-bold text-blue-600 mb-6'>{(degreeProgress ?? 0).toFixed(2)}%</p>
                            <Link href="/study-plan" className="w-full text-center bg-theme3 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                Study Plan
                            </Link>
                        </div>

                        {/* Career Plan Card */}
                        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className='text-gray-700 font-semibold'>Career Planning</h3>
                            </div>
                            <p className='text-4xl font-bold text-purple-600 mb-6'>Plan</p>
                            <Link href="/career-plan" className="w-full text-center bg-theme3 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                Career Planner
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
