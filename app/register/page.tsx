"use client";

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { MajorOptions } from '../../components/misc/SelectOptions';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDoubleViewPasswordToggle } from '../../hooks/useViewPasswordToggle';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '', email: '', major: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const ctx = useContext(UserContext);
  const setUser = ctx?.setUser;
  const { isPasswordHidden, passwordInputRef1, passwordInputRef2, toggleViewPassword } = useDoubleViewPasswordToggle();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      setUser && setUser(res.data.user);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? String(err));
      console.error(err?.response?.data ?? err);
    }
  };

  return (
    <div className="form-container bg-theme1 shadow-md rounded py-10 flex flex-col items-center w-2/3 mx-auto">
      <h2 className='text-4xl pb-5 text-center font-bold'>Register</h2>
      <form className='w-1/4 flex flex-col items-center' onSubmit={onSubmit}>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Username</label>
          <input type="text" name="username" value={formData.username} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
        </div>
        <div className="form-group mb-4 relative w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
          <input ref={passwordInputRef1} type="password" name="password" value={formData.password} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <button type="button" onClick={toggleViewPassword} className="absolute inset-y-12 end-0 flex items-center px-3 cursor-pointer rounded-e-md focus:outline-none">
            {isPasswordHidden ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>
        <div className="form-group mb-4 relative w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Confirm password</label>
          <input ref={passwordInputRef2} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
          <button type="button" onClick={toggleViewPassword} className="absolute inset-y-12 end-0 flex items-center px-3 cursor-pointer rounded-e-md focus:outline-none">
            {isPasswordHidden ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
          <input type="email" name="email" value={formData.email} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
        </div>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Major</label>
          <select value={formData.major} name='major' onChange={onChange} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
            {/* MajorOptions component may need to be ported; placeholder option kept */}
            <option value="">Select major</option>
          </select>
        </div>
        <button type="submit" className='w-2/3 text-xl bg-theme3 shadow-sm text-white py-1 px-2 rounded-full text-center'>Register</button>
      </form>
      <div className='register-error-message p-4 text-red-600  text-center'>
        {errorMessage}
      </div>
    </div>
  );
}
