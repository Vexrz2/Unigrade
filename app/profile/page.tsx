"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import { MajorOptions } from '../../components/misc/SelectOptions';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import { useModal } from '../../hooks/useModal';
import { UserProfileData } from '@/types';
import toast from 'react-hot-toast';
import { ProfileSkeleton } from '@/components/Skeleton';

export default function ProfilePage() {
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  const setUser = ctx?.setUser;
  const loading = ctx?.loading ?? true;
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', major: '' });
  const passwordModal = useModal();
  const deleteModal = useModal();
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState('');
  useEffect(() => {
    const setUserData = async () => {
      if (user?.degree) await setFormData({ username: user.username ?? '', email: user.email ?? '', major: user.degree.major ?? '' });
    else if (user?.username && user?.email) await setFormData({ username: user.username, email: user.email, major: '' });
    };
    setUserData();
  }, [user]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as UserProfileData);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
  };

  const updateUser = async (payload: { username: string; email: string; major: string }) => {
    try {
      const res = await api.patch('/users/update', payload);
      toast.success('Profile updated successfully!');
      if (setUser) setUser(res.data.updatedUser);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message ?? 'Failed to update profile');
      console.error(errorResponse?.response ?? err);
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
      toast('Logged out successfully');
      if (setUser) setUser(null);
      router.push('/');
    } catch (err) {
      toast.error('Failed to logout');
      console.error(err);
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete('/users/delete');
      toast('Account deleted successfully');
      deleteModal.closeModal();
      if (setUser) setUser(null);
      router.push('/');
    } catch (err) {
      toast.error('Failed to delete account');
      console.error(err);
    }
  };

  const changeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);
    try {
      await api.post('/auth/change-password', formDataObj);
      toast.success('Password changed successfully!');
      passwordModal.closeModal();
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      setChangePasswordErrorMessage(errorResponse?.response?.data?.message ?? String(error));
      console.error(errorResponse?.response ?? error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-theme2 to-theme1 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>Profile Settings</h1>
          <p className='text-gray-600'>Manage your account information</p>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Account Information</h2>
              <form onSubmit={onSubmit} className='space-y-6'>
                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
                  />
                </div>

                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors"
                  />
                </div>

                <div className="form-group">
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Major</label>
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
                  className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors'
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Security</h2>
              <div className="space-y-4">
                <button
                  onClick={passwordModal.openModal}
                  className='w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors'
                >
                  <div className='font-semibold text-gray-800'>Change Password</div>
                  <div className='text-sm text-gray-600'>Update your password regularly for security</div>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-red-500">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Danger Zone</h2>
              <div className="space-y-4">
                <button
                  onClick={logoutUser}
                  className='w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors'
                >
                  <div className='font-semibold text-gray-800'>Logout</div>
                  <div className='text-sm text-gray-600'>Sign out of your account</div>
                </button>

                <button
                  onClick={deleteModal.openModal}
                  className='w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors'
                >
                  <div className='font-semibold text-red-700'>Delete Account</div>
                  <div className='text-sm text-red-600'>Permanently delete your account and all data</div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <ChangePasswordModal isOpen={passwordModal.isOpen} onClose={passwordModal.closeModal} onSubmit={changeUserPassword} errorMessage={changePasswordErrorMessage} />
        <DeleteAccountModal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} deleteUser={deleteUser} />
      </div>
    </div>
  );
}
