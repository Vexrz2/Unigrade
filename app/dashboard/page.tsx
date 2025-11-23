"use client";

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { UserContext } from '../../context/UserContext';
import { getDegreeProgress, getWeightedAverage } from '../../lib/CoursesUtil';
import { useFetchCourses } from '../../hooks/useFetchCourses';

export default function DashboardPage() {
    const { courses, isLoading } = useFetchCourses();
    const ctx = useContext(UserContext);
    const user = ctx?.user ?? null;
    const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
    const degreeProgress = useMemo(() => getDegreeProgress(user as any), [user]);

    return (
        <div className="bg-theme1 shadow-md rounded py-8 flex flex-col w-2/3 mx-auto items-center">
            <h1 className="text-5xl font-bold mb-2 p-3 text-center">Dashboard</h1>
            <div>
                <p className='font-thin text-xl text-center mb-10'>Welcome back {user?.username ?? 'student'}!</p>
                <p className=' text-xl text-center mb-10'>{user?.degree && user.degree.major ? 'Currently studying ' + user.degree.major : 'Currently studying nothing'}</p>
            </div>
            {isLoading ? <div>Loading...</div> : <div className="flex justify-around items-center w-full">
                <div className="w-1/4 flex flex-col items-center">
                    <p className=' text-xl'>Current weighted average</p>
                    <p className='text-green-700 text-4xl font-bold mb-10'>{(weightedAverage ?? 0).toFixed(2)}</p>
                    <Link href="/courses" className="w-full text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center">Go to courses</Link>
                </div>
                <div className="w-1/4 flex flex-col items-center">
                    <p className=' text-xl'>Degree progress</p>
                    <p className='text-green-700 text-4xl font-bold mb-10'>{(degreeProgress ?? 0).toFixed(2)}%</p>
                    <Link href="/study-plan" className="w-full text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center">Study plan</Link>
                </div>
                <div className="w-1/4 flex flex-col items-center">
                    <p className=' text-xl'>Plan</p>
                    <p className='text-green-700 text-4xl font-bold mb-10'>Ahead</p>
                    <Link href="/career-plan" className="w-full text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center">Go to career planner</Link>
                </div>
            </div>}
        </div>
    );
}
