"use client";

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { MajorOptions } from '../../components/misc/SelectOptions';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDoubleViewPasswordToggle } from '../../hooks/useViewPasswordToggle';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', email: '', major: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const ctx = useContext(UserContext);
  const setUser = ctx?.setUser;
  const { isPasswordHidden, inputType, toggleViewPassword } = useDoubleViewPasswordToggle();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      if (setUser) setUser(res.data.user);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message ?? 'Registration failed');
      setErrorMessage(errorResponse?.response?.data?.message ?? String(err));
      console.error(errorResponse?.response?.data ?? err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-theme4 to-theme2 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-theme4 to-theme3 px-8 py-10">
            <h1 className='text-4xl font-bold text-white text-center'>Create Account</h1>
            <p className='text-theme2 text-center mt-2 text-sm'>Join Unigrade to plan your future</p>
          </div>

          {/* Form */}
          <form className='px-8 py-10' onSubmit={onSubmit}>
            {errorMessage && (
              <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
                <p className='text-red-700 text-sm font-medium'>{errorMessage}</p>
              </div>
            )}

            <div className="form-group mb-5">
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Username</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={onChange} 
                placeholder="Choose a username"
                required 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors" 
              />
            </div>

            <div className="form-group mb-5">
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Email Address</label>
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

            <div className="form-group mb-5">
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Password</label>
              <div className="relative">
                <input 
                  type={inputType} 
                  name="password" 
                  value={formData.password} 
                  onChange={onChange} 
                  placeholder="••••••••"
                  required 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors pr-12" 
                />
                <button 
                  type="button" 
                  onClick={toggleViewPassword} 
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {isPasswordHidden ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group mb-5">
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Confirm Password</label>
              <div className="relative">
                <input 
                  type={inputType} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={onChange} 
                  placeholder="••••••••"
                  required 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors pr-12" 
                />
                <button 
                  type="button" 
                  onClick={toggleViewPassword} 
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {isPasswordHidden ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Major</label>
              <select 
                value={formData.major} 
                name='major' 
                onChange={onChange} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
              >
                <MajorOptions />
              </select>
            </div>

            <button 
              type="submit" 
              className='w-full bg-linear-to-r from-theme3 to-theme4 hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition-shadow duration-200'
            >
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className='border-t border-gray-200 px-8 py-4 text-center'>
            <span className='text-gray-600 text-sm'>Already have an account? </span>
            <a href='/login' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Sign in here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
