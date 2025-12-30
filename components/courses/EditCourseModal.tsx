"use client";

import React, { useState, useMemo } from 'react';
import { FiX, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { Course, CourseFormData, SemesterTerm, GradeAttempt, GradeComponent } from '@/types';
import { useEditCourse } from '@/hooks/useCourses';
import { getCourseStatus, calculateGradeFromComponents } from '@/lib/CoursesUtil';
import { CURRENT_YEAR, YEAR_OPTIONS, TERM_OPTIONS, getStatusDisplay } from '@/lib/constants';
import { validateCourseName, validateCredits, validateGrade, validateGradeComponents, VALIDATION_RULES } from '@/lib/validation';
import toast from 'react-hot-toast';

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
  const [errors, setErrors] = useState<{ name?: string; grade?: string; credits?: string; general?: string; components?: string }>({});
  const [expandedAttemptIndex, setExpandedAttemptIndex] = useState<number | null>(null);
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
    // Reset expanded state if we removed the expanded attempt
    if (expandedAttemptIndex === index) {
      setExpandedAttemptIndex(null);
    } else if (expandedAttemptIndex !== null && expandedAttemptIndex > index) {
      setExpandedAttemptIndex(expandedAttemptIndex - 1);
    }
  };

  // Grade component management functions
  const addGradeComponent = (attemptIndex: number) => {
    const newGrades = [...(formData.grades || [])];
    const attempt = newGrades[attemptIndex];
    const components = [...(attempt.components || [])];
    
    // Check max components limit
    if (components.length >= 10) {
      toast.error('Maximum 10 grade components allowed');
      return;
    }
    
    // Add new component at 0% - user will adjust percentages manually
    const newComponentCount = components.length + 1;
    components.push({
      name: `Component ${newComponentCount}`,
      grade: 0,
      percentage: components.length === 0 ? 100 : 0, // First component gets 100%, others start at 0%
    });
    
    // Sync the grade value with calculated grade from components
    const calculatedGrade = calculateGradeFromComponents(components);
    newGrades[attemptIndex] = { ...attempt, components, grade: calculatedGrade };
    setFormData({ ...formData, grades: newGrades });
  };

  const updateGradeComponent = (attemptIndex: number, componentIndex: number, field: keyof GradeComponent, value: string | number) => {
    const newGrades = [...(formData.grades || [])];
    const attempt = newGrades[attemptIndex];
    const components = [...(attempt.components || [])];
    
    if (field === 'percentage') {
      const newPercentage = Math.max(0, Math.min(100, Number(value)));
      const oldPercentage = components[componentIndex].percentage;
      const diff = newPercentage - oldPercentage;
      
      if (components.length === 1) {
        // Single component - just set it directly
        components[componentIndex] = { ...components[componentIndex], percentage: newPercentage };
      } else if (diff !== 0) {
        // Distribute the difference proportionally among other components
        const otherComponents = components.filter((_, i) => i !== componentIndex);
        const otherTotal = otherComponents.reduce((sum, c) => sum + c.percentage, 0);
        
        if (otherTotal > 0) {
          // Proportionally adjust other components
          components.forEach((comp, i) => {
            if (i === componentIndex) {
              components[i] = { ...comp, percentage: newPercentage };
            } else {
              const proportion = comp.percentage / otherTotal;
              const adjustment = Math.round(diff * proportion);
              components[i] = { ...comp, percentage: Math.max(0, comp.percentage - adjustment) };
            }
          });
          
          // Fix any rounding errors to ensure sum stays consistent
          const currentSum = components.reduce((sum, c) => sum + c.percentage, 0);
          const targetSum = components.reduce((sum, c) => sum + c.percentage, 0);
          if (currentSum !== targetSum) {
            const adjustment = targetSum - currentSum;
            for (let i = 0; i < components.length; i++) {
              if (i !== componentIndex && components[i].percentage + adjustment >= 0) {
                components[i] = { ...components[i], percentage: components[i].percentage + adjustment };
                break;
              }
            }
          }
        } else {
          // Other components are all at 0, just set this one directly
          components[componentIndex] = { ...components[componentIndex], percentage: newPercentage };
        }
      }
    } else if (field === 'grade') {
      components[componentIndex] = { ...components[componentIndex], grade: Math.max(0, Math.min(100, Number(value))) };
    } else if (field === 'name') {
      components[componentIndex] = { ...components[componentIndex], name: String(value) };
    }
    
    // Sync the grade value with calculated grade from components
    const calculatedGrade = calculateGradeFromComponents(components);
    newGrades[attemptIndex] = { ...attempt, components, grade: calculatedGrade };
    setFormData({ ...formData, grades: newGrades });
  };

  const removeGradeComponent = (attemptIndex: number, componentIndex: number) => {
    const newGrades = [...(formData.grades || [])];
    const attempt = newGrades[attemptIndex];
    const removedComponent = (attempt.components || [])[componentIndex];
    const components = (attempt.components || []).filter((_, i) => i !== componentIndex);
    
    // Redistribute the removed component's percentage among remaining components
    if (components.length > 0 && removedComponent && removedComponent.percentage > 0) {
      const totalRemaining = components.reduce((sum, c) => sum + c.percentage, 0);
      
      if (totalRemaining > 0) {
        // Distribute proportionally
        const redistribution = removedComponent.percentage;
        components.forEach((comp, i) => {
          const proportion = comp.percentage / totalRemaining;
          components[i] = { ...comp, percentage: Math.round(comp.percentage + redistribution * proportion) };
        });
        
        // Fix rounding errors to maintain total
        const currentSum = components.reduce((sum, c) => sum + c.percentage, 0);
        const expectedSum = totalRemaining + removedComponent.percentage;
        if (currentSum !== expectedSum) {
          components[0] = { ...components[0], percentage: components[0].percentage + (expectedSum - currentSum) };
        }
      } else {
        // All remaining are at 0%, give first one the removed percentage
        components[0] = { ...components[0], percentage: removedComponent.percentage };
      }
    }
    
    // Sync the grade value with calculated grade from remaining components
    const calculatedGrade = components.length > 0 ? calculateGradeFromComponents(components) : 0;
    newGrades[attemptIndex] = { ...attempt, components, grade: calculatedGrade };
    
    setFormData({ ...formData, grades: newGrades });
  };

  const toggleComponents = (attemptIndex: number) => {
    setExpandedAttemptIndex(expandedAttemptIndex === attemptIndex ? null : attemptIndex);
  };

  // Calculate grade from components for display
  const getCalculatedGrade = (attempt: GradeAttempt): number | null => {
    if (attempt.components && attempt.components.length > 0) {
      return calculateGradeFromComponents(attempt.components);
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate course name
    const nameValidation = validateCourseName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    // Grade is only required for completed courses (past semesters)
    if (inferredStatus === 'completed') {
      const hasGrades = formData.grades && formData.grades.length > 0;
      
      if (!hasGrades) {
        newErrors.grade = VALIDATION_RULES.course.grade.messages.required;
      }
      
      if (hasGrades) {
        for (const attempt of formData.grades!) {
          // If attempt has components, validate components instead of direct grade
          if (attempt.components && attempt.components.length > 0) {
            const componentsValidation = validateGradeComponents(attempt.components);
            if (!componentsValidation.isValid) {
              newErrors.components = componentsValidation.error;
              break;
            }
          } else {
            const gradeValidation = validateGrade(attempt.grade);
            if (!gradeValidation.isValid) {
              newErrors.grade = VALIDATION_RULES.course.grade.messages.invalid;
              break;
            }
          }
        }
      }
    }

    // Validate credits
    const creditsValidation = validateCredits(Number(formData.credits));
    if (!creditsValidation.isValid) {
      newErrors.credits = creditsValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const statusDisplay = getStatusDisplay(inferredStatus);

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
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/30 p-4"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-theme3 px-6 py-4 rounded-t-lg shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Edit Course</h3>
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

        {/* Form - scrollable */}
        <form onSubmit={onSubmit} className='px-6 py-4 overflow-y-auto flex-1'>
          {errors.general && (
            <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-red-700 text-sm font-medium'>{errors.general}</p>
            </div>
          )}

          <div className="form-group mb-4">
            <label className='block text-gray-800 text-sm font-semibold mb-2'>Course Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              placeholder="e.g., Introduction to Computer Science"
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
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
          <div className="form-group mb-4">
            <label className='block text-gray-800 text-sm font-semibold mb-2'>Semester</label>
            <div className="flex gap-2">
              <select
                name="semesterTerm"
                value={formData.semester?.term || 'Fall'}
                onChange={onChange}
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
              >
                {TERM_OPTIONS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <select
                name="semesterYear"
                value={formData.semester?.year || CURRENT_YEAR}
                onChange={onChange}
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
              >
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {/* Status indicator based on semester */}
            <div className="mt-1.5">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </span>
            </div>
          </div>

          {/* Grade Attempts - only show for completed courses */}
          {inferredStatus === 'completed' && (
            <div className="form-group mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className='block text-gray-800 text-sm font-semibold'>Grades</label>
                <button
                  type="button"
                  onClick={addGradeAttempt}
                  className="flex items-center gap-1 text-sm text-theme3 hover:text-blue-600 transition-colors"
                >
                  <FiPlus size={14} />
                  Add
                </button>
              </div>
              
              {formData.grades && formData.grades.length > 0 ? (
                <div className="space-y-2">
                  {formData.grades.map((attempt, index) => {
                    const hasComponents = attempt.components && attempt.components.length > 0;
                    const calculatedGrade = getCalculatedGrade(attempt);
                    const isExpanded = expandedAttemptIndex === index;
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg">
                        {/* Main attempt row */}
                        <div className="flex items-center gap-2 p-2">
                          <input
                            type="text"
                            value={attempt.label || ''}
                            onChange={(e) => updateGradeAttempt(index, 'label', e.target.value)}
                            placeholder="Label"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700"
                          />
                          
                          {/* Grade input - greyed out if using components */}
                          <input
                            type="number"
                            value={hasComponents ? (calculatedGrade ?? 0).toFixed(1) : attempt.grade}
                            onChange={(e) => updateGradeAttempt(index, 'grade', Number(e.target.value))}
                            min={0}
                            max={100}
                            placeholder="Grade"
                            disabled={hasComponents}
                            className={`w-16 px-2 py-2 border rounded text-sm text-center ${
                              hasComponents 
                                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
                                : 'border-gray-200 text-gray-700'
                            }`}
                          />
                          
                          {/* Components toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleComponents(index)}
                            className={`px-3 py-2 rounded transition-colors font-medium text-sm ${
                              hasComponents 
                                ? 'bg-theme3 text-white hover:bg-blue-600' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title={hasComponents ? `${attempt.components!.length} components` : 'Add breakdown'}
                          >
                            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </button>
                          
                          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
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
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        
                        {/* Grade Components Section (expandable) */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 px-3 pb-3 pt-3 bg-white">
                            {attempt.components && attempt.components.length > 0 ? (
                              <div className="space-y-2">
                                {attempt.components.map((comp, compIndex) => (
                                  <div key={compIndex} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={comp.name}
                                      onChange={(e) => updateGradeComponent(index, compIndex, 'name', e.target.value)}
                                      placeholder="Component name"
                                      className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 min-w-0"
                                    />
                                    <input
                                      type="number"
                                      value={comp.grade}
                                      onChange={(e) => updateGradeComponent(index, compIndex, 'grade', e.target.value)}
                                      min={0}
                                      max={100}
                                      placeholder="Grade"
                                      className="w-16 px-2 py-2 border border-gray-200 rounded text-sm text-gray-700 text-center"
                                    />
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        value={comp.percentage}
                                        onChange={(e) => updateGradeComponent(index, compIndex, 'percentage', e.target.value)}
                                        min={0}
                                        max={100}
                                        className="w-14 px-2 py-2 border border-gray-200 rounded-l text-sm text-gray-700 text-center"
                                      />
                                      <span className="bg-gray-100 border border-l-0 border-gray-200 rounded-r px-2 py-2 text-sm text-gray-500">%</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeGradeComponent(index, compIndex)}
                                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <FiX size={18} />
                                    </button>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2">
                                  <button
                                    type="button"
                                    onClick={() => addGradeComponent(index)}
                                    disabled={(attempt.components?.length || 0) >= 10}
                                    className="px-3 py-1.5 text-sm font-medium text-theme3 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    + Add Component
                                  </button>
                                  <span className="text-sm font-semibold text-theme3 bg-blue-50 px-3 py-1.5 rounded">
                                    = {calculatedGrade?.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addGradeComponent(index)}
                                className="w-full py-3 text-sm font-medium text-theme3 hover:bg-blue-50 rounded border-2 border-dashed border-gray-300 hover:border-theme3 transition-colors"
                              >
                                + Add Component
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No grades yet. Click &quot;Add&quot; to add a grade.</p>
                </div>
              )}
              {errors.grade && (
                <p className='text-red-600 text-xs mt-1'>{errors.grade}</p>
              )}
              {errors.components && (
                <p className='text-red-600 text-xs mt-1'>{errors.components}</p>
              )}
            </div>
          )}

          <div className="form-group mb-4">
            <label className='block text-gray-800 text-sm font-semibold mb-2'>Credits</label>
            <input 
              type="number" 
              name="credits" 
              value={formData.credits === '' ? '' : (formData.credits ?? '')} 
              onChange={onChange} 
              min={0} 
              step="0.5"
              placeholder="Credit hours"
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
                errors.credits 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-theme3'
              }`}
            />
            {errors.credits && (
              <p className='text-red-600 text-xs mt-1'>{errors.credits}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={editCourseMutation.isPending}
              className='flex-1 bg-theme3 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {editCourseMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
