"use client";

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useViewPasswordToggle } from '../../hooks/useViewPasswordToggle';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const ctx = useContext(UserContext);
  const setUser = ctx?.setUser;
  const { isPasswordHidden, inputType, toggleViewPassword } = useViewPasswordToggle();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      if (setUser) setUser(res.data.user);
      toast('Welcome back!');
      // Redirect to onboarding if not completed, otherwise dashboard
      const redirectPath = res.data.user?.onboardingCompleted === false ? '/onboarding' : '/dashboard';
      router.push(redirectPath);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setFormData({ email: formData.email, password: '' });
      toast.error(errorResponse?.response?.data?.message ?? 'Login failed');
      setErrorMessage(errorResponse?.response?.data?.message ?? String(err));
      console.error(errorResponse?.response?.data ?? err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-theme3 px-8 py-10">
            <h1 className='text-4xl font-bold text-white text-center'>Welcome Back</h1>
            <p className='text-theme2 text-center mt-2 text-sm'>Sign in to your Unigrade account</p>
          </div>

          {/* Form */}
          <form className='px-8 py-10' onSubmit={onSubmit}>
            {errorMessage && (
              <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
                <p className='text-red-700 text-sm font-medium'>{errorMessage}</p>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 mb-6"
            >
              <FcGoogle size={24} />
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className='block text-gray-800 text-sm font-semibold mb-3'>Email Address</label>
              <input 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={onChange} 
                placeholder="you@example.com"
                required 
              />
            </div>

            <div className="form-group mb-8">
              <label className='block text-gray-800 text-sm font-semibold mb-3'>Password</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors pr-12" 
                  type={inputType} 
                  name="password" 
                  value={formData.password} 
                  onChange={onChange} 
                  placeholder="••••••••"
                  required 
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

            <button 
              type="submit" 
              className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors'
            >
              Sign In
            </button>
          </form>

          {/* Links */}
          <div className='border-t border-gray-200 px-8 py-6'>
            <div className='text-center mb-4'>
              <a href='/recover-password' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Forgot your password?</a>
            </div>
            <div className='text-center'>
              <span className='text-gray-600 text-sm'>Don&apos;t have an account? </span>
              <a href='/register' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Sign up here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
