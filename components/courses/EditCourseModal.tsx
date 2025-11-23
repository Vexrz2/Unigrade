"use client";

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { Course } from '../../types';

export default function EditCourseModal({ isOpen, onClose, editCourse, currentCourse }: { isOpen: boolean; onClose: () => void; editCourse: (id: string, data: Partial<Course>) => void; currentCourse: Course | null }) {
  const [formData, setFormData] = useState({ courseName: '', courseGrade: 0, courseCredit: 0 });

  useEffect(() => {
    if (currentCourse) {
      setFormData({ courseName: currentCourse.courseName ?? '', courseGrade: currentCourse.courseGrade ?? 0, courseCredit: currentCourse.courseCredit ?? 0 });
    }
  }, [currentCourse]);

  if (!isOpen) return null;

  const { courseName, courseGrade, courseCredit } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as any);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCourse && currentCourse._id) {
      editCourse(currentCourse._id, formData);
    }
    onClose();
  };

  return (
    <div tabIndex={-1} className="modal-overlay overflow-y-auto flex flex-col overflow-x-hidden fixed top-0 right-0 left-0 z-0 justify-center items-center w-full md:inset-0 max-h-full bg-opacity-20 bg-black">
      <div className="w-1/4 modal-content relative bg-theme1 rounded-lg shadow p-4">
        <div className="flex items-center justify-between p-2 border-b rounded-t">
          <h3 className="text-xl  text-gray-900">Update course</h3>
          <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
            <FiX />
          </button>
        </div>
        <form onSubmit={onSubmit} className='flex flex-col items-center w-2/3 mx-auto mt-5'>
          <div className="form-group mb-4 w-full">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
            <input type="text" name="courseName" value={courseName} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="form-group mb-4 w-full">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Grade</label>
            <input type="number" name="courseGrade" value={courseGrade as any} onChange={onChange} required min={0} max={100} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="form-group mb-4 w-full">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Course credit</label>
            <input type="number" name="courseCredit" value={courseCredit as any} onChange={onChange} required min={0} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <button type="submit" className='w-2/3 text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center'>Save changes</button>
        </form>
      </div>
    </div>
  );
}
