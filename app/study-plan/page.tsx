"use client";

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { 
  getDegreeProgress, 
  getFinalAverageRange, 
  getWeightedAverage,
  getCompletedCredits,
  getInProgressCredits,
  getPlannedCredits,
  getGPABySemester,
  getCompletedCoursesWithGrades,
  getFinalGrade,
} from '../../lib/CoursesUtil';
import { UserContext } from '../../context/UserContext';
import api from '../../lib/api';
import { MajorOptions, DegreeTypes } from '../../components/misc/SelectOptions';
import { useCourses } from '@/hooks/useCourses';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import GpaCalculator from '@/components/GpaCalculator';
import SemesterTimeline from '@/components/courses/SemesterTimeline';
import { useModal } from '@/hooks/useModal';
import toast from 'react-hot-toast';
import type { User } from '@/types';
import { FaCalculator } from 'react-icons/fa';
import { FiTrendingUp, FiCalendar, FiBookOpen, FiClock, FiTarget } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// Professional color palette for courses
const COURSE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#d946ef', '#22c55e', '#eab308', '#0ea5e9',
];

export default function StudyPlanPage() {
  const { data: courses = [] } = useCourses();
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const setUser = ctx?.setUser;
  const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
  const degreeProgress = useMemo(() => getDegreeProgress(user as User | null), [user]);
  const gradeRanges = useMemo(() => getFinalAverageRange(user as User | null), [user]);
  const completedCredits = useMemo(() => getCompletedCredits(courses), [courses]);
  const inProgressCredits = useMemo(() => getInProgressCredits(courses), [courses]);
  const plannedCredits = useMemo(() => getPlannedCredits(courses), [courses]);
  const gpaBySemester = useMemo(() => getGPABySemester(courses), [courses]);
  const completedCoursesWithGrades = useMemo(() => getCompletedCoursesWithGrades(courses), [courses]);
  const [formData, setFormData] = useState({ degreeType: '', major: '', creditRequirement: 120 });
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const gpaCalculatorModal = useModal();

  // GPA Trend chart data
  const gpaTrendData = useMemo(() => {
    if (gpaBySemester.length === 0) return null;
    
    // Calculate cumulative GPA at each point
    let cumulativeCredits = 0;
    let cumulativeWeightedSum = 0;
    const cumulativeGPAs: number[] = [];
    
    gpaBySemester.forEach(({ gpa, credits }) => {
      cumulativeWeightedSum += gpa * credits;
      cumulativeCredits += credits;
      cumulativeGPAs.push(cumulativeCredits > 0 ? cumulativeWeightedSum / cumulativeCredits : 0);
    });

    return {
      labels: gpaBySemester.map(s => `${s.semester.term} ${s.semester.year}`),
      datasets: [
        {
          label: 'Semester GPA',
          data: gpaBySemester.map(s => s.gpa),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Cumulative GPA',
          data: cumulativeGPAs,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: false,
          borderDash: [5, 5],
        },
      ],
    };
  }, [gpaBySemester]);

  const gpaTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'GPA',
        },
      },
    },
  };

  // Chart.js data for per-course breakdown (includes remaining credits)
  const courseChartData = useMemo(() => {
    const validCourses = completedCoursesWithGrades.filter(c => (c.course?.credits || 0) > 0);
    const earnedCredits = validCourses.reduce((sum, c) => sum + (c.course?.credits || 0), 0);
    const reqCredits = Number(formData.creditRequirement) || 120;
    const remaining = Math.max(0, reqCredits - earnedCredits);

    const labels = [...validCourses.map(c => c.course?.name || 'Unnamed Course')];
    const data = [...validCourses.map(c => c.course?.credits || 0)];
    const colors = [...validCourses.map((_, i) => COURSE_COLORS[i % COURSE_COLORS.length])];
    const details = validCourses.map(c => ({
      name: c.course?.name || 'Unnamed Course',
      grade: getFinalGrade(c) ?? null,
      credits: c.course?.credits || 0,
      isRemaining: false,
    }));

    // Add remaining credits slice
    if (remaining > 0) {
      labels.push('Remaining');
      data.push(remaining);
      colors.push('#e5e7eb');
      details.push({ name: 'Remaining Credits', grade: null as unknown as number, credits: remaining, isRemaining: true });
    }

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      }],
      courseDetails: details,
      remaining,
      reqCredits,
    };
  }, [completedCoursesWithGrades, formData.creditRequirement]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (ctx: { dataIndex: number }[]) => {
            const idx = ctx[0]?.dataIndex;
            return courseChartData.courseDetails[idx]?.name || '';
          },
          label: (ctx: { dataIndex: number }) => {
            const idx = ctx.dataIndex;
            const detail = courseChartData.courseDetails[idx];
            if (detail?.isRemaining) {
              return [`${detail.credits} credits to go`];
            }
            return [
              `Grade: ${detail?.grade ?? 'N/A'}`,
              `Credits: ${detail?.credits ?? 0}`,
            ];
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  }), [courseChartData]);

  // Initialize form data from user degree
  const initialFormData = useMemo(() => {
    if (user?.degree) {
      return {
        degreeType: user.degree.type ?? '',
        major: user.degree.major ?? '',
        creditRequirement: user.degree.creditRequirement ?? 120
      };
    }
    return {
      degreeType: '',
      major: '',
      creditRequirement: 120
    };
  }, [user?.degree]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const { degreeType, major, creditRequirement } = formData;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as typeof formData);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDegree(formData);
  };

  const updateDegree = async (payload: typeof formData) => {
    try {
      const res = await api.patch('/degree/update-degree', payload);
      toast.success('Degree settings saved successfully!');
      if (setUser) setUser(res.data.updatedUser);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message ?? 'Failed to save changes');
      console.error(errorResponse?.response ?? err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Study Plan</h1>
            <p className='text-gray-600 text-lg'>Configure your degree and track progress</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={gpaCalculatorModal.openModal}
              className="flex items-center gap-2 bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <FaCalculator size={20} />
              What-If Calculator
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'text-theme3 border-b-2 border-theme3'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiTrendingUp className="inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeTab === 'timeline'
                  ? 'text-theme3 border-b-2 border-theme3'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiCalendar className="inline-block mr-2" />
              Semester Timeline
            </button>
          </nav>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Row - Overview and Credits Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Overview Card */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <h3 className='text-gray-700 font-semibold mb-4'>Overview</h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                  <div>
                    <p className='text-sm text-gray-500'>Current Weighted Average</p>
                    <p className='text-4xl font-bold text-green-600'>{(weightedAverage ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Possible Final Grade Range</p>
                    <p className='text-gray-800 text-xl font-semibold'>
                      {gradeRanges?.low?.toFixed(2)} - {gradeRanges?.high?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Predicted Final Grade Range</p>
                    <p className='text-gray-800 text-xl font-semibold'>
                      {gradeRanges?.softLow?.toFixed(2)} - {gradeRanges?.softHigh?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Progress */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow flex flex-col justify-center">
                <h3 className='text-gray-700 font-semibold mb-4'>Credits Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div className="h-6 flex">
                    <div 
                      className="bg-green-500 text-xs font-medium text-white text-center leading-6 h-6"
                      style={{ width: `${Math.min(100, (completedCredits / (formData.creditRequirement || 120)) * 100)}%` }}
                      title={`Completed: ${completedCredits}`}
                    />
                    <div 
                      className="bg-blue-400 text-xs font-medium text-white text-center leading-6 h-6"
                      style={{ width: `${Math.min(100 - (completedCredits / (formData.creditRequirement || 120)) * 100, (inProgressCredits / (formData.creditRequirement || 120)) * 100)}%` }}
                      title={`In Progress: ${inProgressCredits}`}
                    />
                  </div>
                </div>
                <div className='flex flex-wrap gap-4 text-sm mt-3'>
                  <span className='flex items-center gap-2'>
                    <FiBookOpen className="text-green-500" />
                    <span className="text-gray-500">{completedCredits} completed</span>
                  </span>
                  <span className='flex items-center gap-2'>
                    <FiClock className="text-blue-500" />
                    <span className="text-gray-500">{inProgressCredits} in progress</span>
                  </span>
                  <span className='flex items-center gap-2'>
                    <FiTarget className="text-yellow-500" />
                    <span className="text-gray-500">{plannedCredits} planned</span>
                  </span>
                </div>
                <p className='text-gray-500 text-sm mt-2'>
                  {completedCredits + inProgressCredits} of {formData.creditRequirement || 120} credits ({(degreeProgress ?? 0).toFixed(1)}%)
                </p>
              </div>
            </div>

            {/* GPA Trend Chart */}
            {gpaTrendData && gpaBySemester.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow mb-6">
                <h3 className='text-2xl font-bold text-gray-800 mb-6'>GPA Trend</h3>
                <div className="h-64">
                  <Line data={gpaTrendData} options={gpaTrendOptions} />
                </div>
              </div>
            )}

            {/* Course Breakdown - Full Width */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className='text-2xl font-bold text-gray-800'>Course Breakdown</h3>
                <div className="text-sm text-gray-500">
                  {completedCredits} / {courseChartData.reqCredits} credits completed
                </div>
              </div>
              {courseChartData.labels.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Chart */}
                  <div className="relative h-72 w-72 shrink-0">
                    <Doughnut data={courseChartData} options={chartOptions} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{completedCredits}</p>
                        <p className="text-sm text-gray-500">completed</p>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex-1 w-full max-h-64 overflow-y-auto">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {courseChartData.courseDetails.map((course, i) => {
                        if (course.isRemaining) {
                          return (
                            <li key="remaining" className="flex items-center justify-between text-sm py-2 px-3 rounded bg-gray-50">
                              <div className="flex items-center gap-3">
                                <span className="inline-block w-3 h-3 rounded-full shrink-0 bg-gray-300" />
                                <span className="text-gray-500">Remaining</span>
                              </div>
                              <div className="text-gray-400 text-xs shrink-0 ml-2">
                                {course.credits} cr
                              </div>
                            </li>
                          );
                        }
                        const pct = courseChartData.reqCredits ? (course.credits / courseChartData.reqCredits) * 100 : 0;
                        return (
                          <li key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 truncate">
                              <span 
                                className="inline-block w-3 h-3 rounded-full shrink-0" 
                                style={{ backgroundColor: COURSE_COLORS[i % COURSE_COLORS.length] }} 
                              />
                              <span className="text-gray-700 truncate" title={course.name}>{course.name}</span>
                            </div>
                            <div className="text-gray-500 text-xs shrink-0 ml-2">
                              {course.credits} cr • {pct.toFixed(0)}%
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">No course data to display</div>
              )}
            </div>

            {/* Degree Settings */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Degree Settings</h2>
              <form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Degree Type</label>
                  <select 
                    value={degreeType} 
                    name='degreeType' 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
                  >
                    <DegreeTypes />
                  </select>
                </div>

                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Major</label>
                  <select 
                    value={major} 
                    name='major' 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
                  >
                    <MajorOptions />
                  </select>
                </div>

                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Credits Earned</label>
                  <input 
                    disabled 
                    value={completedCredits}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Credit Requirement</label>
                  <input 
                    type="number" 
                    min={0} 
                    name="creditRequirement" 
                    value={creditRequirement} 
                    onChange={onChange} 
                    required 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <button 
                    type="submit" 
                    className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors'
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Timeline Tab */
          <SemesterTimeline courses={courses} />
        )}

        {/* GPA Calculator Modal */}
        <GpaCalculator 
          isOpen={gpaCalculatorModal.isOpen} 
          onClose={gpaCalculatorModal.closeModal} 
          currentCourses={completedCoursesWithGrades} 
        />
      </div>
    </div>
  );
}
