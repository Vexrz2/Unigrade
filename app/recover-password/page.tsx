"use client";

import React, { useState } from 'react';
import api from '../../lib/api';

export default function RecoverPasswordPage() {
  const [formData, setFormData] = useState({ email: '' });
  const [showMessage, setShowMessage] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setShowMessage(true);
      await api.post('/auth/recover-password', formData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-theme3 px-8 py-10">
            <h1 className='text-3xl font-bold text-white text-center'>Reset Password</h1>
            <p className='text-theme2 text-center mt-2 text-sm'>We&apos;ll send you instructions to reset your password</p>
          </div>

          {/* Content */}
          <div className='px-8 py-10'>
            {!showMessage ? (
              <form onSubmit={onSubmit}>
                <div className="form-group mb-8">
                  <label className='block text-gray-800 text-sm font-semibold mb-3'>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={onChange} 
                    placeholder="you@example.com"
                    required 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors" 
                  />
                </div>
                <button 
                  type="submit" 
                  className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors'
                >
                  Send Recovery Email
                </button>
              </form>
            ) : (
              <div className='text-center'>
                <div className='mb-4 text-4xl'>✓</div>
                <p className='text-gray-800 font-semibold mb-2'>Recovery email sent!</p>
                <p className='text-gray-600 text-sm mb-6'>Check your inbox for instructions to reset your password. If you don&apos;t see it, check your spam folder.</p>
                <a href='/login' className='text-theme3 hover:text-theme4 font-semibold transition-colors'>Back to login</a>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className='border-t border-gray-200 px-8 py-4 text-center'>
            <a href='/login' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Back to sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
