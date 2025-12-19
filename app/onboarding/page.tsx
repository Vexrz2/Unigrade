"use client";

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserContext } from '@/context/UserContext';
import { MajorOptions, DegreeTypes } from '@/components/misc/SelectOptions';
import { FiCheck, FiChevronRight, FiChevronLeft, FiSearch, FiPlus, FiX, FiBook, FiCalendar, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { Course } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 10;
const MAX_YEAR = CURRENT_YEAR + 10;
const YEAR_OPTIONS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);
const ACADEMIC_YEAR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

type SelectedCourse = {
  courseName: string;
  courseCredit: number;
  fromDatabase?: boolean; // Indicates if the course is from the database, or user-defined
  databaseId?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  const setUser = ctx?.setUser;

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  // Step 1: Degree info
  const [degreeType, setDegreeType] = useState('');
  const [major, setMajor] = useState('');
  const [creditRequirement, setCreditRequirement] = useState(120);

  // Step 2: Year info
  const [startYear, setStartYear] = useState(CURRENT_YEAR);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(CURRENT_YEAR + 4);
  const [currentYear, setCurrentYear] = useState(1);

  // Step 3: Course selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCourseName, setCustomCourseName] = useState('');
  const [customCourseCredits, setCustomCourseCredits] = useState(3);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Pre-fill from user data if available
  useEffect(() => {
    if (user?.degree) {
      if (user.degree.type) setDegreeType(user.degree.type);
      if (user.degree.major) setMajor(user.degree.major);
      if (user.degree.creditRequirement) setCreditRequirement(user.degree.creditRequirement);
    }
    if (user?.startYear) setStartYear(user.startYear);
    if (user?.expectedGraduationYear) setExpectedGraduationYear(user.expectedGraduationYear);
    if (user?.currentYear) setCurrentYear(user.currentYear);
  }, [user]);

  // Load popular courses when reaching step 3
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get('/course-database/search', {
          params: { popular: true, limit: 10, degreeField: major || 'Undeclared' }
        });
        setPopularCourses(res.data.courses || []);
      } catch (error) {
        console.error('Failed to load popular courses:', error);
      }
    };
    
    if (currentStep === 2) {
      loadCourses();
    }
  }, [currentStep, major]);

  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await api.get('/course-database/search', {
        params: { query, degreeField: major || undefined, limit: 10 }
      });
      setSearchResults(res.data.courses || []);
    } catch (error) {
      console.error('Failed to search courses:', error);
    } finally {
      setIsSearching(false);
    }
  }, [major]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCourses(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCourses]);

  const addCourseFromDatabase = (course: Course) => {
    if (selectedCourses.some(c => c.databaseId === course._id || c.courseName === course.name)) {
      toast.error('Course already added');
      return;
    }
    setSelectedCourses([...selectedCourses, {
      courseName: course.name,
      courseCredit: course.credits,
      fromDatabase: true,
      databaseId: course._id,
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addCustomCourse = () => {
    if (!customCourseName.trim()) {
      toast.error('Please enter a course name');
      return;
    }
    if (selectedCourses.some(c => c.courseName.toLowerCase() === customCourseName.toLowerCase())) {
      toast.error('Course already added');
      return;
    }
    setSelectedCourses([...selectedCourses, {
      courseName: customCourseName,
      courseCredit: customCourseCredits,
      fromDatabase: false,
    }]);
    setCustomCourseName('');
    setCustomCourseCredits(3);
    setShowCustomForm(false);
  };

  const removeCourse = (index: number) => {
    setSelectedCourses(selectedCourses.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!degreeType) {
          toast.error('Please select a degree type');
          return false;
        }
        if (!major) {
          toast.error('Please select your major');
          return false;
        }
        return true;
      case 1:
        if (startYear > expectedGraduationYear) {
          toast.error('Start year cannot be after graduation year');
          return false;
        }
        return true;
      case 2:
        // Courses are optional
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Track usage for database courses
      for (const course of selectedCourses) {
        if (course.fromDatabase && course.databaseId) {
          await api.post('/course-database/track-usage', { courseId: course.databaseId });
        }
      }

      const res = await api.post('/onboarding', {
        degreeType,
        major,
        creditRequirement,
        startYear,
        expectedGraduationYear,
        currentYear,
        courses: selectedCourses
          .filter(c => c.fromDatabase && c.databaseId) // Only include database courses
          .map(c => ({
            courseId: c.databaseId,
            semester: { year: startYear, term: 'Fall' as const }, // Default to first semester
          })),
      });

      if (setUser) {
        setUser(res.data.user);
      }

      toast.success('Welcome to Unigrade!');
      router.push('/dashboard');
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/onboarding', {
        degreeType: degreeType || 'Other',
        major: major || 'Undeclared',
        creditRequirement: creditRequirement || 120,
        startYear,
        expectedGraduationYear,
        currentYear,
        courses: [],
      });

      if (setUser) {
        setUser(res.data.user);
      }

      toast.success('Welcome to Unigrade!');
      router.push('/dashboard');
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[0, 1, 2].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
              step < currentStep
                ? 'bg-green-500 text-white'
                : step === currentStep
                ? 'bg-theme3 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? <FiCheck size={20} /> : step + 1}
          </div>
          {step < 2 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FiAward className="text-theme3 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Tell us about your degree</h2>
        <p className="text-gray-600 mt-2">This helps us personalize your experience</p>
      </div>

      <div className="form-group">
        <label className="block text-gray-800 text-sm font-semibold mb-2">Degree Type</label>
        <select
          value={degreeType}
          onChange={(e) => setDegreeType(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
        >
          <DegreeTypes />
        </select>
      </div>

      <div className="form-group">
        <label className="block text-gray-800 text-sm font-semibold mb-2">Major / Field of Study</label>
        <select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
        >
          <MajorOptions />
        </select>
      </div>

      <div className="form-group">
        <label className="block text-gray-800 text-sm font-semibold mb-2">Credit Requirement</label>
        <input
          type="number"
          value={creditRequirement}
          onChange={(e) => setCreditRequirement(Number(e.target.value))}
          min={30}
          max={300}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
        />
        <p className="text-gray-500 text-xs mt-1">Total credits needed to complete your degree</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FiCalendar className="text-theme3 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">When did you start?</h2>
        <p className="text-gray-600 mt-2">This helps us set up your semester timeline</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-gray-800 text-sm font-semibold mb-2">Start Year</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
          >
            {YEAR_OPTIONS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="block text-gray-800 text-sm font-semibold mb-2">Expected Graduation</label>
          <select
            value={expectedGraduationYear}
            onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
          >
            {YEAR_OPTIONS.filter(y => y >= startYear).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="block text-gray-800 text-sm font-semibold mb-2">Current Academic Year</label>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
        >
          {ACADEMIC_YEAR_OPTIONS.map(year => (
            <option key={year} value={year}>Year {year}</option>
          ))}
        </select>
        <p className="text-gray-500 text-xs mt-1">Which year of your program are you in?</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Your degree timeline:</strong> {startYear} - {expectedGraduationYear} ({expectedGraduationYear - startYear} years)
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FiBook className="text-theme3 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Add your courses</h2>
        <p className="text-gray-600 mt-2">
          {major ? (
            <>Showing courses for <span className="font-semibold text-theme3">{major}</span></>
          ) : (
            'Search our database or add custom courses'
          )}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={major ? `Search ${major} courses...` : "Search for courses..."}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme3"></div>
          </div>
        )}
      </div>

      {/* Search Results - Grid Layout */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {searchResults.map((course) => (
            <button
              key={course._id}
              onClick={() => addCourseFromDatabase(course)}
              className="flex flex-col items-start p-3 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-theme3 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <p className="font-medium text-gray-800 text-sm truncate flex-1">{course.name}</p>
                <FiPlus className="text-theme3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" size={14} />
              </div>
              <p className="text-gray-500 text-xs mt-1">{course.credits} credits</p>
            </button>
          ))}
        </div>
      )}

      {/* Popular Courses - Compact Grid */}
      {!searchQuery && popularCourses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            {major ? `Popular ${major} Courses` : 'Popular Courses'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {popularCourses.slice(0, 8).map((course) => (
              <button
                key={course._id}
                onClick={() => addCourseFromDatabase(course)}
                className="flex flex-col items-start p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-theme3 rounded-lg transition-colors text-left"
              >
                <p className="font-medium text-gray-800 text-xs truncate w-full">{course.name}</p>
                <p className="text-gray-500 text-xs">{course.credits} cr</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Course */}
      <div className="border-t pt-4">
        {!showCustomForm ? (
          <button
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-2 text-theme3 hover:text-blue-600 font-medium transition-colors"
          >
            <FiPlus /> Add a custom course
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={customCourseName}
                onChange={(e) => setCustomCourseName(e.target.value)}
                placeholder="Course name"
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
              />
              <input
                type="number"
                value={customCourseCredits}
                onChange={(e) => setCustomCourseCredits(Number(e.target.value))}
                min={1}
                max={20}
                className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCustomCourse}
                className="px-4 py-2 bg-theme3 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomCourseName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Courses */}
      {selectedCourses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            Selected Courses ({selectedCourses.length})
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {selectedCourses.map((course, index) => (
              <div
                key={index}
                className="relative p-3 bg-green-50 border border-green-200 rounded-lg group"
              >
                <button
                  onClick={() => removeCourse(index)}
                  className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={16} />
                </button>
                <p className="font-medium text-gray-800 text-sm truncate pr-4">{course.courseName}</p>
                <p className="text-gray-500 text-xs">
                  {course.courseCredit} cr
                  {course.fromDatabase && <span className="text-green-600"> • DB</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm text-center">
        You can always add more courses later from the Courses page
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-theme3 px-8 py-8">
            <h1 className="text-3xl font-bold text-white text-center">Welcome to Unigrade!</h1>
            <p className="text-theme2 text-center mt-2">Let&apos;s set up your profile</p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {renderStepIndicator()}

            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 0 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <FiChevronLeft /> Back
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Skip for now
                </button>
              )}

              {currentStep < totalSteps - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Next <FiChevronRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Finishing...' : 'Get Started'} <FiCheck />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
