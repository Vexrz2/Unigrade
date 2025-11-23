"use client";

import React from 'react';
import { FiX } from 'react-icons/fi';

export default function DeleteAccountModal({ isOpen, onClose, deleteUser }: { isOpen: boolean; onClose: () => void; deleteUser: () => void }) {
  if (!isOpen) return null;

  return (
    <div tabIndex={-1} onClick={onClose} className="modal-overlay overflow-y-auto flex flex-col overflow-x-hidden fixed top-0 right-0 left-0 z-0 justify-center items-center w-full md:inset-0 max-h-full bg-opacity-60 bg-black">
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="modal-content relative bg-theme1 rounded-lg shadow p-4">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl  text-gray-900">Account deletion</h3>
            <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
              <FiX />
            </button>
          </div>
          <p className='font-bold mt-4 mb-20 text-lg w-2/3 mx-auto'>You are about to delete your account. This action cannot be reversed. Are you sure?</p>
          <div className='flex justify-center space-x-5'>
            <button onClick={deleteUser} className='delete-user-button bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded'>Delete</button>
            <button onClick={onClose} className='hide-delete-prompt bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 border-b-4 border-gray-700 hover:border-gray-500 rounded'>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
