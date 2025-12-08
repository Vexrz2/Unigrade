"use client";

import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

export default function DeleteAccountModal({ isOpen, onClose, deleteUser }: { isOpen: boolean; onClose: () => void; deleteUser: () => void }) {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteUser();
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      tabIndex={-1} 
      onClick={handleBackdropClick} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-md mx-4" onClick={handleModalClick}>
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-500">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-white hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-white/20"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className='px-6 py-6'>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className='text-gray-800 font-semibold mb-2'>Warning: This action is permanent!</p>
              <p className='text-gray-700 text-sm'>
                You are about to delete your account. All your data, including courses, progress, and settings will be permanently removed. This action cannot be undone.
              </p>
            </div>
            
            <p className='text-gray-600 text-center mb-6'>
              Are you absolutely sure you want to continue?
            </p>
            
            {/* Action Buttons */}
            <div className='flex gap-3'>
              <button 
                onClick={onClose} 
                className='flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className='flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg'
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
