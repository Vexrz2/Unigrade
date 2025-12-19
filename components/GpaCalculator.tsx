"use client";

import React, { useState, useMemo } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getWeightedAverage } from '@/lib/CoursesUtil';
import type { UserCourse, Course } from '@/types';
import { getCurrentSemester } from '@/types';

type SimulatedCourse = {
  id: string;
  name: string;
  grade: number | '';
  credit: number | '';
};

type GpaCalculatorProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCourses: UserCourse[];
};

export default function GpaCalculator({ isOpen, onClose, currentCourses }: GpaCalculatorProps) {
  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>([
    { id: '1', name: '', grade: '', credit: '' }
  ]);

  const currentAverage = useMemo(() => getWeightedAverage(currentCourses), [currentCourses]);
  const currentSemester = useMemo(() => getCurrentSemester(), []);

  const projectedAverage = useMemo(() => {
    const validSimulated = simulatedCourses.filter(
      c => c.name && c.grade !== '' && c.credit !== '' && Number(c.grade) >= 0 && Number(c.credit) > 0
    );

    if (validSimulated.length === 0) return currentAverage;

    const allCourses: UserCourse[] = [...currentCourses];

    // Create fake courses to calculate GPA
    const pastSemester = { year: currentSemester.year - 1, term: currentSemester.term };
    validSimulated.forEach(c => {
      const fakeCourse: Course = {
        _id: `sim-${c.id}`,
        code: `SIM-${c.id}`,
        name: c.name,
        credits: Number(c.credit),
        department: 'Simulation',
        status: 'approved',
      };
      allCourses.push({
        _id: `sim-${c.id}`,
        course: fakeCourse,
        semester: pastSemester,
        grades: [{ grade: Number(c.grade), isFinal: true }],
      });
    });

    return getWeightedAverage(allCourses);
  }, [currentCourses, simulatedCourses, currentAverage, currentSemester]);

  const difference = projectedAverage - currentAverage;

  const addCourse = () => {
    setSimulatedCourses([
      ...simulatedCourses,
      { id: Date.now().toString(), name: '', grade: '', credit: '' }
    ]);
  };

  const removeCourse = (id: string) => {
    if (simulatedCourses.length > 1) {
      setSimulatedCourses(simulatedCourses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof SimulatedCourse, value: string) => {
    setSimulatedCourses(simulatedCourses.map(c => {
      if (c.id === id) {
        if (field === 'grade' || field === 'credit') {
          return { ...c, [field]: value === '' ? '' : Number(value) };
        }
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const resetSimulation = () => {
    setSimulatedCourses([{ id: '1', name: '', grade: '', credit: '' }]);
  };

  if (!isOpen) return null;

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
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-theme3 px-4 sm:px-8 py-4 sm:py-6 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white">What-If GPA Calculator</h3>
              <p className="text-theme2 text-xs sm:text-sm mt-1">Simulate future courses to see their impact on your GPA</p>
            </div>
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

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 bg-gray-50 border-b shrink-0">
          <div className="text-center">
            <p className="text-sm text-gray-500">Current GPA</p>
            <p className="text-2xl font-bold text-gray-800">{currentAverage.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Projected GPA</p>
            <p className={`text-2xl font-bold ${
              difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-800'
            }`}>
              {projectedAverage.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Change</p>
            <p className={`text-2xl font-bold ${
              difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-800'
            }`}>
              {difference > 0 ? '+' : ''}{difference.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {simulatedCourses.map((course, index) => (
              <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                <input
                  type="text"
                  placeholder="Course name"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  className="flex-1 w-full sm:w-auto px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-sm"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Grade"
                    min={0}
                    max={100}
                    value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="flex-1 sm:w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Credits"
                  min={0}
                  step={0.5}
                  value={course.credit}
                  onChange={(e) => updateCourse(course.id, 'credit', e.target.value)}
                  className="flex-1 sm:w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-sm text-center"
                />
                <button
                  onClick={() => removeCourse(course.id)}
                  disabled={simulatedCourses.length === 1}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remove course"
                >
                  <FiTrash2 size={18} />
                </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addCourse}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-theme3 hover:text-theme3 transition-colors text-sm sm:text-base"
          >
            <FiPlus size={18} />
            Add Another Course
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t shrink-0 flex gap-3">
          <button
            onClick={resetSimulation}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
