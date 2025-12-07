"use client";

import React, { useState } from 'react';
import type { CourseFormData } from '@/types';
import { useAddCourse } from '@/hooks/useCourses';
import toast from 'react-hot-toast';

export default function AddCourse() {
  const [formData, setFormData] = useState<CourseFormData>({ courseName: '', courseGrade: '', courseCredit: '' });
  const [errors, setErrors] = useState<{ courseName?: string; courseGrade?: string; courseCredit?: string; general?: string }>({});
  const addCourseMutation = useAddCourse();

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

    addCourseMutation.mutate(
      {
        courseName: formData.courseName,
        courseGrade: formData.courseGrade as number,
        courseCredit: formData.courseCredit as number
      },
      {
        onSuccess: () => {
          setFormData({ courseName: '', courseGrade: '', courseCredit: '' });
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

        <button 
          type="submit" 
          disabled={addCourseMutation.isPending}
          className='w-full bg-linear-to-r from-theme3 to-theme4 hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {addCourseMutation.isPending ? 'Adding...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
}
