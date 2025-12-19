"use client";

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiChevronLeft, FiChevronRight, FiMenu, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';
import type { Course, Semester, SemesterTerm } from '@/types';
import { useEditCourse } from '@/hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { getCourseStatus, getFinalGrade, getSemesterKey } from '@/lib/CoursesUtil';
import toast from 'react-hot-toast';

interface SemesterTimelineProps {
  courses: Course[];
}

// Helper to parse semester key
const parseSemesterKey = (key: string): Semester | null => {
  if (key === 'unassigned') return null;
  const [year, term] = key.split('-');
  return { year: Number(year), term: term as SemesterTerm };
};

// Helper to format semester
const formatSemester = (semester?: Semester | null) => {
  if (!semester) return 'Unassigned';
  return `${semester.term} ${semester.year}`;
};

// Helper to get all semesters in range
const getSemesterRange = (startYear: number, endYear: number): Semester[] => {
  const semesters: Semester[] = [];
  const terms: SemesterTerm[] = ['Spring', 'Summer', 'Fall'];
  
  for (let year = startYear; year <= endYear; year++) {
    for (const term of terms) {
      semesters.push({ year, term });
    }
  }
  
  return semesters;
};

// Helper to get status badge styles
const getStatusStyle = (status?: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: FiCheckCircle };
    case 'in-progress':
      return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', icon: FiClock };
    case 'planned':
      return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', icon: FiTarget };
    default:
      return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', icon: FiTarget };
  }
};

// Sortable Course Card Component
function SortableCourseCard({ course }: { course: Course }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const courseStatus = getCourseStatus(course.semester);
  const statusStyle = getStatusStyle(courseStatus);
  const StatusIcon = statusStyle.icon;
  const finalGrade = getFinalGrade(course);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 mb-2 rounded-lg border ${statusStyle.bg} ${statusStyle.border} cursor-grab active:cursor-grabbing touch-none`}
    >
      <div className="text-gray-400 hover:text-gray-600">
        <FiMenu size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate text-sm">{course.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <StatusIcon size={12} className={statusStyle.text} />
          <span>{course.credits} credits</span>
          {courseStatus === 'completed' && finalGrade !== undefined && (
            <span>• Grade: {finalGrade}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Course Card for Drag Overlay
function CourseCardOverlay({ course }: { course: Course }) {
  const courseStatus = getCourseStatus(course.semester);
  const statusStyle = getStatusStyle(courseStatus);
  const StatusIcon = statusStyle.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border shadow-lg ${statusStyle.bg} ${statusStyle.border} cursor-grabbing`}>
      <div className="text-gray-400">
        <FiMenu size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate text-sm">{course.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <StatusIcon size={12} className={statusStyle.text} />
          <span>{course.credits} credits</span>
        </div>
      </div>
    </div>
  );
}

