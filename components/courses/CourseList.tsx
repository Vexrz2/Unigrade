"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { getMaxImprovement, getWorstCourse } from '../../lib/CoursesUtil';
import _ from 'lodash';
import { PiSortAscendingThin } from 'react-icons/pi';
import { IoIosSearch } from 'react-icons/io';
import { TiDelete } from 'react-icons/ti';
import { BiEdit } from 'react-icons/bi';
import EditCourseModal from './EditCourseModal';
import { useModal } from '../../hooks/useModal';
import type { Course } from '../../types';

export default function CourseList({ courses, removeCourse, isLoading, editCourse }: { courses: Course[]; removeCourse: (id: string) => void; isLoading: boolean; editCourse: (id: string, data: Partial<Course>) => Promise<{ success: boolean; error?: string }> }) {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selectValue, setSelectValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const editCourseModal = useModal();
  const worstCourse = useMemo(() => getWorstCourse(courses), [courses]);
  const maxImprovement = useMemo(() => getMaxImprovement(courses), [courses]);

  useEffect(() => {
    setCourseList(courses ?? []);
  }, [courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCourseList(_.filter(courses, (course) => _.includes(course.courseName, query)));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortMethod = e.target.value;
    setSelectValue(sortMethod);
    switch (sortMethod) {
      case "gradeDesc":
        setCourseList(_.sortBy(courses, ['courseGrade']).reverse());
        break;
      case "gradeAsc":
        setCourseList(_.sortBy(courses, ['courseGrade']));
        break;
      case "creditDesc":
        setCourseList(_.sortBy(courses, ['courseCredit']).reverse());
        break;
      case "creditAsc":
        setCourseList(_.sortBy(courses, ['courseCredit']));
        break;
      case "alphabetical":
        setCourseList(_.sortBy(courses, ['courseName']));
        break;
      default:
        setCourseList(courses);
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    editCourseModal.openModal();
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow'>
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
        <div className="p-12 text-center text-gray-600">Loading courses...</div>
      ) : (
        <div className='flex flex-col overflow-y-auto border-2 border-gray-100 rounded-lg h-[700px] p-2'>
          {courseList.length > 0 ? courseList.filter(course => course._id).map(course => (
            <div key={course._id} id={course._id} className='bg-gray-50 hover:bg-gray-100 m-2 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between transition-colors'>
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
                  onClick={() => removeCourse(course._id as string)} 
                  className='p-2 text-red-600 hover:bg-red-100 text-center rounded-lg transition-colors'
                  title="Delete course"
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
      {selectedCourse ? <EditCourseModal isOpen={editCourseModal.isOpen} onClose={editCourseModal.closeModal} editCourse={editCourse} currentCourse={selectedCourse} /> : null}
    </div>
  );
}
