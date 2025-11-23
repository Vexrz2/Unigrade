"use client";

import React, { useState } from 'react';
import type { Course } from '../../types';

export default function AddCourse({ addCourse }: { addCourse: (data: Partial<Course>) => void }) {
  const [formData, setFormData] = useState({ courseName: '', courseGrade: 0, courseCredit: 0 });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as any);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse(formData);
  };

  return (
    <div className="form-container bg-theme1 shadow-md rounded px-30 pt-6 pb-8 mb-4 flex flex-col items-center mt-5">
      <h2 className='text-2xl font-bold pb-5 text-center'>Add course</h2>
      <form onSubmit={onSubmit} className='flex flex-col items-center'>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
          <input type="text" name="courseName" value={formData.courseName} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Grade</label>
          <input type="number" name="courseGrade" value={formData.courseGrade as any} onChange={onChange} required min={0} max={100} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Course credit</label>
          <input type="number" name="courseCredit" value={formData.courseCredit as any} onChange={onChange} required min={0} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <button type="submit" className='w-2/3 text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center'>Add</button>
      </form>
    </div>
  );
}