// Droppable zone for empty semester columns
function DroppableEmptyZone({ semesterKey }: { semesterKey: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: semesterKey,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
        isOver 
          ? 'border-theme3 bg-blue-50' 
          : 'border-gray-200'
      }`}
    >
      <p className={`text-sm ${isOver ? 'text-theme3' : 'text-gray-400'}`}>
        {isOver ? 'Drop here!' : 'Drop courses here'}
      </p>
    </div>
  );
}

// Semester Column Component
function SemesterColumn({ 
  semester, 
  courses, 
  isCurrentSemester,
  semesterKey,
}: { 
  semester: Semester | null; 
  courses: Course[];
  isCurrentSemester?: boolean;
  semesterKey: string;
}) {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = courses.filter(c => getCourseStatus(c.semester) === 'completed').reduce((sum, c) => sum + c.credits, 0);

  return (
    <div 
      className={`shrink-0 w-64 rounded-lg border-2 ${
        isCurrentSemester 
          ? 'border-theme3 bg-blue-50/50' 
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Semester Header */}
      <div className={`p-3 border-b ${isCurrentSemester ? 'border-theme3/30' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">{formatSemester(semester)}</h4>
          {isCurrentSemester && (
            <span className="text-xs bg-theme3 text-white px-2 py-0.5 rounded">Current</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {totalCredits} credits ({completedCredits} completed)
        </p>
      </div>

      {/* Courses */}
      <div className="p-2 min-h-[200px]">
        <SortableContext items={courses.map(c => c._id!)} strategy={verticalListSortingStrategy}>
          {courses.length > 0 ? (
            courses.map(course => (
              <SortableCourseCard key={course._id} course={course} />
            ))
          ) : (
            <DroppableEmptyZone semesterKey={semesterKey} />
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function SemesterTimeline({ courses }: SemesterTimelineProps) {
  const editCourseMutation = useEditCourse();
  const queryClient = useQueryClient();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Determine year range from courses
  const { startYear, endYear, currentSemester } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // Determine current semester based on month
    let currentTerm: SemesterTerm = 'Fall';
    if (currentMonth >= 0 && currentMonth < 5) currentTerm = 'Spring';
    else if (currentMonth >= 5 && currentMonth < 8) currentTerm = 'Summer';
    
    const years = courses
      .filter(c => c.semester)
      .map(c => c.semester!.year);
    
    const minYear = years.length > 0 ? Math.min(...years, currentYear) : currentYear - 2;
    const maxYear = years.length > 0 ? Math.max(...years, currentYear) : currentYear + 2;
    
    return {
      startYear: minYear,
      endYear: Math.max(maxYear, currentYear + 2),
      currentSemester: { year: currentYear, term: currentTerm },
    };
  }, [courses]);

  // Generate all semesters in range
  const allSemesters = useMemo(() => getSemesterRange(startYear, endYear), [startYear, endYear]);

  // Group courses by semester
  const coursesBySemester = useMemo(() => {
    const grouped = new Map<string, Course[]>();
    
    // Initialize with all semesters
    allSemesters.forEach(sem => {
      grouped.set(getSemesterKey(sem), []);
    });
    grouped.set('unassigned', []);
    
    // Assign courses to semesters
    courses.forEach(course => {
      const key = getSemesterKey(course.semester);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(course);
    });
    
    return grouped;
  }, [courses, allSemesters]);

  // Scroll state for horizontal scrolling
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  
  const scrollLeft = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find which semester a course belongs to
  const findSemesterForCourse = (courseId: string): string | null => {
    for (const [semesterKey, semesterCourses] of coursesBySemester.entries()) {
      if (semesterCourses.some(c => c._id === courseId)) {
        return semesterKey;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const course = courses.find(c => c._id === active.id);
    setActiveCourse(course || null);
  };

  const handleDragOver = () => {
    // Handle drag over for visual feedback if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCourse(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the course and its current semester
    const course = courses.find(c => c._id === activeId);
    if (!course) return;

    const currentSemesterKey = findSemesterForCourse(activeId);
    
    // Determine target semester
    // If dropped on another course, get that course's semester
    // If dropped on empty area, we need to detect which column
    let targetSemesterKey: string | null = null;
    
    // Check if dropped on another course
    const targetCourse = courses.find(c => c._id === overId);
    if (targetCourse) {
      targetSemesterKey = getSemesterKey(targetCourse.semester);
    } else {
      // Dropped on a semester column directly
      targetSemesterKey = overId;
    }

    // If semester changed, update the course
    if (targetSemesterKey && targetSemesterKey !== currentSemesterKey) {
      const newSemester = parseSemesterKey(targetSemesterKey);
      const queryKey = ['courses', 'list'];
      
      // Optimistic update - update cache immediately
      const previousCourses = queryClient.getQueryData<Course[]>(queryKey);
      
      queryClient.setQueryData<Course[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map(c => 
          c._id === activeId 
            ? { ...c, semester: newSemester || undefined }
            : c
        );
      });
      
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      queryClient.cancelQueries({ queryKey });
      
      editCourseMutation.mutate(
        {
          courseId: activeId,
          formData: { semester: newSemester || undefined }
        },
        {
          onSuccess: () => {
            toast.success(`Moved to ${formatSemester(newSemester)}`);
            // No need to invalidate - optimistic update is already applied
          },
          onError: () => {
            // Rollback on error
            queryClient.setQueryData(queryKey, previousCourses);
            toast.error('Failed to move course');
          }
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Semester Timeline</h2>
        <p className="text-sm text-gray-500">Drag courses to move between semesters</p>
      </div>

      <div className="relative">
        {/* Scroll buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Timeline Container */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={setScrollContainer}
            className="flex gap-4 overflow-x-auto px-10 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Unassigned column */}
            <SemesterColumn
              semester={null}
              courses={coursesBySemester.get('unassigned') || []}
              semesterKey="unassigned"
            />
            
            {/* Semester columns */}
            {allSemesters.map(semester => {
              const key = getSemesterKey(semester);
              const isCurrentSem = 
                semester.year === currentSemester.year && 
                semester.term === currentSemester.term;
              
              return (
                <SemesterColumn
                  key={key}
                  semester={semester}
                  courses={coursesBySemester.get(key) || []}
                  isCurrentSemester={isCurrentSem}
                  semesterKey={key}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeCourse ? <CourseCardOverlay course={activeCourse} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
            <span className="text-gray-600">Planned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
