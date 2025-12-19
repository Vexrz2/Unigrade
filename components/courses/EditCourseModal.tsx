"use client";

import React, { useState, useMemo } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Course, CourseFormData, SemesterTerm, GradeAttempt } from '@/types';
import { useEditCourse } from '@/hooks/useCourses';
import { getCourseStatus } from '@/lib/CoursesUtil';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
const TERM_OPTIONS: SemesterTerm[] = ['Fall', 'Spring', 'Summer'];

// Helper to get initial form data from course
const getInitialFormData = (course: Course | null): CourseFormData => ({
  name: course?.name || '',
  credits: course?.credits ?? '',
  semester: course?.semester || { year: CURRENT_YEAR, term: 'Fall' },
  grades: course?.grades || [],
});

export default function EditCourseModal({ isOpen, onClose, currentCourse }: { isOpen: boolean; onClose: () => void; currentCourse: Course | null }) {
  // Using key prop on the modal component in parent ensures this reinitializes when course changes
  const [formData, setFormData] = useState<CourseFormData>(() => getInitialFormData(currentCourse));
  const [errors, setErrors] = useState<{ name?: string; grade?: string; credits?: string; general?: string }>({});
  const editCourseMutation = useEditCourse();

  // Infer status from semester
  const inferredStatus = useMemo(() => getCourseStatus(formData.semester), [formData.semester]);

  if (!isOpen) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name: fieldName, value } = e.target;
    
    if (fieldName === 'semesterYear') {
      setFormData({ 
        ...formData, 
        semester: { ...formData.semester!, year: Number(value) } 
      });
    } else if (fieldName === 'semesterTerm') {
      setFormData({ 
        ...formData, 
        semester: { ...formData.semester!, term: value as SemesterTerm } 
      });
    } else if (fieldName === 'name') {
      setFormData({ ...formData, name: value });
    } else if (fieldName === 'credits') {
      // For number fields, preserve empty string, otherwise convert to number
      const processedValue = value === '' ? '' : Number(value);
      setFormData({ ...formData, credits: processedValue });
    }
    
    // Clear error for this field when user starts typing
    if (errors[fieldName as keyof typeof errors]) {
      setErrors({ ...errors, [fieldName]: undefined });
    }
  };

  // Grade attempts management
  const addGradeAttempt = () => {
    const newAttempt: GradeAttempt = {
      grade: 0,
      label: `Attempt ${(formData.grades?.length || 0) + 1}`,
      isFinal: formData.grades?.length === 0,
    };
    setFormData({ ...formData, grades: [...(formData.grades || []), newAttempt] });
  };

  const updateGradeAttempt = (index: number, field: keyof GradeAttempt, value: number | string | boolean) => {
    const newGrades = [...(formData.grades || [])];
    newGrades[index] = { ...newGrades[index], [field]: value };
    
    // If setting this as final, unset others
    if (field === 'isFinal' && value === true) {
      newGrades.forEach((g, i) => {
        if (i !== index) g.isFinal = false;
      });
    }
    
    setFormData({ ...formData, grades: newGrades });
  };

  const removeGradeAttempt = (index: number) => {
    const newGrades = (formData.grades || []).filter((_, i) => i !== index);
    // Ensure at least one grade is marked final if grades exist
    if (newGrades.length > 0 && !newGrades.some(g => g.isFinal)) {
      newGrades[newGrades.length - 1].isFinal = true;
    }
    setFormData({ ...formData, grades: newGrades });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    // Grade is only required for completed courses (past semesters)
    if (inferredStatus === 'completed') {
      const hasGrades = formData.grades && formData.grades.length > 0;
      
      if (!hasGrades) {
        newErrors.grade = 'At least one grade is required for completed courses';
      }
      
      if (hasGrades) {
        for (const attempt of formData.grades!) {
          if (isNaN(attempt.grade) || attempt.grade < 0 || attempt.grade > 100) {
            newErrors.grade = 'All grades must be between 0 and 100';
            break;
          }
        }
      }
    }

    // Check if credit is provided
    const creditValue = formData.credits;
    if (creditValue === null || creditValue === undefined || creditValue === '') {
      newErrors.credits = 'Course credit is required';
    } else {
      const credit = Number(creditValue);
      if (isNaN(credit) || credit <= 0) {
        newErrors.credits = 'Course credit must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    if (currentCourse && currentCourse._id) {
      const courseData: Partial<Course> = {
        name: formData.name,
        credits: formData.credits as number,
        semester: formData.semester,
        grades: formData.grades,
      };

      editCourseMutation.mutate(
        { courseId: currentCourse._id, formData: courseData },
        {
          onSuccess: () => {
            toast.success('Course updated successfully!');
            onClose();
          },
          onError: (err: unknown) => {
            const errorResponse = err as { response?: { data?: { message?: string } } };
            const errorMessage = errorResponse?.response?.data?.message ?? 'Failed to update course. Please try again.';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
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
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-theme3 px-8 py-6 sticky top-0 z-10">
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
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              placeholder="e.g., Introduction to Computer Science"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors.name && (
              <p className='text-red-600 text-xs mt-1'>{errors.name}</p>
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

          {/* Grade Attempts - only show for completed courses */}
          {inferredStatus === 'completed' && (
            <div className="form-group mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className='block text-gray-800 text-sm font-semibold'>Grades</label>
                <button
                  type="button"
                  onClick={addGradeAttempt}
                  className="flex items-center gap-1 text-sm text-theme3 hover:text-blue-600 transition-colors"
                >
                  <FiPlus size={16} />
                  Add Attempt
                </button>
              </div>
              
              {formData.grades && formData.grades.length > 0 ? (
                <div className="space-y-3">
                  {formData.grades.map((attempt, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={attempt.label || ''}
                        onChange={(e) => updateGradeAttempt(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700"
                      />
                      <input
                        type="number"
                        value={attempt.grade}
                        onChange={(e) => updateGradeAttempt(index, 'grade', Number(e.target.value))}
                        min={0}
                        max={100}
                        placeholder="Grade"
                        className="w-20 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={attempt.isFinal || false}
                          onChange={(e) => updateGradeAttempt(index, 'isFinal', e.target.checked)}
                          className="w-4 h-4"
                        />
                        Final
                      </label>
                      <button
                        type="button"
                        onClick={() => removeGradeAttempt(index)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No grades yet. Click &quot;Add Attempt&quot; to add a grade.</p>
                </div>
              )}
              {errors.grade && (
                <p className='text-red-600 text-xs mt-2'>{errors.grade}</p>
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
                errors.credits 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors.credits && (
              <p className='text-red-600 text-xs mt-1'>{errors.credits}</p>
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
              className='flex-1 bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {editCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
