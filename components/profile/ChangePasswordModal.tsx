"use client";

import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useDoubleViewPasswordToggle } from '../../hooks/useViewPasswordToggle';

export default function ChangePasswordModal({ isOpen, onClose, onSubmit, errorMessage }: { isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; errorMessage?: string }) {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const { isPasswordHidden, toggleViewPassword } = useDoubleViewPasswordToggle();
  if (!isOpen) return null;

  const { currentPassword, newPassword } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div tabIndex={-1} className="modal-overlay overflow-y-auto flex flex-col overflow-x-hidden fixed top-0 right-0 left-0 z-0 justify-center items-center w-full md:inset-0 max-h-full bg-opacity-60 bg-black">
      <div className="w-1/4 modal-content relative bg-theme1 rounded-lg shadow p-4">
        <div className="flex items-center justify-between p-2 border-b rounded-t">
          <h3 className="text-xl  text-gray-900">Change password</h3>
          <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
            <FiX />
          </button>
        </div>
        <form onSubmit={onSubmit} className='w-3/4 mx-auto my-4 flex flex-col items-center'>
          <div className="form-group mb-4 relative w-full">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Current password</label>
            <input type={isPasswordHidden ? "password" : "text"} name="currentPassword" value={currentPassword} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            <button type="button" onClick={toggleViewPassword} className="absolute inset-y-12 end-0 flex items-center px-3 cursor-pointer rounded-e-md focus:outline-none">
              {isPasswordHidden ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
          <div className="form-group mb-4 relative w-full">
            <label className='block text-gray-700 text-sm font-bold mb-2'>New password</label>
            <input type={isPasswordHidden ? "password" : "text"} name="newPassword" value={newPassword} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            <button type="button" onClick={toggleViewPassword} className="absolute inset-y-12 end-0 flex items-center px-3 cursor-pointer rounded-e-md focus:outline-none">
              {isPasswordHidden ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
          <button type="submit" className='text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center'>Change password</button>
          <div className='register-error-message p-4 text-red-600  text-center'>
            {errorMessage}
          </div>
        </form>
      </div>
    </div>
  );
}
