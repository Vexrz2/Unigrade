"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { UserContext } from '../../context/UserContext';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import { useModal } from '../../hooks/useModal';
import toast from 'react-hot-toast';
import { ProfileSkeleton } from '@/components/Skeleton';

export default function ProfilePage() {
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  const setUser = ctx?.setUser;
  const loading = ctx?.loading ?? true;
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const passwordModal = useModal();
  const deleteModal = useModal();
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  useEffect(() => {
    const setUserData = async () => {
      if (user?.username && user?.email) {
        setFormData({ username: user.username, email: user.email });
      }
      if (user?.profilePicture) setProfilePicture(user.profilePicture);
    };
    setUserData();
  }, [user]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);

      updateUser({ ...formData, profilePictureFile: file });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
  };

  const updateUser = async (payload: { username: string; email: string; profilePictureFile?: File | null }) => {
    try {
      const formData = new FormData();
      formData.append('username', payload.username);
      formData.append('email', payload.email);
      formData.append('profilePicture', payload.profilePictureFile || profilePictureFile || new Blob());
      
      const res = await api.patch('/users/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
    <div className="min-h-screen bg-theme2 px-4 py-12">
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
            {/* Profile Picture */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Profile Picture</h2>
              <div className="flex items-center gap-6">
                {/* Profile Picture Display */}
                <div className="relative">
                  {profilePicture ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-2 border-theme3 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-theme3 bg-theme3 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Upload Section */}
                <div className="flex-1">
                  <div className="text-gray-800 font-semibold mb-1">{user?.username}</div>
                  <div className="text-sm text-gray-600 mb-3">{user?.email}</div>
                  {user?.authProvider === 'google' && (
                    <div className="text-xs text-theme3 font-semibold mb-3">Google Account</div>
                  )}
                  <label className="cursor-pointer inline-block bg-theme3 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onFileChange}
                      className="hidden"
                    />
                    Upload New Picture
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (max. 5MB)</p>
                </div>
              </div>
            </div>

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

                <button
                  type="submit"
                  className='w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors'
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Account Actions</h2>
                <div className="space-y-4">
                  {user?.authProvider === 'local' && (
                    <button
                      onClick={passwordModal.openModal}
                      className='w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors'
                    >
                      <div className='font-semibold text-gray-800'>Change Password</div>
                      <div className='text-sm text-gray-600'>Update your password regularly for security</div>
                    </button>
                  )}
                  <button
                    onClick={logoutUser}
                    className='w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors'
                  >
                    <div className='font-semibold text-gray-800'>Logout</div>
                    <div className='text-sm text-gray-600'>Sign out of your account</div>
                  </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-red-500">
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Danger Zone</h2>
              <div className="space-y-4">
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
