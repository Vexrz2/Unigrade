"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getDegreeProgress, getFinalAverageRange, getTotalCredit, getWeightedAverage } from '../../lib/CoursesUtil';
import { UserContext } from '../../context/UserContext';
import { useFetchCourses } from '../../hooks/useFetchCourses';
import api from '../../lib/api';
import { MajorOptions, DegreeTypes } from '../../components/misc/SelectOptions';

export default function StudyPlanPage() {
  const { courses } = useFetchCourses();
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const setUser = ctx?.setUser;
  const weightedAverage = useMemo(() => getWeightedAverage(courses), [courses]);
  const degreeProgress = useMemo(() => getDegreeProgress(user as any), [user]);
  const gradeRanges = useMemo(() => getFinalAverageRange(user as any), [user]);
  const totalCredits = useMemo(() => getTotalCredit(courses), [courses]);
  const [formData, setFormData] = useState({ degreeType: '', major: '', creditRequirement: 120 });
  const [message, setMessage] = useState('');
  const messageBox = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user && user.degree) setFormData({ degreeType: user.degree.type ?? '', major: user.degree.major ?? '', creditRequirement: user.degree.creditRequirement ?? 120 });
  }, [user]);

  const { degreeType, major, creditRequirement } = formData;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as any);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDegree(formData);
  };

  const updateDegree = async (payload: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await api.patch('/degree/updateDegree', payload, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (messageBox.current) messageBox.current.style.color = 'green';
      setMessage('Changes saved successfully!');
      setUser && setUser(res.data.updatedUser);
    } catch (err: any) {
      if (messageBox.current) messageBox.current.style.color = 'red';
      setMessage(err?.response?.data?.message ?? String(err));
      console.error(err?.response ?? err);
    }
  };

  return (
    <div className="study-plan-container bg-theme1 shadow-md rounded py-8 flex flex-col w-2/3 mx-auto items-center">
      <h2 className='text-5xl font-bold p-5 text-center mb-10'>Study Plan</h2>
      <p className='font-bold text-xl'>My degree</p>
      <form onSubmit={onSubmit} className='flex flex-col items-center'>
        <div className="flex items-center align-middle">
          <div className="form-group mb-4">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Degree type</label>
            <select value={degreeType} name='degreeType' onChange={onChange} className="shadow bg-theme2 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
              <DegreeTypes />
            </select>
          </div>
          <div className="form-group mb-4 w-full mr-4">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Major</label>
            <select value={major} name='major' onChange={onChange} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
              <MajorOptions />
            </select>
          </div>
          <div className="form-group mb-4">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Credits</label>
            <input disabled value={((user?.courses ?? []) as any[]).reduce((s, course) => s + (course?.courseCredit ?? 0), 0)} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
          </div>
          <div className="form-group mb-4">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Credit Req.</label>
            <input type="number" min={0} name="creditRequirement" value={creditRequirement as any} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
          </div>
        </div>
        <button type="submit" className='text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center'>Save changes</button>
      </form>
      <div className='message-box p-4 text-center mb-10' ref={messageBox}>{message}</div>
      <h1 className="text-xl font-bold mb-2">Course breakdown</h1>
      <div className="pie-chart-container mb-20 w-2/3 self-center">
        {/* Pie chart removed in this migration; install MUI/X charts and re-add if needed */}
        <div className="text-center">(Pie chart placeholder)</div>
      </div>

      <div className='flex justify-around items-center w-full'>
        <div className="degree-progress w-1/3 flex flex-col items-center space-y-2">
          <p className="">Credits progress</p>
          <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: (degreeProgress ?? 0) + "%", maxWidth: '100%' }}>{(degreeProgress ?? 0).toFixed(2)}%</div>
          </div>
        </div>
        <div className="average w-1/3 flex flex-col items-center space-y-2">
          <p className=' text-xl'>Current weighted average</p>
          <p className='text-green-700 text-4xl font-bold mb-10'>{(weightedAverage ?? 0).toFixed(2)}</p>
          <p className=" text-lg">Possible final grade range: {gradeRanges && (gradeRanges as any).low?.toFixed(2)}-{gradeRanges && (gradeRanges as any).high?.toFixed(2)}</p>
          <p className=" text-lg">Predicted final grade range: {gradeRanges && (gradeRanges as any).softLow?.toFixed(2)}-{gradeRanges && (gradeRanges as any).softHigh?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
