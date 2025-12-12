"use client";

import React, { useState } from 'react';
import type { CourseFormData, CourseStatus, CourseCategory, SemesterTerm, Course } from '@/types';
import { useAddCourse } from '@/hooks/useCourses';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
const TERM_OPTIONS: SemesterTerm[] = ['Fall', 'Spring', 'Summer'];
const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];
const CATEGORY_OPTIONS: { value: CourseCategory; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'elective', label: 'Elective' },
  { value: 'general', label: 'General Education' },
];

export default function AddCourse() {
  const [formData, setFormData] = useState<CourseFormData>({ 
    courseName: '', 
    courseGrade: '', 
    courseCredit: '',
    status: 'completed',
    category: 'elective',
    semester: { year: CURRENT_YEAR, term: 'Fall' },
  });
  const [errors, setErrors] = useState<{ courseName?: string; courseGrade?: string; courseCredit?: string; general?: string }>({});
  const addCourseMutation = useAddCourse();

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
    } else if (name === 'courseName') {
      setFormData({ ...formData, [name]: value });
    } else if (name === 'status' || name === 'category') {
      setFormData({ ...formData, [name]: value });
    } else {
      // For number fields, preserve empty string, otherwise convert to number
      const processedValue = value === '' ? '' : Number(value);
      setFormData({ ...formData, [name]: processedValue });
    }
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    // Grade is only required for completed courses
    if (formData.status === 'completed') {
      const gradeValue = formData.courseGrade;
      if (gradeValue === null || gradeValue === undefined || gradeValue === '') {
        newErrors.courseGrade = 'Grade is required for completed courses';
      } else {
        const grade = Number(gradeValue);
        if (isNaN(grade) || grade < 0 || grade > 100) {
          newErrors.courseGrade = 'Grade must be between 0 and 100';
        }
      }
    }

    const credit = Number(formData.courseCredit);
    if (isNaN(credit) || credit <= 0) {
      newErrors.courseCredit = 'Course credit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    const courseData: Partial<Course> = {
      courseName: formData.courseName,
      courseCredit: formData.courseCredit as number,
      status: formData.status,
      category: formData.category,
      semester: formData.semester,
    };

    // Only include grade for completed courses
    if (formData.status === 'completed' && formData.courseGrade !== '') {
      courseData.courseGrade = formData.courseGrade as number;
    }

    addCourseMutation.mutate(
      courseData,
      {
        onSuccess: () => {
          setFormData({ 
            courseName: '', 
            courseGrade: '', 
            courseCredit: '',
            status: 'completed',
            category: 'elective',
            semester: { year: CURRENT_YEAR, term: 'Fall' },
          });
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

  return (
    <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-transparent">
      <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>Add Course</h2>
      <form onSubmit={onSubmit} className='flex flex-col'>
        {errors.general && (
          <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
            <p className='text-red-700 text-sm font-medium'>{errors.general}</p>
          </div>
        )}

        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Course Name</label>
          <input 
            type="text" 
            name="courseName" 
            value={formData.courseName} 
            onChange={onChange} 
            placeholder="e.g., Introduction to Computer Science"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
              errors.courseName 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-theme3'
            }`}
          />
          {errors.courseName && (
            <p className='text-red-600 text-xs mt-1'>{errors.courseName}</p>
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
        </div>

        {/* Status and Category Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="form-group">
            <label className='block text-gray-800 text-sm font-semibold mb-3'>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className='block text-gray-800 text-sm font-semibold mb-3'>Category</label>
            <select
              name="category"
              value={formData.category || 'elective'}
              onChange={onChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade - only show for completed courses */}
        {formData.status === 'completed' && (
          <div className="form-group mb-6">
            <label className='block text-gray-800 text-sm font-semibold mb-3'>Grade</label>
            <input 
              type="number" 
              name="courseGrade" 
              value={formData.courseGrade === '' ? '' : (formData.courseGrade ?? '')} 
              onChange={onChange} 
              min={0} 
              max={100} 
              placeholder="0-100"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
                errors.courseGrade 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors.courseGrade && (
              <p className='text-red-600 text-xs mt-1'>{errors.courseGrade}</p>
            )}
          </div>
        )}

        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Course Credit</label>
          <input 
            type="number" 
            name="courseCredit" 
            value={formData.courseCredit === '' ? '' : (formData.courseCredit ?? '')} 
            onChange={onChange} 
            min={0} 
            step="0.5"
            placeholder="Credit hours"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
              errors.courseCredit 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-theme3'
            }`}
          />
          {errors.courseCredit && (
            <p className='text-red-600 text-xs mt-1'>{errors.courseCredit}</p>
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
