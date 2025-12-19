"use client";

import React, { useState, useMemo, useContext } from 'react';
import type { CourseFormData, SemesterTerm, Course } from '@/types';
import { useAddCourse, useCourses, useDeleteCourse } from '@/hooks/useCourses';
import { getCourseStatus } from '@/lib/CoursesUtil';
import { CURRENT_YEAR, TERM_OPTIONS, getStatusDisplay } from '@/lib/constants';
import { UserContext } from '@/context/UserContext';
import { FiX, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OnboardingAddCourseProps {
  onCourseAdded?: () => void;
}

export default function OnboardingAddCourse({ onCourseAdded }: OnboardingAddCourseProps) {
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  
  // Get year options from user's start and expected graduation years
  const startYear = user?.startYear ?? CURRENT_YEAR;
  const endYear = user?.expectedGraduationYear ?? CURRENT_YEAR + 4;
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [startYear, endYear]);

  const [formData, setFormData] = useState<CourseFormData>({ 
    name: '', 
    credits: '',
    semester: { year: startYear, term: 'Fall' },
    grades: [],
  });
  const [gradeInput, setGradeInput] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; grade?: string; credits?: string; general?: string }>({});
  const addCourseMutation = useAddCourse();
  const deleteCourseMutation = useDeleteCourse();
  const { data: courses = [] } = useCourses();

  const inferredStatus = useMemo(() => getCourseStatus(formData.semester), [formData.semester]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'semesterYear') {
      setFormData({ 
        ...formData, 
        semester: { ...formData.semester!, year: Number(value) } 
      });
    } else if (name === 'semesterTerm') {
      setFormData({ 
        ...formData, 
        semester: { ...formData.semester!, term: value as SemesterTerm } 
      });
    } else if (name === 'name') {
      setFormData({ ...formData, [name]: value });
    } else {
      const processedValue = value === '' ? '' : Number(value);
      setFormData({ ...formData, [name]: processedValue });
    }
    
    if (errors?.[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const onGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGradeInput(e.target.value);
    if (errors?.grade) {
      setErrors({ ...errors, grade: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (inferredStatus === 'completed') {
      if (gradeInput === '') {
        newErrors.grade = 'Grade is required for completed courses';
      } else {
        const grade = Number(gradeInput);
        if (isNaN(grade) || grade < 0 || grade > 100) {
          newErrors.grade = 'Grade must be between 0 and 100';
        }
      }
    }

    const credit = Number(formData.credits);
    if (isNaN(credit) || credit <= 0) {
      newErrors.credits = 'Course credit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors ?? {}).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    const courseData: Partial<Course> = {
      name: formData.name,
      credits: formData.credits as number,
      semester: formData.semester,
    };

    if (inferredStatus === 'completed' && gradeInput !== '') {
      courseData.grades = [{ grade: Number(gradeInput), isFinal: true, label: 'Final' }];
    }

    addCourseMutation.mutate(
      courseData,
      {
        onSuccess: () => {
          setFormData({ 
            name: '', 
            credits: '',
            semester: { year: startYear, term: 'Fall' },
            grades: [],
          });
          setGradeInput('');
          setErrors({});
          toast.success('Course added!');
          onCourseAdded?.();
        },
        onError: (err: unknown) => {
          const errorResponse = err as { response?: { data?: { message?: string } } };
          const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to add course.';
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
      }
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => {
        toast.success('Course removed!');
      },
      onError: () => {
        toast.error('Failed to remove course');
      }
    });
  };

  const statusDisplay = getStatusDisplay(inferredStatus);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Add Course Form */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-md border border-theme3/10">
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <FiBook className="text-theme3" />
          Add a Course
        </h3>
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
          {errors?.general && (
            <div className='p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm'>
              {errors.general}
            </div>
          )}

          <div>
            <label className='block text-gray-700 text-sm font-semibold mb-1'>Course Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              placeholder="e.g., Calculus I"
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 text-sm ${
                errors?.name ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors?.name && <p className='text-red-600 text-xs mt-1'>{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className='block text-gray-700 text-sm font-semibold mb-1'>Term</label>
              <select
                name="semesterTerm"
                value={formData.semester?.term || 'Fall'}
                onChange={onChange}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700 text-sm"
              >
                {TERM_OPTIONS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-gray-700 text-sm font-semibold mb-1'>Year</label>
              <select
                name="semesterYear"
                value={formData.semester?.year || startYear}
                onChange={onChange}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700 text-sm"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>

          {inferredStatus === 'completed' && (
            <div>
              <label className='block text-gray-700 text-sm font-semibold mb-1'>Grade</label>
              <input 
                type="number" 
                value={gradeInput} 
                onChange={onGradeChange} 
                min={0} 
                max={100} 
                placeholder="0-100"
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 text-sm ${
                  errors?.grade ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
                }`}
              />
              {errors?.grade && <p className='text-red-600 text-xs mt-1'>{errors.grade}</p>}
            </div>
          )}

          <div>
            <label className='block text-gray-700 text-sm font-semibold mb-1'>Credits</label>
            <input 
              type="number" 
              name="credits" 
              value={formData.credits === '' ? '' : (formData.credits ?? '')} 
              onChange={onChange} 
              min={0} 
              step="0.5"
              placeholder="Credit hours"
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 text-sm ${
                errors?.credits ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors?.credits && <p className='text-red-600 text-xs mt-1'>{errors.credits}</p>}
          </div>

          <button 
            type="submit" 
            disabled={addCourseMutation.isPending}
            className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm'
          >
            {addCourseMutation.isPending ? 'Adding...' : 'Add Course'}
          </button>
        </form>
      </div>

      {/* Course List */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-md border border-theme3/10">
        <h3 className='text-lg font-bold text-gray-800 mb-4'>
          Your Courses ({courses.length})
        </h3>
        
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <FiBook size={40} className="mb-2 opacity-50" />
            <p className="text-sm">No courses yet</p>
            <p className="text-xs">Add your first course to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
            {courses.map((course) => {
              const status = getCourseStatus(course.semester);
              const statusStyle = getStatusDisplay(status);
              return (
                <div 
                  key={course._id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-theme3/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{course.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded ${statusStyle.color}`}>
                        {statusStyle.text}
                      </span>
                      <span>{course.credits} credits</span>
                      {course.semester && (
                        <span>• {course.semester.term} {course.semester.year}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => course._id && handleDeleteCourse(course._id)}
                    disabled={deleteCourseMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove course"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
