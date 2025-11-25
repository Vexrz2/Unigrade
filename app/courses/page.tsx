"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import CourseList from '../../components/courses/CourseList';
import AddCourse from '../../components/courses/AddCourse';
import { getWeightedAverage } from '../../lib/CoursesUtil';
import type { Course } from '../../types';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([{} as Course]);
  const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
  const router = useRouter();
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
    } catch (err) {
      console.error(err);
    }
  };

  const editCourse = async (courseId: string, formData: Partial<Course>) => {
    try {
      await api.patch(`/courses/update-course/${courseId}`, formData);
      fetchCourses();
    } catch (err) {
      console.error(err);
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
    <div className='courses-page flex flex-wrap w-10/12 mx-auto items-center'>
      <CourseList courses={courses} removeCourse={removeCourse} isLoading={isLoading} editCourse={editCourse} />
      <div className='flex flex-col w-1/3 px-4'>
        <AddCourse addCourse={addCourse} />
        <div className=''>
          <p className=' text-xl text-center'>Average: </p>
          <p className='text-green-700 text-4xl font-bold text-center'>{(weightedAverage ?? 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
