"use client";

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { Course } from '../../types';

export default function EditCourseModal({ isOpen, onClose, editCourse, currentCourse }: { isOpen: boolean; onClose: () => void; editCourse: (id: string, data: Partial<Course>) => Promise<{ success: boolean; error?: string }>; currentCourse: Course | null }) {
  const [formData, setFormData] = useState({ courseName: '', courseGrade: 0, courseCredit: 0 });
  const [errors, setErrors] = useState<{ courseName?: string; courseGrade?: string; courseCredit?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentCourse) {
      setFormData({ 
        courseName: currentCourse.courseName ?? '', 
        courseGrade: currentCourse.courseGrade ?? 0, 
        courseCredit: currentCourse.courseCredit ?? 0 
      });
      setErrors({});
    }
  }, [currentCourse]);

  if (!isOpen) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'courseName' ? value : Number(value) } as any);
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

    const grade = Number(formData.courseGrade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      newErrors.courseGrade = 'Grade must be between 0 and 100';
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

    if (currentCourse && currentCourse._id) {
      setIsSubmitting(true);
      const result = await editCourse(currentCourse._id, formData);
      setIsSubmitting(false);
      
      if (result.success) {
        onClose();
      } else {
        setErrors({ general: result.error });
      }
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
              value={formData.courseGrade || ''} 
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
              value={formData.courseCredit || ''} 
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
              disabled={isSubmitting}
              className='flex-1 bg-linear-to-r from-theme3 to-theme4 hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
