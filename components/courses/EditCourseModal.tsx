"use client";

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { Course, CourseFormData } from '@/types';
import { useEditCourse } from '@/hooks/useCourses';

export default function EditCourseModal({ isOpen, onClose, currentCourse }: { isOpen: boolean; onClose: () => void; currentCourse: Course | null }) {
  const [formData, setFormData] = useState<CourseFormData>(() => ({
    courseName: currentCourse?.courseName || '',
    courseGrade: currentCourse?.courseGrade ?? '',
    courseCredit: currentCourse?.courseCredit ?? ''
  }));
  const [errors, setErrors] = useState<{ courseName?: string; courseGrade?: string; courseCredit?: string; general?: string }>({});
  const editCourseMutation = useEditCourse();

  if (!isOpen) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For number fields, preserve empty string, otherwise convert to number
    const processedValue = name === 'courseName' 
      ? value 
      : (value === '' ? '' : Number(value));
    setFormData({ ...formData, [name]: processedValue });
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

    // Check if grade is provided
    const gradeValue = formData.courseGrade;
    if (gradeValue === null || gradeValue === undefined || gradeValue === '') {
      newErrors.courseGrade = 'Grade is required';
    } else {
      const grade = Number(gradeValue);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        newErrors.courseGrade = 'Grade must be between 0 and 100';
      }
    }

    // Check if credit is provided
    const creditValue = formData.courseCredit;
    if (creditValue === null || creditValue === undefined || creditValue === '') {
      newErrors.courseCredit = 'Course credit is required';
    } else {
      const credit = Number(creditValue);
      if (isNaN(credit) || credit <= 0) {
        newErrors.courseCredit = 'Course credit must be greater than 0';
      }
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

    if (currentCourse && currentCourse._id) {
      editCourseMutation.mutate(
        {
          courseId: currentCourse._id,
          formData: {
            courseName: formData.courseName,
            courseGrade: formData.courseGrade as number,
            courseCredit: formData.courseCredit as number
          }
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: unknown) => {
            const errorResponse = err as { response?: { data?: { message?: string } } };
            const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to update course. Please try again.';
            setErrors({ general: errorMessage });
          }
        }
      );
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      tabIndex={-1} 
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/30"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-theme4 to-theme3 px-8 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Edit Course</h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-white hover:bg-gray-500/50 rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className='px-8 py-6'>
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

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className='flex-1 bg-gray-200 hover:bg-gray-100 hover:bg-opacity-30 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={editCourseMutation.isPending}
              className='flex-1 bg-linear-to-r from-theme3 to-theme4 hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {editCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
