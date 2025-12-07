"use client";

import React, { useMemo, useState } from 'react';
import { getMaxImprovement, getWorstCourse } from '../../lib/CoursesUtil';
import { PiSortAscendingThin } from 'react-icons/pi';
import { IoIosSearch } from 'react-icons/io';
import { TiDelete } from 'react-icons/ti';
import { BiEdit } from 'react-icons/bi';
import EditCourseModal from './EditCourseModal';
import { useModal } from '../../hooks/useModal';
import { useCourses, useDeleteCourse } from '../../hooks/useCourses';
import type { Course } from '../../types';
import toast from 'react-hot-toast';
import { CourseListSkeleton } from '../Skeleton';

export default function CourseList({ isLoading }: { isLoading: boolean }) {
  const { data: courses = [] } = useCourses();
  const deleteCourseMutation = useDeleteCourse();
  const [selectValue, setSelectValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const editCourseModal = useModal();
  const worstCourse = useMemo(() => getWorstCourse(courses), [courses]);
  const maxImprovement = useMemo(() => getMaxImprovement(courses), [courses]);

  // Derive filtered and sorted course list from courses prop, searchQuery, and selectValue
  const courseList = useMemo<Course[]>(() => {
    let filtered: Course[] = (courses ?? []).filter(course => course._id);
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((course) => 
        course.courseName && course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sort
    switch (selectValue) {
      case "gradeDesc":
        return [...filtered].sort((a, b) => (b.courseGrade ?? 0) - (a.courseGrade ?? 0));
      case "gradeAsc":
        return [...filtered].sort((a, b) => (a.courseGrade ?? 0) - (b.courseGrade ?? 0));
      case "creditDesc":
        return [...filtered].sort((a, b) => (b.courseCredit ?? 0) - (a.courseCredit ?? 0));
      case "creditAsc":
        return [...filtered].sort((a, b) => (a.courseCredit ?? 0) - (b.courseCredit ?? 0));
      case "alphabetical":
        return [...filtered].sort((a, b) => (a.courseName ?? '').localeCompare(b.courseName ?? ''));
      default:
        return filtered;
    }
  }, [courses, searchQuery, selectValue]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    editCourseModal.openModal();
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-transparent'>
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-4'>
          <div className="relative w-full sm:w-2/3">
            <div className="absolute inset-y-0 flex items-center ps-3 pointer-events-none text-gray-400">
              <IoIosSearch size={20} />
            </div>
            <input 
              value={searchQuery} 
              onChange={handleSearch} 
              type="search" 
              id="default-search" 
              placeholder="Search courses..." 
              className="block w-full p-3 ps-10 text-sm text-gray-900 border-2 border-gray-200 rounded-lg bg-white focus:border-theme3 focus:outline-none transition-colors" 
            />
          </div>
          <div className='sort-selector relative w-full sm:w-auto'>
            <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400'>
              <PiSortAscendingThin size={20} />
            </div>
            <select 
              value={selectValue} 
              onChange={handleSelect} 
              className="block w-full sm:w-auto py-3 pl-10 pr-8 text-sm text-gray-700 border-2 border-gray-200 rounded-lg bg-white focus:border-theme3 focus:outline-none transition-colors appearance-none"
            >
              <option value="">Sort by</option>
              <option value="gradeDesc">Grade (high to low)</option>
              <option value="gradeAsc">Grade (low to high)</option>
              <option value="creditDesc">Course credit (high to low)</option>
              <option value="creditAsc">Course credit (low to high)</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>
      {isLoading ? (
        <CourseListSkeleton count={5} />
      ) : (
        <div className='flex flex-col overflow-y-auto border-2 border-gray-100 rounded-lg h-[700px] p-2'>
          {courseList.length > 0 ? courseList.filter(course => course._id).map(course => (
            <div key={course._id} id={course._id} className='bg-gray-50 hover:bg-gray-100:bg-gray-700 m-2 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between transition-colors'>
              <div className='course-details flex flex-col flex-1'>
                <h3 className='font-bold text-xl text-gray-800 mb-2'>{course.courseName}</h3>
                <div className='flex flex-wrap gap-4 text-gray-600'>
                  <p className='text-md font-medium'>Grade: <span className='font-semibold text-gray-800'>{course.courseGrade}</span></p>
                  <p className='text-md font-medium'>Credit: <span className='font-semibold text-gray-800'>{course.courseCredit}</span></p>
                </div>
                {worstCourse._id === course._id && getMaxImprovement(courses) > 0 && (
                  <div className='mt-2 bg-red-50 border-l-4 border-red-500 p-2 rounded'>
                    <span className='text-sm text-red-700'>
                      Your worst course: lowers average by <span className='font-bold'>{maxImprovement.toFixed(2)}</span> points.
                    </span>
                  </div>
                )}
              </div>
              <div className='course-actions flex flex-col gap-2 ml-4'>
                <button 
                  onClick={() => handleEdit(course)} 
                  className='p-2 text-theme3 hover:bg-theme3 hover:text-white text-center rounded-lg transition-colors'
                  title="Edit course"
                >
                  <BiEdit size={20} />
                </button>
                <button 
                  onClick={() => {
                    if (course._id) {
                      deleteCourseMutation.mutate(course._id, {
                        onSuccess: () => toast.success('Course deleted'),
                        onError: () => toast.error('Failed to delete course'),
                      });
                    }
                  }} 
                  className='p-2 text-red-600 hover:bg-red-100:bg-red-900/30 text-center rounded-lg transition-colors'
                  title="Delete course"
                  disabled={deleteCourseMutation.isPending}
                >
                  <TiDelete size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className='text-xl text-gray-600'>No courses match your query</p>
            </div>
          )}
        </div>
      )}
      {selectedCourse ? <EditCourseModal key={selectedCourse._id} isOpen={editCourseModal.isOpen} onClose={editCourseModal.closeModal} currentCourse={selectedCourse} /> : null}
    </div>
  );
}
