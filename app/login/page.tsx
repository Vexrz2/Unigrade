"use client";

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useViewPasswordToggle } from '../../hooks/useViewPasswordToggle';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const ctx = useContext(UserContext);
  const setUser = ctx?.setUser;
  const { isPasswordHidden, passwordInputRef, toggleViewPassword } = useViewPasswordToggle();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      setUser && setUser(res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setFormData({ email: formData.email, password: '' });
      setErrorMessage(err?.response?.data?.message ?? String(err));
      console.error(err?.response?.data ?? err);
    }
  };

  return (
    <>
      <div className="form-container bg-theme1 shadow-md rounded py-10 flex flex-col items-center w-2/3 mx-auto">
        <h2 className='text-4xl pb-5 font-bold text-center'>Login</h2>
        <form className='w-1/4 flex flex-col items-center mb-3' onSubmit={onSubmit}>
          <div className="form-group mb-4">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" name="email" value={formData.email} onChange={onChange} required />
          </div>
          <div className="form-group mb-4 relative">
            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
            <input ref={passwordInputRef} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" name="password" value={formData.password} onChange={onChange} required />
            <button type="button" onClick={toggleViewPassword} className="absolute inset-y-12 end-0 flex items-center px-3 cursor-pointer rounded-e-md focus:outline-none">
              {isPasswordHidden ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
          <div className='w-2/3 text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center'>
            <button className='w-full' type="submit">Log In</button>
          </div>
        </form>
        <div className='mx-auto mb-4'>
          <a href='/recover-password' className='hover:underline'><p>Forgot password?</p></a>
        </div>
        <div className='mx-auto'>
          <a href='/register' className='text-purple-400'>Create an account</a>
        </div>
      </div >
      <div className='register-error-message p-4 text-red-600  text-center'>
        {errorMessage}
      </div>
    </>
  );
}
