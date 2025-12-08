"use client";

import React, { useMemo } from 'react';
import CourseList from '../../components/courses/CourseList';
import AddCourse from '../../components/courses/AddCourse';
import { getWeightedAverage } from '../../lib/CoursesUtil';
import { useCourses } from '../../hooks/useCourses';

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useCourses();
  const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">My Courses</h1>
          <p className='text-gray-600 text-lg'>Manage your courses and track your academic progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CourseList isLoading={isLoading} />
          </div>

          {/* Sidebar - Add Course and Average */}
          <div className="flex flex-col gap-6">
            <AddCourse />
            
            {/* Average Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className='text-gray-700 font-semibold'>Weighted Average</h3>
              </div>
              <p className='text-4xl font-bold text-green-600 mb-2'>{(weightedAverage ?? 0).toFixed(2)}</p>
              <p className='text-gray-500 text-sm'>Based on {courses.filter(c => c._id).length} course{courses.filter(c => c._id).length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
