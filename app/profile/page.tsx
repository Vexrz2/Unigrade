"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { MajorOptions } from '../../components/misc/SelectOptions';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import { useModal } from '../../hooks/useModal';

export default function ProfilePage() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const setUser = ctx?.setUser;
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', major: '' });
  const [message, setMessage] = useState('');
  const passwordModal = useModal();
  const deleteModal = useModal();
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState('');
  const messageBox = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user?.degree) setFormData({ username: user.username ?? '', email: user.email ?? '', major: user.degree.major ?? '' });
    else if (user?.username && user?.email) setFormData({ username: user.username, email: user.email, major: '' });
  }, [user]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as any);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
  };

  const updateUser = async (payload: any) => {
    try {
      const res = await api.patch('/users/update', payload);
      if (messageBox.current) messageBox.current.style.color = 'green';
      setMessage('Changes saved successfully!');
      setUser && setUser(res.data.updatedUser);
    } catch (err: any) {
      if (messageBox.current) messageBox.current.style.color = 'red';
      setMessage(err?.response?.data?.message ?? String(err));
      console.error(err?.response ?? err);
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
      setUser && setUser(null);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete('/users/delete');
      alert('Account deleted');
      deleteModal.closeModal();
      setUser && setUser(null);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const changeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);
    try {
      await api.post('/auth/change-password', formDataObj);
      alert('Password changed successfully!');
      passwordModal.closeModal();
    } catch (error: any) {
      setChangePasswordErrorMessage(error?.response?.data?.message ?? String(error));
      console.error(error?.response ?? error);
    }
  };

  return (
    <div className="profile-container bg-theme1 shadow-md rounded py-8 flex flex-col w-2/3 mx-auto items-center">
      <h2 className='text-3xl font-bold p-5 text-center'>Profile</h2>
      <form onSubmit={onSubmit} className='mt-10 flex flex-col items-center'>
        <div className="form-group mb-4">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Username</label>
          <input type="text" name="username" value={formData.username} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
        </div>
        <div className="form-group mb-4">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
          <input type="email" name="email" value={formData.email} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
        </div>
        <div className="form-group mb-4 w-full">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Major</label>
          <select value={formData.major} name='major' onChange={onChange} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
            <MajorOptions />
          </select>
        </div>
        <button type="submit" className='text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center'>Save changes</button>
      </form>
      <div className='message-box p-4  text-center mb-10' ref={messageBox}>{message}</div>
      <div className='flex mb-8 space-x-4'>
        <button onClick={passwordModal.openModal} className='change-password text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center'>Change password</button>
        <button onClick={logoutUser} className='logout text-lg bg-gray-500 shadow-sm text-white py-2 px-4 rounded-full text-center'>Logout</button>
      </div>
      <button onClick={deleteModal.openModal} className='text-sm bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded'>Delete account</button>
      <ChangePasswordModal isOpen={passwordModal.isOpen} onClose={passwordModal.closeModal} onSubmit={changeUserPassword} errorMessage={changePasswordErrorMessage} />
      <DeleteAccountModal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} deleteUser={deleteUser} />
    </div>
  );
}
