"use client";

import React, { useState, useMemo } from 'react';
import type { CourseFormData, SemesterTerm, Course } from '@/types';
import { useAddCourse } from '@/hooks/useCourses';
import { getCourseStatus } from '@/lib/CoursesUtil';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
const TERM_OPTIONS: SemesterTerm[] = ['Fall', 'Spring', 'Summer'];

export default function AddCourse() {
  const [formData, setFormData] = useState<CourseFormData>({ 
    name: '', 
    credits: '',
    semester: { year: CURRENT_YEAR, term: 'Fall' },
    grades: [],
  });
  const [gradeInput, setGradeInput] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; grade?: string; credits?: string; general?: string }>({});
  const addCourseMutation = useAddCourse();

  // Infer status from semester
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
      // For number fields, preserve empty string, otherwise convert to number
      const processedValue = value === '' ? '' : Number(value);
      setFormData({ ...formData, [name]: processedValue });
    }
    
    // Clear error for this field when user starts typing
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

    // Grade is only required for completed courses (past semesters)
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

    // Add grade to grades array for completed courses
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
            semester: { year: CURRENT_YEAR, term: 'Fall' },
            grades: [],
          });
          setGradeInput('');
          setErrors({});
          toast.success('Course added successfully!');
        },
        onError: (err: unknown) => {
          const errorResponse = err as { response?: { data?: { message?: string } } };
          const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to add course. Please try again.';
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
      }
    );
  };

  // Get status display text
  const getStatusDisplay = () => {
    switch (inferredStatus) {
      case 'completed': return { text: 'Completed', color: 'text-green-600 bg-green-50' };
      case 'in-progress': return { text: 'In Progress', color: 'text-blue-600 bg-blue-50' };
      case 'planned': return { text: 'Planned', color: 'text-yellow-600 bg-yellow-50' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-transparent">
      <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>Add Course</h2>
      <form onSubmit={onSubmit} className='flex flex-col'>
        {errors?.general && (
          <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
            <p className='text-red-700 text-sm font-medium'>{errors?.general}</p>
          </div>
        )}

        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Course Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={onChange} 
            placeholder="e.g., Introduction to Computer Science"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
              errors?.name 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-theme3'
            }`}
          />
          {errors?.name && (
            <p className='text-red-600 text-xs mt-1'>{errors?.name}</p>
          )}
        </div>

        {/* Semester Selection */}
        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Semester</label>
          <div className="flex gap-3">
            <select
              name="semesterTerm"
              value={formData.semester?.term || 'Fall'}
              onChange={onChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {TERM_OPTIONS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
            <select
              name="semesterYear"
              value={formData.semester?.year || CURRENT_YEAR}
              onChange={onChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {YEAR_OPTIONS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* Status indicator based on semester */}
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
              Status: {statusDisplay.text} (based on semester)
            </span>
          </div>
        </div>

        {/* Grade - only show for completed courses */}
        {inferredStatus === 'completed' && (
          <div className="form-group mb-6">
            <label className='block text-gray-800 text-sm font-semibold mb-3'>Grade</label>
            <input 
              type="number" 
              name="grade" 
              value={gradeInput} 
              onChange={onGradeChange} 
              min={0} 
              max={100} 
              placeholder="0-100"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
                errors?.grade 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors?.grade && (
              <p className='text-red-600 text-xs mt-1'>{errors.grade}</p>
            )}
          </div>
        )}

        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Course Credit</label>
          <input 
            type="number" 
            name="credits" 
            value={formData.credits === '' ? '' : (formData.credits ?? '')} 
            onChange={onChange} 
            min={0} 
            step="0.5"
            placeholder="Credit hours"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
              errors?.credits 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-theme3'
            }`}
          />
          {errors?.credits && (
            <p className='text-red-600 text-xs mt-1'>{errors.credits}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={addCourseMutation.isPending}
          className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {addCourseMutation.isPending ? 'Adding...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
}
