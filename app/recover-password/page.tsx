"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/validation';
import { useViewPasswordToggle } from '../../hooks/useViewPasswordToggle';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function RecoverPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({ email: '' });
  const [resetData, setResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [showMessage, setShowMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility toggles
  const { 
    isPasswordHidden: isNewPasswordHidden, 
    inputType: newPasswordInputType, 
    toggleViewPassword: toggleNewPassword 
  } = useViewPasswordToggle();
  
  const { 
    isPasswordHidden: isConfirmPasswordHidden, 
    inputType: confirmPasswordInputType, 
    toggleViewPassword: toggleConfirmPassword 
  } = useViewPasswordToggle();

  // Clear error when switching between modes
  useEffect(() => {
    setErrorMessage('');
  }, [token]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const onResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error!);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/recover-password', formData);
      setShowMessage(true);
      setSuccessMessage(response.data.message || 'Recovery email sent!');
      setErrorMessage('');
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setErrorMessage(errorResponse?.response?.data?.message ?? 'Failed to send recovery email');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordValidation = validatePassword(resetData.newPassword);
    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.error!);
      return;
    }

    // Validate password match
    const matchValidation = validatePasswordMatch(resetData.newPassword, resetData.confirmPassword);
    if (!matchValidation.isValid) {
      setErrorMessage(matchValidation.error!);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword: resetData.newPassword 
      });
      setResetSuccess(true);
      setResetSuccessMessage(response.data.message || 'Password reset successful!');
      setErrorMessage('');
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setErrorMessage(errorResponse?.response?.data?.message ?? 'Failed to reset password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render password reset form if token is present
  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme2 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-theme3 px-8 py-10">
              <h1 className='text-3xl font-bold text-white text-center'>Set New Password</h1>
              <p className='text-theme2 text-center mt-2 text-sm'>Enter your new password below</p>
            </div>

            {/* Content */}
            <div className='px-8 py-10'>
              {!resetSuccess ? (
                <form onSubmit={onResetSubmit}>
                  <div className="form-group mb-6">
                    <label className='block text-gray-800 text-sm font-semibold mb-3'>New Password</label>
                    <div className="relative">
                      <input 
                        type={newPasswordInputType} 
                        name="newPassword" 
                        value={resetData.newPassword} 
                        onChange={onResetChange} 
                        placeholder="Enter new password"
                        required 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors pr-12" 
                      />
                      <button 
                        type="button" 
                        onClick={toggleNewPassword} 
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {isNewPasswordHidden ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and a number
                    </p>
                  </div>
                  <div className="form-group mb-8">
                    <label className='block text-gray-800 text-sm font-semibold mb-3'>Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={confirmPasswordInputType} 
                        name="confirmPassword" 
                        value={resetData.confirmPassword} 
                        onChange={onResetChange} 
                        placeholder="Confirm new password"
                        required 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors pr-12" 
                      />
                      <button 
                        type="button" 
                        onClick={toggleConfirmPassword} 
                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {isConfirmPasswordHidden ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50'
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              ) : (
                <div className='text-center'>
                  <div className='mb-4 text-4xl'>✓</div>
                  <p className='text-gray-800 font-semibold mb-2'>{resetSuccessMessage}</p>
                  <p className='text-gray-600 text-sm mb-6'>You can now sign in with your new password.</p>
                  <a href='/login' className='inline-block bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
                    Sign In
                  </a>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="px-8 py-4 text-center text-red-600 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Footer Link */}
            <div className='border-t border-gray-200 px-8 py-4 text-center'>
              <a href='/login' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Back to sign in</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: email request form
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
                  disabled={isLoading}
                  className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  {isLoading ? 'Sending...' : 'Send Recovery Email'}
                </button>
              </form>
            ) : (
              <div className='text-center'>
                <div className='mb-4 text-4xl'>✓</div>
                <p className='text-gray-800 font-semibold mb-2'>{successMessage}</p>
                <p className='text-gray-600 text-sm mb-6'>Check your inbox for instructions to reset your password. The link will expire in 1 hour.</p>
                <a href='/login' className='text-theme3 hover:text-theme4 font-semibold transition-colors'>Back to login</a>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="px-8 py-4 text-center text-red-600 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Footer Link */}
          <div className='border-t border-gray-200 px-8 py-4 text-center'>
            <a href='/login' className='text-theme3 hover:text-theme4 font-semibold text-sm transition-colors'>Back to sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecoverPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-theme2">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-theme3"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RecoverPasswordContent />
    </Suspense>
  );
}
