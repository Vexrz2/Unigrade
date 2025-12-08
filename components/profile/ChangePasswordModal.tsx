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
    <div 
      tabIndex={-1} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-theme3">
            <h3 className="text-xl font-bold text-white">Change Password</h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-white hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-white/20"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={onSubmit} className='px-6 py-6'>
            <div className="space-y-5">
              <div className="form-group">
                <label className='block text-gray-700 text-sm font-semibold mb-2'>Current Password</label>
                <div className="relative">
                  <input 
                    type={isPasswordHidden ? "password" : "text"} 
                    name="currentPassword" 
                    value={currentPassword} 
                    onChange={onChange} 
                    required 
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    onClick={toggleViewPassword} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-theme3 transition-colors"
                  >
                    {isPasswordHidden ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className='block text-gray-700 text-sm font-semibold mb-2'>New Password</label>
                <div className="relative">
                  <input 
                    type={isPasswordHidden ? "password" : "text"} 
                    name="newPassword" 
                    value={newPassword} 
                    onChange={onChange} 
                    required 
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-gray-700"
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button" 
                    onClick={toggleViewPassword} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-theme3 transition-colors"
                  >
                    {isPasswordHidden ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
                {errorMessage}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className='flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className='flex-1 px-4 py-3 bg-theme3 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg'
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
