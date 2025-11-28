"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import CourseList from '../../components/courses/CourseList';
import AddCourse from '../../components/courses/AddCourse';
import { getWeightedAverage } from '../../lib/CoursesUtil';
import type { Course } from '../../types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([{} as Course]);
  const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get('/courses/course-list');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addCourse = async (formData: Partial<Course>) => {
    try {
      await api.post('/courses/add-course', formData);
      fetchCourses();
      return { success: true };
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to add course. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const editCourse = async (courseId: string, formData: Partial<Course>) => {
    try {
      await api.patch(`/courses/update-course/${courseId}`, formData);
      fetchCourses();
      return { success: true };
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to update course. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const removeCourse = async (courseId: string) => {
    try {
      await api.delete('/courses/delete-course', { data: { courseId } });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-linear-to-br from-theme2 to-theme1 px-4 py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">My Courses</h1>
          <p className='text-gray-600 text-lg'>Manage your courses and track your academic progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CourseList courses={courses} removeCourse={removeCourse} isLoading={isLoading} editCourse={editCourse} />
          </div>

          {/* Sidebar - Add Course and Average */}
          <div className="flex flex-col gap-6">
            <AddCourse addCourse={addCourse} />
            
            {/* Average Card */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
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
