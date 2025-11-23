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

export default function CourseList({ courses, removeCourse, isLoading, editCourse }: { courses: Course[]; removeCourse: (id: string) => void; isLoading: boolean; editCourse: (id: string, data: Partial<Course>) => void }) {
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
    <div className='w-2/3 my-4 self-center bg-theme1 shadow-md rounded'>
      <h1 className='text-5xl font-bold text-center mt-4'>My courses</h1>
      <div className='flex justify-between items-center m-3'>
        <div className="relative w-2/3">
          <div className="absolute inset-y-0 flex items-center ps-3 pointer-events-none">
            <IoIosSearch size={20} />
          </div>
          <input value={searchQuery} onChange={handleSearch} type="search" id="default-search" placeholder="Search courses..." className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50" />
        </div>
        <div className='sort-selector p-2 relative'>
          <div className='absolute inset-y-5 -start-4'><PiSortAscendingThin /></div>
          <select value={selectValue} onChange={handleSelect} className="block py-2.5 px-0 text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200">
            <option value="">Sort by</option>
            <option value="gradeDesc">Grade (high to low)</option>
            <option value="gradeAsc">Grade (low to high)</option>
            <option value="creditDesc">Course credit (high to low)</option>
            <option value="creditAsc">Course credit (low to high)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
      {isLoading ? <div className="p-8 text-center">Loading...</div> : <div className='flex flex-col overflow-y-auto border-2 m-3 mt-5 h-[700px]'>
        {courseList.length > 0 ? courseList.filter(course => course._id).map(course => (
          <div key={course._id} id={course._id} className='bg-gray-200 m-3 border rounded-md shadow-md flex focus:border-red-400 focus:border-4'>
            <div className='course-details flex flex-col'>
              <h3 className='font-bold text-xl px-4 py-4'>{course.courseName}</h3>
              <div className='flex px-4 space-x-5 py-1 mb-1'>
                <p className=' text-md '>Grade: {course.courseGrade}</p>
                <p className=' text-md'>Course credit: {course.courseCredit}</p>
              </div>
            </div>
            <div className='course-other flex flex-col ml-auto text-center'>
              <button onClick={() => removeCourse(course._id as string)} className='m-1 p-0.5 text-red-600 hover:bg-red-100  text-center text-md rounded-lg ml-auto mb-auto'>
                <TiDelete size={20} />
              </button>
              <button onClick={() => handleEdit(course)} className='m-1 p-0.5 text-gray-600 hover:bg-gray-100 text-center text-md rounded-lg ml-auto mt-auto'>
                <BiEdit size={20} />
              </button>
              <div hidden={worstCourse._id !== course._id || getMaxImprovement(courses) === 0} className='ml-auto bg-red-200 p-1 rounded'>
                <span>Your worst course: lowers average by </span>
                <span className='font-bold'>{maxImprovement.toFixed(2)}</span>
                <span> points.</span>
              </div>
            </div>
          </div>
        )) : <p className='text-xl text-center'>No courses match your query</p>}
      </div>}
      {selectedCourse ? <EditCourseModal isOpen={editCourseModal.isOpen} onClose={editCourseModal.closeModal} editCourse={editCourse} currentCourse={selectedCourse} /> : null}
    </div>
  );
}
