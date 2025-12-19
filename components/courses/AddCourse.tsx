"use client";

import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import type { SemesterTerm, Course } from '@/types';
import { useAddCourse } from '@/hooks/useCourses';
import { UserContext } from '@/context/UserContext';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';

const CURRENT_YEAR = new Date().getFullYear();
const TERM_OPTIONS: SemesterTerm[] = ['Fall', 'Spring', 'Summer'];

export default function AddCourse() {
  const ctx = useContext(UserContext);
  const user = ctx?.user;

  // Generate year options based on user's degree timeline
  const YEAR_OPTIONS = useMemo(() => {
    const startYear = user?.startYear || CURRENT_YEAR - 5;
    const endYear = user?.expectedGraduationYear || CURRENT_YEAR + 5;
    const years: number[] = [];
    for (let year = startYear; year <= Math.max(endYear, CURRENT_YEAR + 2); year++) {
      years.push(year);
    }
    return years;
  }, [user?.startYear, user?.expectedGraduationYear]);

  // Selected course from database
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [semester, setSemester] = useState<{ year: number; term: SemesterTerm }>({ 
    year: CURRENT_YEAR, 
    term: 'Fall' 
  });
  const [grade, setGrade] = useState<string>('');
  const [errors, setErrors] = useState<{ course?: string; grade?: string; general?: string }>({});
  const addCourseMutation = useAddCourse();

  // Course search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCourseData, setCustomCourseData] = useState({ name: '', code: '', credits: 3 });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search courses from database - filter by user's degree field
  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await api.get('/course-database/search', {
        params: { query, department: user?.degree?.major || undefined, limit: 5 }
      });
      setSearchResults(res.data.courses || []);
    } catch (error) {
      console.error('Failed to search courses:', error);
    } finally {
      setIsSearching(false);
    }
  }, [user?.degree?.major]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && !selectedCourse) {
        searchCourses(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCourses, selectedCourse]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCourseFromDatabase = async (course: Course) => {
    setSelectedCourse(course);
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchResults([]);
    setErrors({});
    
    // Track usage
    if (course._id) {
      try {
        await api.post('/course-database/track-usage', { courseId: course._id });
      } catch (error) {
        console.error('Failed to track course usage:', error);
      }
    }
  };

  const clearSelection = () => {
    setSelectedCourse(null);
    setSearchQuery('');
    setShowCustomForm(false);
    setCustomCourseData({ name: '', code: '', credits: 3 });
  };

  // Custom course is valid when using custom form and has required fields (code is required, name comes from searchQuery)
  const isCustomCourseValid = showCustomForm && searchQuery.trim() && customCourseData.code.trim() && customCourseData.credits > 0;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Must either select a course OR have valid custom course data
    if (!selectedCourse && !isCustomCourseValid) {
      newErrors.course = 'Please select a course or create a custom one';
    }

    // Grade is optional - if provided, validate it
    if (grade !== '') {
      const gradeNum = Number(grade);
      if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
        newErrors.grade = 'Grade must be between 0 and 100';
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

    // Build course data - either with courseId or customCourse
    const courseData: {
      courseId?: string;
      customCourse?: { name: string; code?: string; credits: number };
      semester: { year: number; term: SemesterTerm };
      grades?: { grade: number; isFinal: boolean; label: string }[];
    } = {
      semester,
      grades: grade !== '' ? [{ grade: Number(grade), isFinal: true, label: 'Final' }] : undefined,
    };

    if (selectedCourse?._id) {
      courseData.courseId = selectedCourse._id;
    } else if (isCustomCourseValid) {
      courseData.customCourse = {
        name: searchQuery.trim(),
        code: customCourseData.code,
        credits: customCourseData.credits,
      };
    }

    addCourseMutation.mutate(
      courseData,
      {
        onSuccess: () => {
          setSelectedCourse(null);
          setSearchQuery('');
          setSemester({ year: CURRENT_YEAR, term: 'Fall' });
          setGrade('');
          setErrors({});
          setSearchResults([]);
          setShowCustomForm(false);
          setCustomCourseData({ name: '', code: '', credits: 3 });
          toast.success(selectedCourse ? 'Course added successfully!' : 'Custom course created and added!');
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

        {/* Course Selection */}
        <div className="form-group mb-6 relative">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Course</label>
          <div className="relative">
            {selectedCourse ? (
              <div className="flex items-center gap-2 w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg text-gray-700">
                <div className="flex-1">
                  <p className="font-medium">{selectedCourse.code} - {selectedCourse.name}</p>
                  <p className="text-xs text-gray-500">{selectedCourse.credits} credits{selectedCourse.department ? ` • ${selectedCourse.department}` : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <>
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for a course..."
                  autoComplete="off"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
                    errors.course 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:border-theme3'
                  }`}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme3"></div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && searchResults.length > 0 && !selectedCourse && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {searchResults.map((course) => (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => selectCourseFromDatabase(course)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 border-b last:border-b-0 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-800">{course.code} - {course.name}</p>
                    <p className="text-gray-500 text-xs">{course.credits} credits{course.department ? ` • ${course.department}` : ''}</p>
                  </div>
                  <FiPlus className="text-theme3" size={16} />
                </button>
              ))}
            </div>
          )}
          
          {/* Custom Course Link */}
          {searchQuery && !selectedCourse && searchResults.length === 0 && !isSearching && (
            <div className="mt-2">
              {!showCustomForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomCourseData({ ...customCourseData, name: searchQuery });
                    setShowCustomForm(true);
                  }}
                  className="text-xs text-theme3 hover:text-blue-600 transition-colors"
                >
                  Course not found? Add a custom course →
                </button>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Add: <span className="font-semibold">{searchQuery}</span></p>
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">Pending approval</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCourseData.code}
                      onChange={(e) => setCustomCourseData({ ...customCourseData, code: e.target.value })}
                      placeholder="Course code *"
                      className="flex-1 px-3 py-2 border rounded text-sm text-gray-700"
                    />
                    <input
                      type="number"
                      value={customCourseData.credits}
                      onChange={(e) => setCustomCourseData({ ...customCourseData, credits: Number(e.target.value) })}
                      placeholder="Credits"
                      min={1}
                      className="w-20 px-3 py-2 border rounded text-sm text-gray-700"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Course will be added to your schedule and submitted for review.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {errors.course && (
            <p className='text-red-600 text-xs mt-1'>{errors.course}</p>
          )}
        </div>

        {/* Semester Selection */}
        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Semester</label>
          <div className="flex gap-3">
            <select
              value={semester.term}
              onChange={(e) => setSemester({ ...semester, term: e.target.value as SemesterTerm })}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {TERM_OPTIONS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
            <select
              value={semester.year}
              onChange={(e) => setSemester({ ...semester, year: Number(e.target.value) })}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
            >
              {YEAR_OPTIONS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade (optional) */}
        <div className="form-group mb-6">
          <label className='block text-gray-800 text-sm font-semibold mb-3'>Grade (optional)</label>
          <input 
            type="number" 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)}
            min={0} 
            max={100} 
            placeholder="0-100"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-700 ${
              errors.grade 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-theme3'
            }`}
          />
          {errors.grade && (
            <p className='text-red-600 text-xs mt-1'>{errors.grade}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={addCourseMutation.isPending || (!selectedCourse && !isCustomCourseValid)}
          className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {addCourseMutation.isPending ? 'Adding...' : (isCustomCourseValid ? 'Create & Add Course' : 'Add Course')}
        </button>
      </form>
    </div>
  );
}
