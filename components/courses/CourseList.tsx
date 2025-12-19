"use client";

import React, { useMemo, useState } from 'react';
import { PiSortAscendingThin } from 'react-icons/pi';
import { IoIosSearch } from 'react-icons/io';
import { TiDelete } from 'react-icons/ti';
import { BiEdit } from 'react-icons/bi';
import { FiCalendar, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';
import EditCourseModal from './EditCourseModal';
import { useModal } from '../../hooks/useModal';
import { useCourses, useDeleteCourse } from '../../hooks/useCourses';
import type { UserCourse, Semester, CourseRuntimeStatus } from '../../types';
import { getCurrentSemester, getCourseRuntimeStatus } from '../../types';
import toast from 'react-hot-toast';
import { CourseListSkeleton } from '../Skeleton';

// Helper to format semester
const formatSemester = (semester?: Semester) => {
  if (!semester) return 'No semester';
  return `${semester.term} ${semester.year}`;
};

// Helper to get the final grade from grades array
const getFinalGrade = (course: UserCourse): number | undefined => {
  if (!course.grades || course.grades.length === 0) return undefined;
  const finalGrade = course.grades.find(g => g.isFinal);
  return finalGrade?.grade ?? course.grades[course.grades.length - 1]?.grade;
};

// Helper to get status badge styles
const getStatusBadge = (status: CourseRuntimeStatus) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: FiCheckCircle, label: 'Completed' };
    case 'in-progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiClock, label: 'In Progress' };
    case 'planned':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FiTarget, label: 'Planned' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiTarget, label: 'Unknown' };
  }
};

// Helper to sort by semester
const semesterSortValue = (semester?: Semester): number => {
  if (!semester) return 0;
  const termOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
  return semester.year * 10 + (termOrder[semester.term] || 0);
};

