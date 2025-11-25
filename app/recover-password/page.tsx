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
      await api.post('/users/recover-password', formData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form-container bg-theme1 shadow-md rounded py-10 flex flex-col items-center w-2/3 mx-auto">
      <h2 className='text-4xl font-bold pb-5 text-center'>Recover password</h2>
      <form className='w-1/4 flex flex-col items-center' onSubmit={onSubmit}>
        <div className="form-group mb-4">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
          <input type="email" name="email" value={formData.email} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
        </div>
        <button className='text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center' type="submit">Recover Password</button>
      </form>
      {showMessage ? <p className="">Recovery email sent.</p> : null}
    </div>
  );
}
