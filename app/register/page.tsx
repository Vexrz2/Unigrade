"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email) {
      setErrorMessage('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/onboarding/check-email', { email });
      if (res.data.exists) {
        toast('Account exists! Please sign in.');
        router.push('/login');
      } else {
        // Store email in sessionStorage and redirect to onboarding
        sessionStorage.setItem('onboarding_email', email);
        router.push('/onboarding');
      }
    } catch {
      // If check fails, still proceed to onboarding
      sessionStorage.setItem('onboarding_email', email);
      router.push('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-theme3 px-8 py-10">
            <h1 className='text-4xl font-bold text-white text-center'>Get Started</h1>
            <p className='text-theme2 text-center mt-2 text-sm'>Join Unigrade to plan your future</p>
          </div>

          {/* Form */}
          <form className='px-8 py-10' onSubmit={handleContinue}>
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
              Sign up with Google
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
              <label className='block text-gray-800 text-sm font-semibold mb-2'>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                placeholder="you@example.com"
                required 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
            >
              {isLoading ? 'Checking...' : 'Next'}
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