export default function CourseList({ isLoading }: { isLoading: boolean }) {
  const { data: courses = [] } = useCourses();
  const deleteCourseMutation = useDeleteCourse();
  const [selectValue, setSelectValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<UserCourse | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'semester'>('list');
  const editCourseModal = useModal();
  
  const currentSemester = useMemo(() => getCurrentSemester(), []);

  // Derive filtered and sorted course list
  const courseList = useMemo<UserCourse[]>(() => {
    let filtered: UserCourse[] = (courses ?? []).filter((course: UserCourse) => course._id);
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((c) => 
        (c.course?.name && c.course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.course?.code && c.course.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((course) => {
        const status = getCourseRuntimeStatus(course, currentSemester);
        return status === statusFilter;
      });
    }
    
    // Apply sort
    switch (selectValue) {
      case "gradeDesc":
        return [...filtered].sort((a, b) => (getFinalGrade(b) ?? 0) - (getFinalGrade(a) ?? 0));
      case "gradeAsc":
        return [...filtered].sort((a, b) => (getFinalGrade(a) ?? 0) - (getFinalGrade(b) ?? 0));
      case "creditDesc":
        return [...filtered].sort((a, b) => (b.course?.credits ?? 0) - (a.course?.credits ?? 0));
      case "creditAsc":
        return [...filtered].sort((a, b) => (a.course?.credits ?? 0) - (b.course?.credits ?? 0));
      case "alphabetical":
        return [...filtered].sort((a, b) => (a.course?.name ?? '').localeCompare(b.course?.name ?? ''));
      case "semesterDesc":
        return [...filtered].sort((a, b) => semesterSortValue(b.semester) - semesterSortValue(a.semester));
      case "semesterAsc":
        return [...filtered].sort((a, b) => semesterSortValue(a.semester) - semesterSortValue(b.semester));
      default:
        return filtered;
    }
  }, [courses, searchQuery, statusFilter, selectValue, currentSemester]);

  // Group courses by semester for semester view
  const coursesBySemester = useMemo(() => {
    const grouped = new Map<string, UserCourse[]>();
    courseList.forEach(course => {
      const key = course.semester 
        ? `${course.semester.year}-${course.semester.term}` 
        : 'unassigned';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(course);
    });
    
    // Sort keys by semester
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      if (a[0] === 'unassigned') return 1;
      if (b[0] === 'unassigned') return -1;
      const [yearA, termA] = a[0].split('-');
      const [yearB, termB] = b[0].split('-');
      const termOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
      const valA = Number(yearA) * 10 + (termOrder[termA as keyof typeof termOrder] || 0);
      const valB = Number(yearB) * 10 + (termOrder[termB as keyof typeof termOrder] || 0);
      return valB - valA; // Most recent first
    });
    
    return sortedEntries;
  }, [courseList]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleEdit = (course: UserCourse) => {
    setSelectedCourse(course);
    editCourseModal.openModal();
  };

  const renderCourseCard = (course: UserCourse) => {
    const status = getCourseRuntimeStatus(course, currentSemester);
    const statusBadge = getStatusBadge(status);
    const StatusIcon = statusBadge.icon;
    const grade = getFinalGrade(course);

    return (
      <div key={course._id} id={course._id} className='bg-gray-50 hover:bg-gray-100 m-2 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between transition-colors'>
        <div className='course-details flex flex-col flex-1'>
          <div className="flex items-center gap-2 mb-2">
            <h3 className='font-bold text-xl text-gray-800'>{course.course?.code} - {course.course?.name}</h3>
          </div>
          
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              <StatusIcon size={12} />
              {statusBadge.label}
            </span>
            {course.semester && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                <FiCalendar size={12} />
                {formatSemester(course.semester)}
              </span>
            )}
          </div>
          
          {/* Course details */}
          <div className='flex flex-wrap gap-4 text-gray-600'>
            {grade !== undefined && (
              <p className='text-md font-medium'>Grade: <span className='font-semibold text-gray-800'>{grade}</span></p>
            )}
            <p className='text-md font-medium'>Credits: <span className='font-semibold text-gray-800'>{course.course?.credits}</span></p>
            {course.grades && course.grades.length > 1 && (
              <p className='text-md font-medium text-blue-600'>
                {course.grades.length} attempts
              </p>
            )}
          </div>
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
            className='p-2 text-red-600 hover:bg-red-100 text-center rounded-lg transition-colors'
            title="Delete course"
            disabled={deleteCourseMutation.isPending}
          >
            <TiDelete size={20} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-transparent'>
      <div className='mb-6'>
        <div className='flex flex-col gap-4 mb-4'>
          {/* Search and view mode toggle */}
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
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
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-theme3 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('semester')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'semester' 
                    ? 'bg-theme3 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Semester
              </button>
            </div>
          </div>
          
          {/* Filters row */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='sort-selector relative flex-1'>
              <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400'>
                <PiSortAscendingThin size={20} />
              </div>
              <select 
                value={selectValue} 
                onChange={handleSelect} 
                className="block w-full py-3 pl-10 pr-8 text-sm text-gray-700 border-2 border-gray-200 rounded-lg bg-white focus:border-theme3 focus:outline-none transition-colors appearance-none"
              >
                <option value="">Sort by</option>
                <option value="gradeDesc">Grade (high to low)</option>
                <option value="gradeAsc">Grade (low to high)</option>
                <option value="creditDesc">Course credit (high to low)</option>
                <option value="creditAsc">Course credit (low to high)</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="semesterDesc">Semester (newest first)</option>
                <option value="semesterAsc">Semester (oldest first)</option>
              </select>
            </div>
            <div className='status-filter relative flex-1'>
              <select 
                value={statusFilter} 
                onChange={handleStatusFilter} 
                className="block w-full py-3 px-4 text-sm text-gray-700 border-2 border-gray-200 rounded-lg bg-white focus:border-theme3 focus:outline-none transition-colors appearance-none"
              >
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="planned">Planned</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <CourseListSkeleton count={5} />
      ) : viewMode === 'list' ? (
        <div className='flex flex-col overflow-y-auto border-2 border-gray-100 rounded-lg h-[700px] p-2'>
          {courseList.length > 0 ? courseList.filter(course => course._id).map(course => renderCourseCard(course)) : (
            <div className="p-12 text-center">
              <p className='text-xl text-gray-600'>No courses match your query</p>
            </div>
          )}
        </div>
      ) : (
        <div className='flex flex-col overflow-y-auto border-2 border-gray-100 rounded-lg h-[700px] p-4'>
          {coursesBySemester.length > 0 ? coursesBySemester.map(([semesterKey, semesterCourses]) => (
            <div key={semesterKey} className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 px-2 py-1 bg-gray-100 rounded">
                {semesterKey === 'unassigned' ? 'Unassigned' : (() => {
                  const [year, term] = semesterKey.split('-');
                  return `${term} ${year}`;
                })()}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({semesterCourses.length} course{semesterCourses.length !== 1 ? 's' : ''})
                </span>
              </h3>
              {semesterCourses.map(course => renderCourseCard(course))}
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
